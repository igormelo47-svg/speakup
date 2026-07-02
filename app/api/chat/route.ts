import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Mantenha igual ao app (page.tsx). Trocar para false quando ligar a cobrança.
const BETA_GRATIS = true
// Tetos diários de chamadas à IA por usuário (rede de segurança contra abuso/custo).
const LIMIT_FREE = 60
const LIMIT_PREMIUM = 300

// Rota do Professor IA / Simulador. Protegida:
// (1) exige login; (2) limita o tamanho da requisição; (3) trava de uso diário NO SERVIDOR.
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  // 1) Autenticação: só usuários logados podem gastar a API.
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  if (!token || !url || !anon) {
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

  // 2) Validação/limite do payload.
  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }) }
  const { messages, system } = body
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
    return NextResponse.json({ error: "invalid messages" }, { status: 400 })
  }
  const totalChars =
    (typeof system === "string" ? system.length : 0) +
    messages.reduce((acc: number, m: any) => acc + (typeof m?.content === "string" ? m.content.length : 0), 0)
  if (totalChars > 20000) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 })
  }

  // 3) Trava de uso diário no servidor (não burlável pelo app). Best-effort:
  // se o banco falhar ou faltar a service key, não bloqueia (o teto real é o da Anthropic).
  if (service) {
    try {
      const admin = createClient(url, service)
      const { data: prog } = await admin
        .from("progresso")
        .select("is_premium, chat_dia_data, chat_dia_count")
        .eq("user_id", userId)
        .maybeSingle()
      const today = new Date().toISOString().split("T")[0]
      const premium = BETA_GRATIS || !!prog?.is_premium
      const limit = premium ? LIMIT_PREMIUM : LIMIT_FREE
      const count = prog && prog.chat_dia_data === today ? (prog.chat_dia_count || 0) : 0
      if (count >= limit) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 })
      }
      await admin
        .from("progresso")
        .upsert(
          { user_id: userId, chat_dia_data: today, chat_dia_count: count + 1, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
    } catch {
      // fail-open: não quebra a experiência por causa de erro de contagem.
    }
  }

  // 4) Chama a Anthropic.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      messages,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
