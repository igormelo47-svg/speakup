import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// ESTREIA FALADA — a primeira coisa que acontece na vida do aluno dentro do app.
//
// Por que esta rota existe: o anúncio vende "você trava na hora de falar" e o app
// entregava, nos primeiros 90 segundos, duas frases prontas para ler em voz alta e
// uma nota de pronúncia — ou seja, um exercício. Isso é o que o Duolingo faz de
// graça e melhor. O que ninguém copia é um professor que OUVE o aluno e devolve
// UMA COISA VERDADEIRA sobre o inglês DELE.
//
// A tela chama esta rota duas vezes:
//   etapa 'abrir'    → o professor abre a conversa em português (usando a trava e o
//                      interesse que o aluno acabou de contar no onboarding) e faz
//                      UMA pergunta simples em inglês.
//   etapa 'analisar' → recebe a transcrição do que o aluno falou e devolve o ACHADO:
//                      um erro real, explicado em português, com a forma certa — ou,
//                      quando não há erro, um elogio específico e a próxima armadilha.
//
// O achado volta com um `topico` de uma lista fechada. Ele vira `perfil_ia.topicos_fracos`
// no cliente, que é o que alimenta a lição do dia seguinte, a revisão e o push. É assim
// que "IA que lembra de você" deixa de ser promessa de marketing e vira mecanismo.
// ---------------------------------------------------------------------------

// Mantenha igual ao app (page.tsx) e ao chat. false = cobrança ligada.
const BETA_GRATIS = false
// Mesmo teto e mesmo contador do chat: a estreia é 2 chamadas de IA, cai no mesmo balde.
const LIMIT_PREMIUM = 80
const LIMIT_IP = 800
const PRECO_IN = 1 / 1_000_000
const PRECO_OUT = 5 / 1_000_000

const NIVEIS = ["A1", "A2", "B1", "B2", "C1", "C2"]

// Lista FECHADA de tópicos. O cliente grava isto em topicos_fracos e outras telas leem
// esse campo — texto livre do modelo aqui viraria lixo no perfil do aluno.
const TOPICOS = [
  "to_be_idade", "to_be_geral", "presente_simples_s", "presente_continuo",
  "passado_simples", "passado_irregular", "futuro", "presente_perfeito",
  "artigos", "plural", "preposicoes", "ordem_das_palavras",
  "falso_cognato", "vocabulario", "pronuncia_th", "pronuncia_ed",
  "pronuncia_r", "pronuncia_h", "pronuncia_vogal", "fluencia",
  "respondeu_em_portugues", "sem_erro",
] as const

// Nome do erro em PORTUGUÊS, do jeito que o aluno vai ler. Isto existe porque
// `topicos_fracos` não é campo interno: ele aparece cru em quatro lugares — o card
// "Treino do SEU erro" (lib/missao.ts), o e-mail de lembrete, o e-mail do dia 2 e o
// card "Eu lembro de você" no chat (que ainda manda o texto para o professor). Gravar
// o slug ali faria o app dizer «A gente ainda tem que apertar: to_be_idade» — cara de
// software quebrado justamente na tela que vende "uma IA que lembra de você".
// O modelo devolve o rótulo; este mapa é a rede de segurança quando ele não devolve.
const ROTULOS: Record<string, string> = {
  to_be_idade: "idade com o verbo to be",
  to_be_geral: "o verbo to be",
  presente_simples_s: "o s do presente (he works)",
  presente_continuo: "o presente contínuo (-ing)",
  passado_simples: "o passado simples",
  passado_irregular: "passado dos verbos irregulares",
  futuro: "falar do futuro",
  presente_perfeito: "o presente perfeito",
  artigos: "os artigos a, an e the",
  plural: "o plural",
  preposicoes: "as preposições (in, on, at)",
  ordem_das_palavras: "a ordem das palavras na frase",
  falso_cognato: "falsos cognatos",
  vocabulario: "vocabulário",
  pronuncia_th: "o som do th",
  pronuncia_ed: "a terminação -ed",
  pronuncia_r: "o r no fim das palavras",
  pronuncia_h: "o h aspirado",
  pronuncia_vogal: "as vogais longas",
  fluencia: "soltar a fala sem travar",
  respondeu_em_portugues: "responder em inglês sem travar",
  sem_erro: "manter o ritmo da conversa",
}

