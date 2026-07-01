import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Rota do Professor IA / Simulador. Protegida contra abuso de custo:
// (1) exige usuário logado (token do Supabase); (2) limita o tamanho da requisição.
export async function POST(req: NextRequest) {
  // 1) Autenticação: só usuários logados podem gastar a API.
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!token || !url || !anon) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2) Validação/limite do payload (evita prompts gigantes e abuso).
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

  // 3) Chama a Anthropic.
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
