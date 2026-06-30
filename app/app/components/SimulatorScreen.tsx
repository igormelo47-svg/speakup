'use client'

import { useEffect, useRef, useState, type CSSProperties, type Dispatch, type ReactElement, type SetStateAction } from 'react'
import { supabase } from '../../../lib/supabase'

type AppTab = 'home' | 'historico' | 'prova' | 'pronuncia' | 'desafio' | 'nivelamento' | 'plans' | 'speak' | 'lessons' | 'skills' | 'dict' | 'vocab' | 'ai' | 'listening'

type IcProps = { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }
type IcBadgeProps = { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }

interface Scenario { id: string; title: string; description: string; icon: string; level: string; context: string; systemPrompt: string; opener: string; tips: string[] }
interface ConvMsg { role: 'ai' | 'user'; text: string }
interface FluencyReport { score: number; strengths: string[]; improvements: string[]; message: string }

export const SIMULATOR_SCENARIOS: Scenario[] = [
  { id: 'job_interview', title: 'Entrevista de emprego', description: 'Pratique responder perguntas comuns de entrevistas', icon: '👔', level: 'Intermediário', context: 'Você está sendo entrevistado para uma vaga em empresa internacional.', systemPrompt: `You are a professional HR interviewer at an international company interviewing a Brazilian candidate with intermediate English. Ask typical job interview questions one at a time. After each answer, give brief feedback in Portuguese about their English (grammar, vocabulary, naturalness) then continue. Keep responses concise.`, opener: "Good morning! Thank you for coming in today. Please have a seat. My name is Sarah and I'll be conducting your interview. Could you start by telling me a little about yourself?", tips: ['Experiência: "I have been working as..."', 'Pontos fortes: "My greatest strength is..."', 'Objetivos: "In five years, I see myself..."'] },
  { id: 'business_meeting', title: 'Reunião de trabalho', description: 'Simule uma reunião com colegas estrangeiros', icon: '💼', level: 'Intermediário', context: 'Você participa de uma reunião online com a equipe internacional.', systemPrompt: `You are a colleague in an international business meeting. The user is a Brazilian professional with intermediate English. Discuss a project update naturally. After each response, give brief feedback in Portuguese about their English then continue. Keep it realistic and professional.`, opener: "Hey, good to have everyone online! Before we start, how are things going on your end? Any updates from the Brazilian team this week?", tips: ['Contribuir: "I would like to add..."', 'Concordar: "That is a valid point"', 'Discordar: "I see your point, however..."'] },
  { id: 'travel_airport', title: 'No aeroporto', description: 'Navegue pelo aeroporto e resolva problemas em inglês', icon: '✈️', level: 'Iniciante/Inter.', context: 'Você está num aeroporto internacional resolvendo situações comuns.', systemPrompt: `You are an airport staff member. The user is a Brazilian traveler. Help with typical airport situations. After each exchange, give brief feedback in Portuguese about their English and continue. Be realistic and helpful.`, opener: "Good afternoon! Welcome to Miami International Airport. How can I help you today?", tips: ['Check-in: "I\'d like to check in for flight..."', 'Assento: "Could I have a window seat?"', 'Problema: "There\'s an issue with my..."'] },
  { id: 'casual_chat', title: 'Conversa informal', description: 'Bate-papo casual com um amigo estrangeiro', icon: '☕', level: 'Intermediário', context: 'Você toma um café com um amigo americano que conheceu recentemente.', systemPrompt: `You are a friendly American having a casual conversation with a Brazilian person about everyday topics. After each response, give brief feedback in Portuguese about their English naturalness and vocabulary, then continue chatting. Be warm and engaging.`, opener: "Hey! So glad we could finally catch up. I've been meaning to ask — what do you think of living in Brazil? I've always wanted to visit!", tips: ['Opinião: "Actually, I think..."', 'Interesse: "That is so interesting!"', 'Mudar assunto: "By the way..."'] },
  { id: 'presentation', title: 'Apresentação profissional', description: 'Pratique apresentar suas ideias em inglês', icon: '📊', level: 'Avançado', context: 'Você apresenta um projeto para uma audiência internacional.', systemPrompt: `You are an audience member at a professional presentation. Ask clarifying questions and engage with the user's presentation. After each response, give brief feedback in Portuguese about their English focusing on presentation vocabulary.`, opener: "Thank you for having us here today. I'm looking forward to hearing about your project. Please, go ahead and introduce yourself and your topic.", tips: ['Início: "Today I\'d like to present..."', 'Dados: "As you can see..."', 'Conclusão: "In summary..."'] },
  { id: 'hotel_checkin', title: 'Check-in no hotel', description: 'Faça check-in e resolva problemas no hotel', icon: '🏨', level: 'Iniciante/Inter.', context: 'Você chega num hotel em Nova York para uma viagem de negócios.', systemPrompt: `You are a hotel receptionist in New York. Handle the check-in process and any requests. After each exchange, give brief feedback in Portuguese about the user's English and continue. Be professional and helpful.`, opener: "Good evening and welcome to The Grand Hotel New York! Do you have a reservation with us?", tips: ['Check-in: "I have a reservation under..."', 'Pedidos: "Could I have a room with a view?"', 'Problema: "There\'s an issue with my room..."'] },
  { id: 'doctor_visit', title: 'Consulta médica', description: 'Descreva sintomas e entenda diagnósticos em inglês', icon: '🏥', level: 'Intermediário', context: 'Você vai ao médico numa clínica internacional.', systemPrompt: `You are a doctor at an international clinic. Ask about symptoms, give a diagnosis and treatment plan. After each response, give brief feedback in Portuguese about the user's English medical vocabulary, then continue the consultation.`, opener: "Good morning! I'm Dr. Johnson. Please, have a seat. What brings you in today? How are you feeling?", tips: ['Sintomas: "I have been feeling... for... days"', 'Dor: "It hurts when I..."', 'Alergia: "I am allergic to..."'] },
  { id: 'salary_negotiation', title: 'Negociação de salário', description: 'Negocie sua remuneração com confiança em inglês', icon: '💰', level: 'Avançado', context: 'Você recebeu uma oferta e quer negociar salário e benefícios.', systemPrompt: `You are an HR manager who just made a job offer. Negotiate salary and benefits professionally. After each response, give brief feedback in Portuguese about their English negotiation vocabulary and assertiveness, then continue.`, opener: "Congratulations again on the offer! We're very excited to have you join the team. Have you had a chance to review the compensation package we discussed?", tips: ['Contraproposta: "Based on my research, I was expecting..."', 'Justificar: "Given my background in..."', 'Fechar: "If you can meet me at X, I am ready to accept"'] },
  { id: 'networking', title: 'Networking em evento', description: 'Faça contatos profissionais em eventos internacionais', icon: '🤝', level: 'Inter./Avançado', context: 'Você está num evento de negócios internacional.', systemPrompt: `You are a professional at an international business conference. Network naturally with the user. After each response, give brief feedback in Portuguese about their English networking vocabulary and social fluency, then continue.`, opener: "Hi there! Great event, isn't it? I'm Alex, I work in tech over in San Francisco. What brings you to the conference?", tips: ['Se apresentar: "I work as a..."', 'Perguntar: "What do you do?"', 'Contatos: "I\'d love to connect on LinkedIn"'] },
  { id: 'customer_complaint', title: 'Reclamação ao atendimento', description: 'Resolva problemas e faça reclamações em inglês', icon: '📞', level: 'Intermediário', context: 'Você liga para o suporte de uma empresa estrangeira.', systemPrompt: `You are a customer service representative at an international company. Handle the user's complaint professionally. After each response, give brief feedback in Portuguese about their English complaint vocabulary and assertiveness, then continue.`, opener: "Thank you for calling Global Support. My name is Mike, how can I assist you today?", tips: ['Reclamar: "I am calling because I have a problem with..."', 'Insistir: "This is unacceptable."', 'Solução: "I would like a refund / replacement..."'] },
  { id: 'class_with_teacher', title: 'Aula com professor estrangeiro', description: 'Interaja em inglês com um professor nativo', icon: '👩‍🏫', level: 'Iniciante/Inter.', context: 'Você tem uma aula particular com um professor americano.', systemPrompt: `You are an American English teacher having a first class with a Brazilian intermediate student. Assess their level and start teaching naturally. After each response, give brief encouraging feedback in Portuguese about their English and continue the lesson.`, opener: "Welcome! I'm so happy to start working with you. Before we begin, I'd love to know a little about you. How long have you been studying English, and what are your main goals?", tips: ['Dúvida: "Could you explain that again?"', 'Não entendeu: "Could you speak more slowly?"', 'Confirmar: "So what you mean is..."'] },
  { id: 'shopping_abroad', title: 'Compras no exterior', description: 'Compre roupas e produtos em lojas estrangeiras', icon: '🛍️', level: 'Iniciante/Inter.', context: 'Você está fazendo compras numa loja em Nova York.', systemPrompt: `You are a store assistant at a clothing store in New York. Help the Brazilian customer find what they need. After each exchange, give brief feedback in Portuguese about their English shopping vocabulary and politeness, then continue.`, opener: "Hi there! Welcome to the store. Are you looking for anything in particular today, or just browsing?", tips: ['Experimentar: "Can I try this on?"', 'Tamanho: "Do you have this in a medium?"', 'Preço: "How much is this? / Is this on sale?"'] },
  { id: 'restaurant_order', title: 'No restaurante', description: 'Peça comida e converse com o garçom em inglês', icon: '🍽️', level: 'Iniciante/Inter.', context: 'Você está jantando num restaurante nos Estados Unidos.', systemPrompt: `You are a friendly waiter at a restaurant in the US serving a Brazilian customer with intermediate English. Take their order, make recommendations, handle requests. After each response, give brief feedback in Portuguese about their English then continue naturally.`, opener: "Good evening! Welcome to Bella's. My name is Jake and I'll be taking care of you tonight. Can I start you off with something to drink?", tips: ['Pedir: "I\'ll have the..."', 'Perguntar: "What do you recommend?"', 'Conta: "Could we get the check, please?"'] },
  { id: 'rideshare', title: 'Pedindo um Uber/táxi', description: 'Converse com o motorista e dê direções em inglês', icon: '🚕', level: 'Iniciante/Inter.', context: 'Você entrou num Uber numa cidade dos EUA.', systemPrompt: `You are a friendly Uber driver in the US with a Brazilian passenger who has intermediate English. Make small talk, confirm the destination, chat about the city. After each response, give brief feedback in Portuguese about their English then continue.`, opener: "Hey, how's it going? You're heading to the airport, right? Hop in! First time in the city?", tips: ['Confirmar: "Yes, the airport, please."', 'Direções: "Could you drop me at the entrance?"', 'Conversa: "How long will it take?"'] },
  { id: 'first_day_work', title: 'Primeiro dia no trabalho', description: 'Se apresente e conheça os colegas em inglês', icon: '🏢', level: 'Intermediário', context: 'É seu primeiro dia numa empresa internacional.', systemPrompt: `You are a welcoming colleague showing a new Brazilian employee around on their first day. Introduce yourself, ask about them, explain things. After each response, give brief feedback in Portuguese about their English then continue warmly.`, opener: "Hi! You must be the new hire — welcome aboard! I'm Taylor, I sit right next to you. How are you feeling on your first day?", tips: ['Se apresentar: "I\'m excited to be here."', 'Perguntar: "Where can I find...?"', 'Agradecer: "Thanks for showing me around."'] },
  { id: 'video_call_client', title: 'Videochamada com cliente', description: 'Conduza uma reunião por vídeo com um cliente', icon: '💻', level: 'Avançado', context: 'Você tem uma call de vídeo com um cliente internacional.', systemPrompt: `You are an international client on a video call with a Brazilian professional. Discuss a project, ask questions, raise concerns. After each response, give brief feedback in Portuguese about their professional English then continue realistically.`, opener: "Hi, thanks for hopping on the call! Can you hear me okay? Great. So, I'd love to hear where things stand with the project.", tips: ['Áudio: "Can everyone hear me?"', 'Apresentar: "Let me walk you through..."', 'Concordar: "That works for us."'] },
  { id: 'immigration', title: 'Na imigração do aeroporto', description: 'Responda ao oficial de imigração em inglês', icon: '🛂', level: 'Iniciante/Inter.', context: 'Você chegou aos EUA e está na imigração.', systemPrompt: `You are a US immigration officer questioning a Brazilian traveler. Ask standard immigration questions clearly but firmly. After each response, give brief feedback in Portuguese about their English then continue. Stay professional, not scary.`, opener: "Good afternoon. Passport, please. What's the purpose of your visit to the United States?", tips: ['Motivo: "I\'m here on vacation."', 'Tempo: "I\'ll be staying for two weeks."', 'Hospedagem: "I\'m staying at a hotel."'] },
  { id: 'phone_appointment', title: 'Marcando consulta por telefone', description: 'Agende um horário por telefone em inglês', icon: '📅', level: 'Intermediário', context: 'Você liga para marcar uma consulta ou serviço.', systemPrompt: `You are a receptionist at a clinic/office taking a phone call from a Brazilian customer who wants to schedule an appointment. After each response, give brief feedback in Portuguese about their phone English then continue helpfully.`, opener: "Good morning, Riverside Clinic, this is Emma speaking. How can I help you today?", tips: ['Pedir: "I\'d like to schedule an appointment."', 'Horário: "Do you have anything on Friday?"', 'Confirmar: "Let me confirm that..."'] },
  { id: 'meeting_in_laws', title: 'Conhecendo os sogros', description: 'Cause uma boa impressão num jantar em família', icon: '👨‍👩‍👧', level: 'Intermediário', context: 'Você vai jantar com a família do seu parceiro(a) pela primeira vez.', systemPrompt: `You are the warm but slightly curious parent whose son is dating a Brazilian person, meeting them for the first time at dinner. Ask about their life, work, family. After each response, give brief feedback in Portuguese about their English then continue kindly.`, opener: "Oh, it's so lovely to finally meet you! We've heard so much about you. Please, come in, make yourself at home. Tell us little about yourself!", tips: ['Educado: "Thank you for having me."', 'Família: "I have one brother and..."', 'Elogiar: "Dinner smells amazing!"'] },
]