const SISTEMA_ABRIR = `Você é um professor de inglês brasileiro conversando com um aluno NOVO, no primeiro minuto de uso do app. Ele tem medo de falar.

Devolva SOMENTE um JSON válido, sem markdown, sem cercas de código, no formato:
{"abertura_pt":"...","pergunta_en":"..."}

abertura_pt: UMA frase em português, no máximo 22 palavras, falando diretamente com o aluno sobre a trava que ele acabou de relatar. Calorosa e específica — nada de "vamos começar sua jornada". Não use emoji.
pergunta_en: UMA pergunta em inglês, simples, respondível em 5 a 15 palavras, ligada ao interesse ou à trava do aluno. Adeque ao nível informado: em A1/A2 use presente simples e vocabulário do dia a dia. Nunca use gíria. Não use emoji.

Regra dura: a pergunta tem que ser respondível por alguém que trava. Se o nível for A1, pergunte algo como "What do you do every day?" e não algo aberto demais.`

const SISTEMA_ANALISAR = `Você é um professor de inglês brasileiro. O aluno acabou de FALAR em voz alta pela primeira vez no app, respondendo a uma pergunta. Você recebe a transcrição do áudio dele.

Sua tarefa é devolver UM achado: uma coisa verdadeira e específica sobre o inglês DELE. Não é uma nota, não é um relatório, não é uma lista.

Devolva SOMENTE um JSON válido, sem markdown, sem cercas de código, no formato:
{"elogio":"...","achado":"...","errado":"...","certo":"...","porque":"...","topico":"...","rotulo":"..."}

elogio: UMA frase curta em português apontando algo concreto que ele ACERTOU. Tem que ser verificável na fala dele (uma palavra, uma estrutura, ter respondido em inglês). Nunca elogio genérico do tipo "muito bem".
achado: UMA frase em português nomeando o erro mais importante da fala dele. Direta, sem rodeio, sem culpa. Se for uma armadilha clássica do português, diga isso ("essa é a armadilha número 1 do brasileiro").
errado: o trecho EXATO que ele falou, em inglês, com o erro. String curta. Se não houver erro, string vazia.
certo: o mesmo trecho corrigido. String curta. Se não houver erro, string vazia.
porque: UMA frase em português explicando a regra em linguagem de gente, sem jargão gramatical. Nada de "verbo auxiliar" ou "particípio" com aluno de A1/A2.
topico: exatamente um destes valores: ${TOPICOS.join(", ")}.
rotulo: o nome do erro em português, do jeito que um professor falaria, em minúsculas, de 2 a 5 palavras, sem ponto final. Exemplos: "idade com o verbo to be", "passado dos verbos irregulares", "o som do th". Este texto aparece para o aluno dentro de uma frase ("a gente ainda tem que apertar: ..."), então tem que caber ali naturalmente — nada de frase inteira nem de termo técnico.

Regras duras:
- NUNCA invente um erro que não está na transcrição. Se ele falou certo, use topico "sem_erro", deixe errado/certo vazios e no achado aponte a PRÓXIMA armadilha que ele vai encontrar, com exemplo.
- Se ele respondeu em PORTUGUÊS (com medo, ou por não saber), não corrija gramática: use topico "respondeu_em_portugues", elogie ter falado, e no campo "certo" coloque a frase dele traduzida para inglês simples, para ele repetir.
- Se a transcrição estiver vazia, sem sentido ou for só ruído, use topico "fluencia", achado "Não consegui te ouvir direito dessa vez.", errado e certo vazios.
- Fale sempre "você". Nunca use emoji. Nunca escreva mais que o pedido.`

function so<T>(v: any, max = 400): string {
  return String(v ?? "").slice(0, max).trim()
}

