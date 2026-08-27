import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// DEMO PÚBLICA DE FALA — a pessoa que acabou de descobrir o nível grava UMA frase e vê,
// na hora, o que o professor entendeu. Sem conta, sem cartão, sem instalar nada.
//
// Por que isto existe (números de 18–27/08): 95 pessoas terminaram o teste de nível vindas
// do Meta e 11 criaram conta — 88% somem. O anúncio promete FALAR inglês, o teste mede
// gramática e o resultado entrega um rótulo (“você é B1”). Em nenhum momento a pessoa
// experimenta o produto, então não há motivo para abrir uma conta. Esta rota entrega o
// produto ANTES do cadastro: é o único ponto do funil onde a promessa do anúncio e o que
// acontece na tela são a mesma coisa.
//
// É PÚBLICA de propósito — a página do teste não tem login. Cada trava abaixo é dinheiro
// real, então nenhuma delas é opcional.

// Whisper custa ~US$0,006/min; um clipe de 5s sai a ~US$0,0005. TENTATIVAS_IP = 5 permite
// a pessoa errar, ouvir a correção e tentar de novo, e trava o abuso: mesmo com 300 IPs
// distintos por dia o teto é ~US$0,75/dia. Prefixo próprio ("demo:") para não dividir a
// cota com o chat do professor nem com o lead do Meta, que usam o mesmo RPC.
const TENTATIVAS_IP = 5

// As frases moram AQUI, não no cliente: o corpo da requisição não escolhe o que o servidor
// compara, então esta rota nunca vira um serviço de transcrição livre. Uma por nível, cada
// uma com uma armadilha real do brasileiro — “th” (three/thought/rather), “-ed” final e o
// “i” curto. A pessoa precisa ouvir a correção de um erro que ela REALMENTE comete; frase
// fácil demais devolve 100% e não prova nada.
const FRASES: Record<string, { texto: string; dica: string }> = {
  A1: { texto: 'I have three brothers.', dica: 'O “th” de three e brothers é com a língua entre os dentes — não é “tree” nem “bróders”.' },
  A2: { texto: "I'd like a table for two, please.", dica: 'Em “table”, o T soa quase como um D leve. E “I’d” é uma sílaba só, não “ai dii”.' },
  B1: { texto: "I've been working here for three years.", dica: '“I’ve been” sai colado, quase “aivbin”. E “three” não é “tree”.' },
  B2: { texto: 'I thought the meeting was shorter.', dica: 'Dois “th” seguidos em thought e the — a maioria dos brasileiros troca por “t” e “d”.' },
  C1: { texto: "Although it's difficult, I'd rather do it myself.", dica: '“Although” e “rather” têm o “th” sonoro, com a garganta vibrando.' },
  C2: { texto: 'The thorough analysis revealed three underlying issues.', dica: 'Três “th” diferentes na mesma frase — thorough, three e the.' },
}
const NIVEIS = Object.keys(FRASES)

