import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PROMPTS, SCENARIO_PROMPTS, FORMATO_SIMULADOR, resumoPerfilServidor } from "./prompts"

// Mantenha igual ao app (page.tsx). false = cobrança ligada.
const BETA_GRATIS = false
// Tetos diários por usuário (rede de segurança contra abuso/custo, NÃO limite de produto:
// ficam bem acima do que um humano usa num dia, para o Premium seguir sendo "ilimitado" de fato).
// Dimensionados pela margem: a mensalidade de R$29,90 rende ~R$24 líquidos, e 80 chamadas
// de chat/dia já custam ~US$0,28 — quem encostar no teto todo dia dá prejuízo sozinho.
// O grátis tem 10 msgs do Professor na tela (PROF_LIMIT em page.tsx); as 30 aqui cobrem
// também ajuda_licao/dica_pron e as retentativas.
const LIMIT_FREE = 30
const LIMIT_PREMIUM = 80
// Teto diário por IP (todas as contas somadas — barra farm de contas num IP só).
// 10x o Premium: não atrapalha escola/escritório com vários alunos na mesma rede.
const LIMIT_IP = 800
// Preço do claude-haiku-4-5 (US$ por token) para o registro de custo.
const PRECO_IN = 1 / 1_000_000
const PRECO_OUT = 5 / 1_000_000

const NIVEIS = ["A1", "A2", "B1", "B2", "C1", "C2"]
const MODES = ["professor", "simulador", "ajuda_licao", "dica_pron", "relatorio_fluencia"]

// Resposta amigável no formato que o app já entende (ele lê content[0].text).
const amigavel = (texto: string, status = 200) =>
  NextResponse.json({ content: [{ type: "text", text: texto }] }, { status })

// Rota do Professor IA / Simulador. Protegida:
// (1) exige login; (2) PROMPTS SÓ NO SERVIDOR (o cliente manda apenas "mode");
// (3) limite diário ATÔMICO no banco, fail-closed; (4) teto por IP; (5) custo registrado.
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 1) Autenticação: só usuários logados podem gastar a API.
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  if (!token || !url || !anon || !service) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  let userId = ""
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    userId = data.user.id
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2) Validação do payload. O prompt do sistema NUNCA vem do cliente.
  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }) }
  if (body.system !== undefined) {
    // Cliente antigo (aba aberta antes do deploy) ou tentativa de injetar prompt.
    return amigavel("O app foi atualizado! Feche e abra de novo para continuar. 🔄", 400)
  }
  const { messages } = body
  const mode = String(body.mode || "")
  if (!MODES.includes(mode)) return NextResponse.json({ error: "invalid mode" }, { status: 400 })
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return NextResponse.json({ error: "invalid messages" }, { status: 400 })
  }
  const totalChars = messages.reduce(
    (acc: number, m: any) => acc + (typeof m?.content === "string" ? m.content.length : 0), 0)
  if (totalChars > 20000) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 })
  }

  const admin = createClient(url, service)

  // 3) Trava de uso diário ATÔMICA no servidor + teto por IP. FAIL-CLOSED:
  // se a verificação falhar, bloqueia (proteção de custo vem antes da conveniência).
  try {
    const ip = (req.headers.get("x-forwarded-for") || "sem-ip").split(",")[0].trim()
    const [{ data: prog }, { data: perfil }] = await Promise.all([
      admin.from("progresso").select("is_premium, premium_expira, perfil_ia, xp, streak, licoes_concluidas").eq("user_id", userId).maybeSingle(),
      admin.from("profiles").select("nome, trial_expira").eq("id", userId).maybeSingle(),
    ])
    const emTrial = !!perfil?.trial_expira && new Date(perfil.trial_expira) > new Date()
    const pagoAtivo = !!prog?.is_premium && (!prog?.premium_expira || new Date(prog.premium_expira) > new Date())
    const premium = BETA_GRATIS || pagoAtivo || emTrial
    // Freemium de verdade: sem trial e sem assinatura o aluno NÃO é barrado (nada de 402);
    // ele cai no teto do grátis (LIMIT_FREE), que já cobre as 10 msgs/dia da tela + ajuda de
    // lição/dica de pronúncia. Premium (ou trial) usa o teto de uso justo (LIMIT_PREMIUM).
    const limite = premium ? LIMIT_PREMIUM : LIMIT_FREE

    const [{ data: okUser, error: e1 }, { data: okIp, error: e2 }] = await Promise.all([
      admin.rpc("incrementa_uso", { p_user: userId, p_tipo: "chat", p_limite: limite }),
      admin.rpc("incrementa_ip", { p_ip: ip, p_limite: LIMIT_IP }),
    ])
    if (e1 || e2) throw new Error("rpc_falhou")
    if (okUser === false || okIp === false) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 })
    }

    // 4) Monta o prompt do sistema NO SERVIDOR.
    let system = ""
    const nivelAluno = NIVEIS.includes(body.nivel) ? body.nivel : "A1"
    const perfilTxt = resumoPerfilServidor(perfil?.nome || "", nivelAluno, prog)
    // Quem está no A1/A2 é quem mais desiste. Jargão de gramática com esse aluno é o jeito
    // mais rápido de fazer ele fechar o app, então o Vô ganha regras extras de simplicidade.
    if (mode === "professor") system = PROMPTS.professor + (nivelAluno === "A1" || nivelAluno === "A2" ? PROMPTS.professor_basico : "") + perfilTxt
    else if (mode === "simulador") {
      const sp = SCENARIO_PROMPTS[String(body.scenarioId || "")]
      if (!sp) return NextResponse.json({ error: "invalid scenario" }, { status: 400 })
      system = sp + FORMATO_SIMULADOR + perfilTxt
    } else system = PROMPTS[mode]

    // 5) Chama a Anthropic.
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system, messages }),
    })
    if (!res.ok) {
      return amigavel("Tô um pouco sobrecarregado agora 😅 Tenta de novo daqui a pouquinho, tá?")
    }
    const data = await res.json()

    // 6) Registra o custo real (tokens de entrada/saída) — best-effort.
    try {
      const custo = (data?.usage?.input_tokens || 0) * PRECO_IN + (data?.usage?.output_tokens || 0) * PRECO_OUT
      if (custo > 0) admin.rpc("registra_custo", { p_user: userId, p_custo: custo }).then(() => {})
    } catch {}

    return NextResponse.json(data)
  } catch {
    // Fail-closed: sem conseguir verificar o limite, não gastamos a API.
    return amigavel("Tô um pouco sobrecarregado agora 😅 Tenta de novo daqui a pouquinho, tá?", 503)
  }
}