// O modelo às vezes embrulha o JSON em ```json ... ```. Tira a cerca antes de parsear.
function parseJson(txt: string): any | null {
  const limpo = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
  const i = limpo.indexOf("{")
  const f = limpo.lastIndexOf("}")
  if (i < 0 || f <= i) return null
  try { return JSON.parse(limpo.slice(i, f + 1)) } catch { return null }
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 1) Autenticação — mesmo esquema de /api/chat.
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  if (!token || !url || !anon || !service) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  let userId = ""
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    userId = data.user.id
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2) Payload. O prompt do sistema NUNCA vem do cliente.
  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }) }
  const etapa = String(body.etapa || "")
  if (etapa !== "abrir" && etapa !== "analisar") return NextResponse.json({ error: "invalid etapa" }, { status: 400 })
  const nivel = NIVEIS.includes(body.nivel) ? body.nivel : "A1"
  const trava = so(body.trava, 120)
  const interesses = Array.isArray(body.interesses) ? body.interesses.slice(0, 5).map((i: any) => so(i, 40)).join(", ") : ""
  const nome = so(body.nome, 40)
  const pergunta = so(body.pergunta, 200)
  const texto = so(body.texto, 600)
  if (etapa === "analisar" && !texto) return NextResponse.json({ error: "sem_texto" }, { status: 400 })

  const admin = createClient(url, service)

  try {
    // 3) Paywall + limite diário, iguais ao chat. Fail-closed.
    const ip = (req.headers.get("x-forwarded-for") || "sem-ip").split(",")[0].trim()
    const [{ data: prog }, { data: perfil }] = await Promise.all([
      admin.from("progresso").select("is_premium, premium_expira").eq("user_id", userId).maybeSingle(),
      admin.from("profiles").select("trial_expira").eq("id", userId).maybeSingle(),
    ])
    const emTrial = !!perfil?.trial_expira && new Date(perfil.trial_expira) > new Date()
    const pagoAtivo = !!prog?.is_premium && (!prog?.premium_expira || new Date(prog.premium_expira) > new Date())
    if (!BETA_GRATIS && !pagoAtivo && !emTrial) return NextResponse.json({ error: "premium_necessario" }, { status: 402 })

    const [{ data: okUser, error: e1 }, { data: okIp, error: e2 }] = await Promise.all([
      admin.rpc("incrementa_uso", { p_user: userId, p_tipo: "chat", p_limite: LIMIT_PREMIUM }),
      admin.rpc("incrementa_ip", { p_ip: ip, p_limite: LIMIT_IP }),
    ])
    if (e1 || e2) throw new Error("rpc_falhou")
    if (okUser === false || okIp === false) return NextResponse.json({ error: "rate_limited" }, { status: 429 })

    // 4) Prompt montado no servidor.
    const contexto = [
      nome ? `Nome do aluno: ${nome}.` : "",
      `Nível: ${nivel}.`,
      trava ? `Onde ele trava: ${trava}.` : "",
      interesses ? `Interesses: ${interesses}.` : "",
    ].filter(Boolean).join(" ")

    const system = etapa === "abrir" ? SISTEMA_ABRIR : SISTEMA_ANALISAR
    const userMsg = etapa === "abrir"
      ? `${contexto}\n\nGere a abertura e a pergunta.`
      : `${contexto}\n\nPergunta feita: "${pergunta}"\nTranscrição do que o aluno falou: "${texto}"\n\nGere o achado.`

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    })
    if (!res.ok) return NextResponse.json({ error: "ia_indisponivel" }, { status: 503 })
    const data = await res.json()

    try {
      const custo = (data?.usage?.input_tokens || 0) * PRECO_IN + (data?.usage?.output_tokens || 0) * PRECO_OUT
      if (custo > 0) admin.rpc("registra_custo", { p_user: userId, p_custo: custo }).then(() => {})
    } catch {}

    const bruto = data?.content?.[0]?.text || ""
    const j = parseJson(bruto)
    if (!j) return NextResponse.json({ error: "ia_formato" }, { status: 502 })

    // 5) Saneamento. O cliente nunca recebe campo que ele não espera, e `topico` é
    //    validado contra a lista fechada — ele vai direto para o perfil do aluno.
    if (etapa === "abrir") {
      const abertura_pt = so(j.abertura_pt, 220)
      const pergunta_en = so(j.pergunta_en, 160)
      if (!abertura_pt || !pergunta_en) return NextResponse.json({ error: "ia_formato" }, { status: 502 })
      return NextResponse.json({ abertura_pt, pergunta_en })
    }

    const topico = (TOPICOS as readonly string[]).includes(String(j.topico)) ? String(j.topico) : "fluencia"
    // O rótulo é o que o aluno lê. Nunca deixamos vazio e nunca deixamos passar o slug:
    // sem rótulo do modelo, cai no mapa; sem entrada no mapa, cai no genérico.
    const rotuloBruto = so(j.rotulo, 48).replace(/[.\s]+$/, "").toLowerCase()
    const rotulo = rotuloBruto && !/_/.test(rotuloBruto)
      ? rotuloBruto
      : (ROTULOS[topico] || "soltar a fala sem travar")
    return NextResponse.json({
      elogio: so(j.elogio, 220),
      achado: so(j.achado, 260),
      errado: so(j.errado, 140),
      certo: so(j.certo, 160),
      porque: so(j.porque, 260),
      topico,
      rotulo,
    })
  } catch {
    return NextResponse.json({ error: "indisponivel" }, { status: 503 })
  }
}