// Compara o que a pessoa FALOU com a frase-alvo, palavra a palavra. Não é nota de
// pronúncia: é o que o Whisper ouviu. E isso basta — quem diz “tree” em vez de “three”
// aparece transcrito como “tree”, e ver isso escrito é a correção mais honesta que existe.
function normalizar(s: string): string[] {
  return s.toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

// LCS clássico: acha quais palavras do alvo realmente apareceram, na ordem, sem punir a
// pessoa por uma palavra extra no meio (gaguejo, “uhm”) nem por trocar a ordem de duas.
function alinhar(alvo: string[], dito: string[]): boolean[] {
  const n = alvo.length, m = dito.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = alvo[i - 1] === dito[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const acertou = new Array(n).fill(false)
  let i = n, j = m
  while (i > 0 && j > 0) {
    if (alvo[i - 1] === dito[j - 1]) { acertou[i - 1] = true; i--; j-- }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--
    else j--
  }
  return acertou
}

export async function POST(req: NextRequest) {
  const key = (process.env.OPENAI_API_KEY || '').trim()
  if (!key) return NextResponse.json({ error: 'demo_indisponivel' }, { status: 501 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'demo_indisponivel' }, { status: 501 })

  const nivelBruto = String(req.headers.get('x-nivel') || 'B1').toUpperCase()
  const nivel = NIVEIS.includes(nivelBruto) ? nivelBruto : 'B1'
  const frase = FRASES[nivel]

  const buf = await req.arrayBuffer()
  // Sonda do cliente (checa se a rota existe antes de pedir o microfone) responde ANTES
  // do limite, para não queimar a cota de quem ainda nem falou.
  if (!buf || buf.byteLength < 1000) return NextResponse.json({ error: 'audio_pequeno' }, { status: 400 })
  if (buf.byteLength > 1_200_000) return NextResponse.json({ error: 'audio_grande' }, { status: 413 })

  // FAIL-CLOSED: sem conseguir verificar o limite, não gasta. Numa rota pública isso não
  // é preciosismo — é a diferença entre um custo previsível e uma fatura surpresa.
  const admin = createClient(url, service)
  const ip = (req.headers.get('x-forwarded-for') || 'sem-ip').split(',')[0].trim()
  try {
    const { data: dentro, error } = await admin.rpc('incrementa_ip', {
      p_ip: `demo:${ip || 'sem-ip'}`, p_limite: TENTATIVAS_IP,
    })
    if (error) throw new Error('rpc_falhou')
    if (dentro === false) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  } catch {
    return NextResponse.json({ error: 'demo_indisponivel' }, { status: 503 })
  }

  const mime = req.headers.get('x-audio-type') || 'audio/webm'
  const nome = mime.includes('mp4') ? 'audio.mp4' : mime.includes('ogg') ? 'audio.ogg' : 'audio.webm'
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type: mime }), nome)
  fd.append('model', 'whisper-1')
  fd.append('language', 'en')
  // SEM `prompt` — de propósito, e isto é o coração da honestidade da demo. O parâmetro
  // `prompt` do Whisper enviesa a transcrição na direção do texto informado: passando a
  // frase-alvo, ele "conserta" sozinho a pronúncia errada e devolve a frase perfeita.
  // Todo mundo tiraria 100% e a tela viraria um elogio vazio — exatamente o oposto do que
  // esta demo precisa fazer. O valor está em a pessoa LER na tela que ela disse "tree"
  // quando queria dizer "three". Transcrição crua é a única correção que convence.

  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: fd,
    })
  } catch {
    return NextResponse.json({ error: 'demo_falhou' }, { status: 502 })
  }
  if (!r.ok) return NextResponse.json({ error: 'demo_falhou' }, { status: 502 })

  const data = await r.json().catch(() => ({}))
  const ouvido = String(data?.text || '').trim()
  if (!ouvido) return NextResponse.json({ error: 'nao_ouvi' }, { status: 422 })

  const alvo = normalizar(frase.texto)
  const dito = normalizar(ouvido)
  const acertou = alinhar(alvo, dito)
  const certas = acertou.filter(Boolean).length
  const nota = alvo.length ? Math.round((certas / alvo.length) * 100) : 0

  return NextResponse.json({
    ok: true,
    nivel,
    frase: frase.texto,
    dica: frase.dica,
    ouvido,
    nota,
    palavras: alvo.map((p, k) => ({ p, ok: acertou[k] })),
    faltaram: alvo.filter((_, k) => !acertou[k]),
  })
}

// Serve a frase do nível SEM gastar nada: o componente pede no GET para já mostrar o que
// a pessoa vai falar enquanto pede permissão do microfone.
export async function GET(req: NextRequest) {
  const nivelBruto = String(new URL(req.url).searchParams.get('nivel') || 'B1').toUpperCase()
  const nivel = NIVEIS.includes(nivelBruto) ? nivelBruto : 'B1'
  const ligado = !!(process.env.OPENAI_API_KEY || '').trim()
  return NextResponse.json({ ligado, nivel, frase: FRASES[nivel].texto, dica: FRASES[nivel].dica })
}