type SimulatorScreenProps = {
  active: boolean
  userId: string | null
  isPremium: boolean
  setTab: Dispatch<SetStateAction<AppTab>>
  setConversas: Dispatch<SetStateAction<any[]>>
  setSimulacoesHoje: Dispatch<SetStateAction<number>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}

export default function SimulatorScreen({
  active,
  userId,
  isPremium,
  setTab,
  setConversas,
  setSimulacoesHoje,
  Ic,
  IcBadge,
}: SimulatorScreenProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [convMsgs, setConvMsgs] = useState<ConvMsg[]>([])
  const [convInput, setConvInput] = useState('')
  const [loadingConv, setLoadingConv] = useState(false)
  const [convStarted, setConvStarted] = useState(false)
  const [conversas, setConversasLocal] = useState<any[]>([])
  const [conversaAberta, setConversaAberta] = useState<any | null>(null)
  const [simulacoesHoje, setSimulacoesHojeLocal] = useState(0)
  const [fluencyReport, setFluencyReport] = useState<FluencyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(-1)
  const recognitionRef = useRef<any>(null)
  const convEndRef = useRef<HTMLDivElement>(null)
  const purple = '#534AB7'
  const purpleLight = '#EEEDFE'
  const gold = '#B8860B'
  const green = '#3B6D11'
  const greenLight = '#EAF3DE'

  useEffect(() => { setConversas(conversas) }, [conversas, setConversas])
  useEffect(() => { setSimulacoesHoje(simulacoesHoje) }, [simulacoesHoje, setSimulacoesHoje])

  useEffect(() => {
    if (!userId) return
    async function loadConversas() {
      try {
        const { data, error } = await supabase
          .from('conversas')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Erro ao carregar conversas:', error)
          return
        }

        setConversasLocal(data || [])
      } catch (e) {
        console.error('Erro ao carregar conversas:', e)
      }
    }

    loadConversas()
  }, [userId])

  useEffect(() => { convEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [convMsgs])

  function memoriaAluno() {
    const pontos = conversas
      .slice(0, 3)
      .flatMap(c => (c.relatorio?.improvements || []))
      .slice(0, 5)
    if (!pontos.length) return ''
    return '\n\nCONTEXTO DO ALUNO (use para personalizar o feedback, mas nunca mencione que você tem histórico dele): em conversas anteriores os pontos a melhorar foram: ' + pontos.join('; ') + '. Dê atenção especial a esses pontos.'
  }

  function compartilharResultado() {
    if (!fluencyReport) return
    const cenario = selectedScenario?.title || 'uma conversa real'
    const texto = `🎯 Acabei de tirar ${fluencyReport.score}/100 de fluência em inglês no SpeakUp, praticando "${cenario}" com inteligência artificial! 🇬🇧✨\n\nQuer treinar inglês de verdade — conversando, não decorando? Testa aqui 👇\nhttps://speakup-dusky.vercel.app`
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Meu resultado no SpeakUp', text: texto }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
    }
  }

  function speakEN(text: string, id: number) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (speakingId === id) { setSpeakingId(-1); return }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.95
    const vs = window.speechSynthesis.getVoices()
    const enV = vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang))
    if (enV) u.voice = enV
    u.onend = () => setSpeakingId(-1)
    setSpeakingId(id)
    window.speechSynthesis.speak(u)
  }

  function falarIngles(text: string, id: number) {
    let t = text.replace(/\*\*/g, '').replace(/\*/g, '')
    const quoted = (t.match(/["“”]([^"“”]+)["“”]/g) || []).map(s => s.replace(/["“”]/g, '').trim()).filter(Boolean)
    if (quoted.length) { speakEN(quoted.join('. '), id); return }
    const ptChars = /[ãõçáéíóúâêôàü]/i
    const ptWords = /\b(voce|que|para|obrigad|desculp|portugu|ola|estou|muito|como|pode|sobre|isso|aqui|agora|frase|exemplo|significa|quando|porque|tambem|vai|nao|sim|mais|fazer|certo|usou|seu|sua|sua|você)\b/i
    const chunks = t.split(/[.!?\n]|\s-\s/).map(s => s.trim()).filter(Boolean)
    const eng = chunks.filter(s => /[a-z]/i.test(s) && !ptChars.test(s) && !ptWords.test(s))
    speakEN(eng.length ? eng.join('. ') : t, id)
  }

  function toggleMic(setter: (fn: (prev: string) => string) => void) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      const txt = e.results[0][0].transcript
      setter(prev => prev ? prev + ' ' + txt : txt)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  function startScenario(scenario: Scenario) {
    const FREE_LIMIT = 3
    if (!isPremium && simulacoesHoje >= FREE_LIMIT) { setTab('plans'); return }
    setSelectedScenario(scenario); setConvMsgs([{ role: 'ai', text: scenario.opener }]); setConvStarted(true); setConvInput('')
    setSimulacoesHojeLocal(s => s + 1)
  }

  async function sendConvMsg() {
    if (!convInput.trim() || loadingConv || !selectedScenario) return
    const msg = convInput; setConvInput('')
    const nextHistory = [...convMsgs, { role: 'user', text: msg }]
    setConvMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingConv(true)
    try {
      const history = nextHistory.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: selectedScenario.systemPrompt + memoriaAluno(), messages: [...history, { role: 'user', content: msg }] }) })
      const data = await res.json()
      setConvMsgs(m => [...m, { role: 'ai', text: data.content?.[0]?.text || 'Could not respond.' }])
    } catch { setConvMsgs(m => [...m, { role: 'ai', text: 'Connection error. Please try again.' }]) }
    setLoadingConv(false)
  }

  async function gerarRelatorio() {
    if (loadingReport || convMsgs.length < 2) return
    setLoadingReport(true)
    try {
      const history = convMsgs.map(m => `${m.role === 'ai' ? 'Interlocutor' : 'Aluno'}: ${m.text}`).join('\n')
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: 'Você avalia a fluência em inglês de um aluno brasileiro com base em uma conversa. Responda APENAS com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois. Formato exato: {"score": número de 0 a 100, "strengths": ["ponto forte 1","ponto forte 2","ponto forte 3"], "improvements": ["o que melhorar 1 com exemplo","o que melhorar 2 com exemplo"], "message": "frase curta de incentivo em português"}. Avalie só as falas do Aluno. Seja encorajador mas honesto.', messages: [{ role: 'user', content: `Avalie esta conversa:\n\n${history}` }] }) })
      const data = await res.json()
      const txt = (data.content?.[0]?.text || '').replace(/```json/g,'').replace(/```/g,'').trim()
      const rep = JSON.parse(txt)
      setFluencyReport(rep)
      if (userId) {
        const novaConversa: any = {
          user_id: userId,
          cenario: selectedScenario?.id || null,
          cenario_titulo: selectedScenario?.title || null,
          mensagens: convMsgs,
          score: rep.score,
          relatorio: rep,
          created_at: new Date().toISOString()
        }

        try {
          const { data: saved, error: insertError } = await supabase.from('conversas').insert(novaConversa).select().single()
          if (!insertError && saved) {
            setConversasLocal(c => [saved, ...c])
          } else {
            setConversasLocal(c => [novaConversa, ...c])
          }
        } catch (e) {
          console.error('Erro ao salvar conversa:', e)
          setConversasLocal(c => [novaConversa, ...c])
        }
      }
    } catch { setFluencyReport({ score: 0, strengths: [], improvements: [], message: 'Não foi possível gerar o relatório. Tente novamente.' }) }
    setLoadingReport(false)
  }

  if (!active) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!convStarted ? (
        <>
          <div style={{ background: purple, padding: '20px 16px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Simulador de Conversas</div>
            <div style={{ fontSize: 13, color: '#AFA9EC', marginTop: 2 }}>Pratique situações reais em inglês</div>
            {!isPremium && <div style={{ fontSize: 12, color: '#AFA9EC', marginTop: 4 }}>{simulacoesHoje}/3 simulações usadas hoje</div>}
          </div>
          {!isPremium && simulacoesHoje >= 3 && (
            <div onClick={() => setTab('plans')} style={{ margin: 16, background: `linear-gradient(135deg, ${gold}, #DAA520)`, borderRadius: 16, padding: 18, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}><Ic e="🔥" c="#fff" /></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Você está pegando o jeito!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 6, lineHeight: 1.5 }}>Você já fez suas 3 conversas de hoje. Vire Premium e pratique sem limites — quantas vezes quiser, todos os dias.</div>
              <div style={{ display: 'inline-block', marginTop: 14, background: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 24 }}>Conversar sem limites <Ic e="→" /></div>
            </div>
          )}
          <div style={{ padding: 16, flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Escolha um cenário e converse com IA. Você receberá feedback imediato sobre seu inglês.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SIMULATOR_SCENARIOS.map((s, idx) => {
                const bloqueado = !isPremium && idx >= 3
                return (
                  <div key={s.id} onClick={() => !bloqueado ? startScenario(s) : setTab('plans')} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: bloqueado ? 0.6 : 1 }}>
                    <div style={{ width: 48, height: 48, background: bloqueado ? '#eee' : purpleLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}><Ic e={bloqueado ? '🔒' : s.icon} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.description}</div>
                      <div style={{ marginTop: 6 }}><span style={{ background: bloqueado ? '#eee' : purpleLight, color: bloqueado ? '#999' : purple, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>{bloqueado ? 'Premium' : s.level}</span></div>
                    </div>
                    <span style={{ color: bloqueado ? gold : purple, fontSize: 18 }}><Ic e={bloqueado ? '⭐' : '→'} /></span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ background: purple, padding: '16px 16px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => { setConvStarted(false); setSelectedScenario(null); setConvMsgs([]) }} style={{ background: 'none', border: 'none', color: '#AFA9EC', cursor: 'pointer', fontSize: 20, padding: 0 }}><Ic e="←" /></button>
              <div><div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}><Ic e={selectedScenario?.icon} /> {selectedScenario?.title}</div><div style={{ fontSize: 12, color: '#AFA9EC' }}>{selectedScenario?.context}</div></div>
            </div>
          </div>
          {selectedScenario && (
            <div style={{ background: '#F1EFE8', padding: '10px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 11, color: '#5F5E5A', fontWeight: 500, marginBottom: 4 }}><Ic e="💡" /> Dicas:</div>
              {selectedScenario.tips.map((tip, i) => <div key={i} style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 2 }}>• {tip}</div>)}
            </div>
          )}
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            {convMsgs.map((m, i) => (
              <div key={i} style={{ maxWidth: '88%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'ai' && <div style={{ fontSize: 10, color: purple, fontWeight: 500, marginBottom: 4, marginLeft: 2 }}><Ic e={selectedScenario?.icon} /> {selectedScenario?.title}</div>}
                <div style={{ padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.6, background: m.role === 'user' ? purple : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>{m.text}</div>
                {m.role === 'ai' && <button onClick={() => falarIngles(m.text, i)} style={{ marginTop: 5, marginLeft: 2, background: speakingId === i ? purple : purpleLight, color: speakingId === i ? '#fff' : purple, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === i ? <><Ic e="⏸️" /> Parar</> : <><Ic e="🔊" /> Ouvir</>}</button>}
              </div>
            ))}
            {loadingConv && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>digitando...</div>}
            <div ref={convEndRef} />
          </div>
          <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8 }}>
            <button onClick={() => toggleMic(setConvInput)} style={{ padding: '10px 14px', background: listening ? '#E24B4A' : 'var(--color-background-secondary)', color: listening ? '#fff' : purple, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}><Ic e={listening ? '⏹️' : '🎤'} /></button>
            <input value={convInput} onChange={e => setConvInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendConvMsg()} placeholder={listening ? '🎙️ Pode falar em inglês...' : 'Digite ou fale em inglês...'} style={{ flex: 1, padding: '10px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, fontSize: 14, background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
            <button onClick={sendConvMsg} disabled={loadingConv} style={{ padding: '10px 16px', background: purple, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}><Ic e="→" /></button>
          </div>
          {convMsgs.length >= 3 && (
            <div style={{ padding: '0 16px 12px', background: 'var(--color-background-primary)' }}>
              <button onClick={gerarRelatorio} disabled={loadingReport} style={{ width: '100%', padding: 12, background: loadingReport ? '#999' : gold, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{loadingReport ? <><Ic e="🔍" /> Analisando seu inglês...</> : <><Ic e="🏁" /> Finalizar e ver meu relatório</>}</button>
            </div>
          )}
        </>
      )}

      {fluencyReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'su_fade 0.2s ease' }} onClick={() => setFluencyReport(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-background-tertiary)', width: '100%', maxWidth: 430, borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto', padding: '0 0 24px', animation: 'su_slide 0.32s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ background: `linear-gradient(135deg, ${purple}, #3C3489)`, padding: '28px 20px 24px', borderRadius: '20px 20px 0 0', textAlign: 'center', position: 'relative' }}>
              <button onClick={() => setFluencyReport(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: '#fff', fontSize: 16, cursor: 'pointer' }}><Ic e="✕" /></button>
              <div style={{ fontSize: 13, color: '#C9C4F0', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Relatório de Fluência</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginTop: 8, animation: 'su_pop 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>{fluencyReport.score}<span style={{ fontSize: 24, color: '#C9C4F0' }}>/100</span></div>
              <div style={{ fontSize: 14, color: '#fff', marginTop: 4 }}>{fluencyReport.score >= 80 ? <><Ic e="🌟" /> Excelente!</> : fluencyReport.score >= 60 ? <><Ic e="💪" /> Muito bom!</> : fluencyReport.score >= 40 ? <><Ic e="📈" /> Continue assim!</> : <><Ic e="🌱" /> Começo de jornada!</>}</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: greenLight, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#27500A', marginBottom: 10 }}><Ic e="✅" /> Seus pontos fortes</div>
                {fluencyReport.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#3B6D11', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#633806', marginBottom: 10 }}><Ic e="📈" /> O que melhorar</div>
                {fluencyReport.improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#854F0B', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: purpleLight, borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#3C3489', fontWeight: 500, lineHeight: 1.5 }}><Ic e="💜" /> {fluencyReport.message}</div>
              </div>
              {!isPremium && (
                <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #2074C0, #185FA5)', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}><Ic e="🚀" /> Quer evoluir mais rápido?</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 1.5 }}>Com o Premium você treina exatamente esses pontos com conversas ilimitadas e chega à fluência muito antes.</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 10 }}>Ver o Premium <Ic e="→" /></div>
                </div>
              )}
              <button onClick={compartilharResultado} style={{ width: '100%', padding: 14, background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Ic e="📲" /> Compartilhar meu resultado</button>
              <button onClick={() => { setFluencyReport(null); setConvStarted(false); setSelectedScenario(null); setConvMsgs([]) }} style={{ width: '100%', padding: 14, background: purple, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Praticar outro cenário <Ic e="→" /></button>
              <button onClick={() => setFluencyReport(null)} style={{ width: '100%', padding: 12, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Continuar conversa</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px', marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div onClick={() => setTab('historico')} style={{ background: '#F0ECFF', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, background: '#534AB726', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Ic e="💬" s={20} c="#534AB7" /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Minhas conversas</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{conversas.length} {conversas.length === 1 ? 'conversa' : 'conversas'}</div>
          </div>
          <div onClick={() => setTab('vocab')} style={{ background: greenLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="📚" color={green} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#27500A' }}>Vocabulário</div>
            <div style={{ fontSize: 11, color: green }}>Continue praticando</div>
          </div>
        </div>

        {conversaAberta && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{conversaAberta.cenario_titulo || 'Conversa'}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{formatDate(conversaAberta.created_at || conversaAberta.createdAt || '')}</div>
              </div>
              <button onClick={() => setConversaAberta(null)} style={{ background: 'none', border: 'none', color: '#185FA5', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Voltar</button>
            </div>
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Score</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: getScoreColor(conversaAberta.score ?? conversaAberta.relatorio?.score ?? 0) }}>{conversaAberta.score ?? conversaAberta.relatorio?.score ?? 0}</div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Pontos fortes</div>
                  {(conversaAberta.relatorio?.strengths || []).map((s:string, i:number) => <div key={i} style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>• {s}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>O que melhorar</div>
                  {(conversaAberta.relatorio?.improvements || []).map((s:string, i:number) => <div key={i} style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>• {s}</div>)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}><Ic e="💬" /> {conversaAberta.relatorio?.message || ''}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {(conversaAberta.mensagens || []).map((m:any, i:number) => (
                <div key={i} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{m.role === 'ai' ? 'Interlocutor' : 'Aluno'}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })
}

function getScoreColor(score: number) {
  if (score >= 80) return '#3B6D11'
  if (score >= 50) return '#D97706'
  return '#C0392B'
}