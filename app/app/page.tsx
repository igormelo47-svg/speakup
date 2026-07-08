'use client'
import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import {
  type LucideIcon,
  Briefcase, BriefcaseBusiness, Plane, Coffee, BarChart3, Hotel, Stethoscope,
  Banknote, Handshake, Phone, GraduationCap, ShoppingBag, Utensils, UtensilsCrossed,
  Car, CarTaxiFront, Building2, Laptop, Stamp, Calendar, Users, Hand, Hash, Palette,
  PersonStanding, Languages, Zap, PawPrint, UserRound, CloudSun, Smile, Bus, Clock,
  Shuffle, RefreshCw, Repeat, Hourglass, MapPin, HelpCircle, Link as LinkIcon, Wrench,
  Glasses, Target, TriangleAlert, PenLine, Tornado, Annoyed, Hammer, Globe, Drama,
  Scale, Speech, Sprout, Leaf, Trophy, Mic, Wind, Circle, Rewind, Music, Waves, Worm,
  VolumeX, Scissors, Star, Flame, BookOpen, Library, Bot, Smartphone, NotebookPen,
  Lightbulb, Sparkles, TrendingUp, BicepsFlexed, PartyPopper, LockOpen, Lock, Search,
  Flag, X, Heart, Rocket, Folder, Home, Apple, Shirt, Goal, ChefHat, Cat, Map as MapIcon,
  Image as ImageIcon, ArrowRight, ArrowLeft, Check, CircleCheck, BookText, Pause, Square,
  Volume2, MessageCircle, Settings, HelpingHand, Bell, Bird, Brain,
  Landmark, Key, Pill, Puzzle, Feather, Footprints, Moon, Gem, Headphones, Turtle,
  Activity, Armchair, ArrowLeftRight, ArrowUpDown, Award, Boxes, CalendarCheck, CalendarClock,
  CalendarDays, CheckCheck, Cloud, Combine, Compass, Copy, CreditCard, Equal, FastForward,
  FlaskConical, Gauge, GitBranch, History, House, KeyRound, Layers, Megaphone,
  MessageCircleQuestion, MessagesSquare, Move, Navigation, Package, Quote, RotateCcw,
  SearchCheck, ShieldCheck, Split, Sunrise, Timer, ToggleLeft, Type, UserCheck, Watch,
} from 'lucide-react'

// Mapeia cada emoji usado no app para o componente equivalente do lucide-react.
const EMOJI_ICONS: Record<string, LucideIcon> = {
  // Cenários do simulador
  '👔': Briefcase, '💼': BriefcaseBusiness, '✈️': Plane, '☕': Coffee, '📊': BarChart3,
  '🏨': Hotel, '🏥': Stethoscope, '💰': Banknote, '🤝': Handshake, '📞': Phone,
  '👩‍🏫': GraduationCap, '👨‍🏫': GraduationCap, '🎓': GraduationCap, '🛍️': ShoppingBag,
  '🍽️': Utensils, '🍴': UtensilsCrossed, '🚕': CarTaxiFront, '🚗': Car, '🏢': Building2,
  '💻': Laptop, '🛂': Stamp, '📅': Calendar, '👨‍👩‍👧': Users, '👋': Hand, '🔢': Hash,
  '🎨': Palette, '🧍': PersonStanding, '🔤': Languages, '⚡': Zap, '🐾': PawPrint,
  '👩‍⚕️': UserRound, '🌤️': CloudSun, '😊': Smile, '🚌': Bus,
  // Lições de gramática / vocabulário
  '⏰': Clock, '🔀': Shuffle, '🔄': RefreshCw, '🔁': Repeat, '💬': MessageCircle,
  '⚙️': Settings, '⏳': Hourglass, '📍': MapPin, '❓': HelpCircle, '🔗': LinkIcon,
  '🛠️': Wrench, '😎': Glasses, '🎯': Target, '🪤': TriangleAlert, '✍️': PenLine,
  '🌀': Tornado, '🎭': Drama, '😏': Annoyed, '🔧': Hammer, '🌍': Globe, '⚖️': Scale,
  '🗣️': Speech,
  // Categorias de pronúncia
  '🦷': Mic, '💨': Wind, '🔴': Circle, '⏪': Rewind, '🎵': Music, '🌊': Waves,
  '🐍': Worm, '🤫': VolumeX, '✂️': Scissors,
  // Dicionário ilustrado
  '🏠': Home, '🍎': Apple, '👕': Shirt, '⚽': Goal, '🏙️': Building2, '👨‍🍳': ChefHat,
  '🦁': Cat, '🗺️': MapIcon, '📚': Library, '🌿': Leaf, '🖼️': ImageIcon, '📘': BookText,
  // UI: home, navegação, botões, resultados
  '⭐': Star, '🌟': Star, '🔥': Flame, '📖': BookOpen, '🤖': Bot, '📲': Smartphone,
  '📝': NotebookPen, '🎤': Mic, '⏹️': Square, '⏸️': Pause, '🔊': Volume2, '💡': Lightbulb,
  '✨': Sparkles, '📈': TrendingUp, '💪': BicepsFlexed, '🎉': PartyPopper, '🔓': LockOpen,
  '🔒': Lock, '🔍': Search, '🏁': Flag, '💜': Heart, '🚀': Rocket, '🗂️': Folder,
  '🏆': Trophy, '🌱': Sprout, '🔔': Bell, '🦜': Bird, '🧠': Brain,
  // Símbolos de interface
  '→': ArrowRight, '←': ArrowLeft, '✓': Check, '✗': X, '✅': CircleCheck, '✕': X,
  '🎙️': Mic, '🤲': HelpingHand,
  // Ícones extras de cenários/lições (evitam o fallback "?")
  '🏦': Landmark, '🏛️': Landmark, '🔑': Key, '💊': Pill, '🚨': TriangleAlert,
  '🏋️': BicepsFlexed, '💇': Scissors, '🧩': Puzzle, '🎚️': Settings, '🪞': UserRound,
  '🧰': Wrench, '🪶': Feather, '👟': Footprints, '🌑': Moon, '🧃': Coffee, '💎': Gem,
  '🎧': Headphones, '🐢': Turtle, '🇧🇷': Flag,
}

// Lições do banco usam nomes do lucide como ícone (ex.: "Equal", "Hash") — mapa nome→componente.
const NAME_ICONS: Record<string, LucideIcon> = {
  Activity, Armchair, ArrowLeftRight, ArrowUpDown, Award, Boxes, Briefcase, Bus, Calendar,
  CalendarCheck, CalendarClock, CalendarDays, CheckCheck, Clock, Cloud, Coffee, Combine,
  Compass, Copy, CreditCard, Equal, FastForward, FlaskConical, Gauge, GitBranch, Globe,
  Hand, Hash, Heart, HelpCircle, History, Home, Hourglass, House, Key, KeyRound, Layers,
  Lightbulb, Link: LinkIcon, MapPin, Megaphone, MessageCircleQuestion, MessagesSquare,
  Move, Music, Navigation, Package, Palette, PawPrint, Puzzle, Quote, Repeat, Rewind,
  RotateCcw, Scale, Scissors, Search, SearchCheck, ShieldCheck, Shirt, ShoppingBag,
  Shuffle, Smile, Sparkles, Split, Star, Sunrise, Timer, ToggleLeft, TrendingUp,
  TriangleAlert, Trophy, Type, UserCheck, Users, Utensils, UtensilsCrossed, Watch, Wrench, Zap,
}

// Renderiza um ícone a partir do emoji (ou nome lucide vindo do banco), mantendo tamanho/cor.
// Emoji sem equivalente mapeado cai no próprio emoji nativo (colorido) — nunca em "?".
function Ic({ e, s = '1em', c, sw = 2.25, style }: { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }) {
  const Cmp = e ? (EMOJI_ICONS[e] || NAME_ICONS[e]) : undefined
  if (!Cmp) {
    const emoji = e && !/^[A-Za-z]+$/.test(e) ? e : '📘'
    return <span style={{ fontSize: s, lineHeight: 1, verticalAlign: '-0.125em', flexShrink: 0, display: 'inline-block', ...style }}>{emoji}</span>
  }
  return <Cmp size={s} color={c} strokeWidth={sw} style={{ verticalAlign: '-0.125em', flexShrink: 0, display: 'inline-block', ...style }} />
}

// Para rótulos que começam com um emoji seguido de texto (ex: "🏠 Casa").
function IcLabel({ label }: { label: string }) {
  const sp = label.indexOf(' ')
  if (sp < 0) return <Ic e={label} />
  return <>
    <Ic e={label.slice(0, sp)} /> {label.slice(sp + 1)}
  </>
}

// Ícone colorido dentro de um quadradinho arredondado com a cor do tema.
// Em fundo claro o quadrado usa a cor a ~15% de opacidade; em fundo escuro
// (cabeçalhos/cards coloridos) usa um fundo quase branco para o ícone se destacar.
function IcBadge({ e, color, onDark, size = 22, box = 38, radius = 10, style }: { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }) {
  return (
    <div style={{ width: box, height: box, borderRadius: radius, background: onDark ? 'rgba(255,255,255,0.92)' : color + '26', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
      <Ic e={e} s={size} c={color} sw={2.25} />
    </div>
  )
}

interface Question { q: string; ctx: string; opts: string[]; ans: number; exp: string }
interface Lesson { title: string; sub: string; icon: string; done: boolean; explanation: string; tip: string; examples: { en: string; pt: string }[]; q: Question[]; cefr?: string }

// Embaralha as opções de uma questão de forma determinística (pelo texto da pergunta),
// para a resposta correta não ficar sempre na 1ª posição. Mantém-se estável entre renders.
function embaralharQ(q: any) {
  if (!q || !Array.isArray(q.opts) || typeof q.ans !== 'number') return q
  let s = 0
  const txt = String(q.q || '')
  for (let i = 0; i < txt.length; i++) s = (s * 31 + txt.charCodeAt(i)) >>> 0
  const order = q.opts.map((_: any, i: number) => i)
  for (let i = order.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t }
  return { ...q, opts: order.map((i: number) => q.opts[i]), ans: order.indexOf(q.ans) }
}

// Web Push (lembretes diários). A chave pública pode ficar no cliente; a privada fica só na Vercel.
const VAPID_PUBLIC_KEY = 'BGvDV8RzI74VwBSU6MSVcAgDJS3WF_zTGrpDW9cY26dyf85JAbJP0aRhJpU8BECmc3Z6yvHRHctbxxE0Bk-5cLo'
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}
interface ConvMsg { role: 'ai' | 'user'; text: string }
interface Scenario { id: string; title: string; description: string; icon: string; level: string; context: string; systemPrompt: string; opener: string; tips: string[] }

const scenarios: Scenario[] = [
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
  { id: 'bank_account', title: 'Abrindo conta no banco', description: 'Abra uma conta e tire dúvidas bancárias em inglês', icon: '🏦', level: 'Intermediário', context: 'Você vai a um banco nos EUA para abrir uma conta corrente.', systemPrompt: `You are a bank clerk in the US helping a Brazilian customer open a checking account. Explain account types, required documents, fees, and debit cards. After each response, give brief feedback in Portuguese about their English banking vocabulary, then continue.`, opener: "Hi, welcome to First National Bank! How can I help you today? Are you looking to open a new account?", tips: ['Abrir conta: "I\'d like to open a checking account."', 'Documentos: "What documents do I need?"', 'Tarifas: "Are there any monthly fees?"'] },
  { id: 'apartment_rental', title: 'Alugando um apartamento', description: 'Visite um imóvel e negocie o aluguel em inglês', icon: '🔑', level: 'Intermediário', context: 'Você visita um apartamento para alugar e conversa com o corretor.', systemPrompt: `You are a real estate agent showing an apartment to a Brazilian person looking to rent. Describe the place, answer questions about rent, deposit, lease, and utilities. After each response, give brief feedback in Portuguese about their English, then continue.`, opener: "Hi! Thanks for coming by. So this is the apartment — two bedrooms, lots of natural light. Feel free to look around. What do you think so far?", tips: ['Perguntar: "How much is the rent per month?"', 'Contrato: "How long is the lease?"', 'Incluso: "Are utilities included?"'] },
  { id: 'pharmacy_visit', title: 'Na farmácia', description: 'Compre remédios e descreva sintomas ao farmacêutico', icon: '💊', level: 'Iniciante/Inter.', context: 'Você vai a uma farmácia nos EUA buscar um remédio.', systemPrompt: `You are a pharmacist in the US helping a Brazilian customer. Ask about symptoms, recommend over-the-counter medicine, explain dosage. After each response, give brief feedback in Portuguese about their English health vocabulary, then continue.`, opener: "Hi there! Welcome to the pharmacy. What can I help you with today?", tips: ['Sintoma: "I have a headache and a sore throat."', 'Pedir: "Do you have something for a cold?"', 'Dosagem: "How often should I take this?"'] },
  { id: 'emergency_help', title: 'Situação de emergência', description: 'Peça ajuda e explique uma emergência em inglês', icon: '🚨', level: 'Intermediário', context: 'Você liga para o 911 ou pede ajuda numa emergência.', systemPrompt: `You are a 911 emergency operator in the US taking a call from a Brazilian person. Stay calm, ask for location, nature of the emergency, and give clear instructions. After each response, give brief feedback in Portuguese about their English, then continue. Keep it realistic but not traumatic.`, opener: "911, what's your emergency?", tips: ['Pedir ajuda: "I need an ambulance, please."', 'Local: "I\'m at... / The address is..."', 'Explicar: "Someone fainted / There was an accident."'] },
  { id: 'visa_interview', title: 'Entrevista de visto', description: 'Responda às perguntas do oficial do consulado', icon: '🛂', level: 'Intermediário', context: 'Você tem entrevista para visto americano no consulado.', systemPrompt: `You are a US consular officer interviewing a Brazilian applicant for a tourist/student visa. Ask about travel purpose, finances, ties to Brazil, and plans. After each response, give brief feedback in Portuguese about their English, then continue. Be professional and firm but fair.`, opener: "Good morning. Please step up to the window. Can you tell me the purpose of your trip to the United States?", tips: ['Motivo: "I\'m planning to travel as a tourist."', 'Vínculos: "I have a stable job in Brazil."', 'Custos: "I will cover all my expenses."'] },
  { id: 'asking_directions', title: 'Pedindo informações na rua', description: 'Peça e entenda direções na cidade em inglês', icon: '🗺️', level: 'Iniciante/Inter.', context: 'Você está perdido numa cidade e pede ajuda a um pedestre.', systemPrompt: `You are a friendly local in a US city. A Brazilian tourist asks you for directions. Give clear directions using landmarks, streets, and turns. After each response, give brief feedback in Portuguese about their English, then continue helpfully.`, opener: "Oh hey, you look a little lost — need some help finding something?", tips: ['Perguntar: "Excuse me, how do I get to...?"', 'Distância: "Is it far from here?"', 'Confirmar: "So I turn left at the corner?"'] },
  { id: 'tech_support', title: 'Suporte técnico', description: 'Resolva um problema técnico por telefone em inglês', icon: '🛠️', level: 'Intermediário', context: 'Você liga para o suporte técnico de um produto ou serviço.', systemPrompt: `You are a tech support agent helping a Brazilian customer troubleshoot a problem (internet, phone, or software). Ask diagnostic questions and guide them step by step. After each response, give brief feedback in Portuguese about their English tech vocabulary, then continue.`, opener: "Thank you for calling Tech Support, my name is Chris. Can you describe the issue you're having today?", tips: ['Problema: "My internet keeps disconnecting."', 'Já tentei: "I already tried restarting it."', 'Pedir: "Could you walk me through it?"'] },
  { id: 'gym_signup', title: 'Matrícula na academia', description: 'Conheça os planos e se inscreva numa academia', icon: '🏋️', level: 'Iniciante/Inter.', context: 'Você visita uma academia para conhecer os planos.', systemPrompt: `You are a gym membership consultant in the US helping a Brazilian person sign up. Explain plans, prices, classes, and facilities. After each response, give brief feedback in Portuguese about their English, then continue in a friendly, motivating way.`, opener: "Hey, welcome in! First time here? Let me give you a quick tour. What are your fitness goals?", tips: ['Planos: "What membership plans do you offer?"', 'Preço: "How much is the monthly fee?"', 'Cancelar: "Can I cancel anytime?"'] },
  { id: 'hair_salon', title: 'No salão de cabeleireiro', description: 'Explique o corte que você quer em inglês', icon: '💇', level: 'Iniciante/Inter.', context: 'Você vai a um salão e explica o que deseja.', systemPrompt: `You are a hairstylist in the US with a Brazilian client. Ask what they want, suggest styles, and chat casually. After each response, give brief feedback in Portuguese about their English, then continue warmly.`, opener: "Hi, come on in, have a seat! So, what are we doing today — just a trim, or something different?", tips: ['Pedir: "Just a trim, please."', 'Comprimento: "Could you take a little off the sides?"', 'Cor: "I\'d like to dye it a bit darker."'] },
  { id: 'university_enroll', title: 'Matrícula na universidade', description: 'Tire dúvidas sobre cursos e matrícula em inglês', icon: '🎓', level: 'Intermediário', context: 'Você fala com a secretaria de uma universidade no exterior.', systemPrompt: `You are a university admissions advisor helping a Brazilian international student with enrollment. Discuss courses, credits, deadlines, and requirements. After each response, give brief feedback in Portuguese about their academic English, then continue helpfully.`, opener: "Hello! Welcome to the admissions office. Are you here about enrolling for the upcoming semester?", tips: ['Curso: "I\'d like to enroll in the... program."', 'Requisitos: "What are the requirements?"', 'Prazo: "When is the application deadline?"'] },
]


const baseLessons: Record<string, Lesson[]> = {
  beginner: [
    { title: 'Saudações e apresentações', sub: 'Hello, my name is...', icon: '👋', done: false, explanation: 'Em inglês, cumprimentar alguém corretamente faz toda a diferença.', tip: '"Good morning" é até meio-dia. "Good afternoon" é da tarde. "Good evening" é à noite.', examples: [{ en: 'Good morning! How are you?', pt: 'Bom dia!' }, { en: 'Hi, my name is Carlos. Nice to meet you!', pt: 'Oi, meu nome é Carlos. Prazer!' }, { en: "I'm fine, thank you. And you?", pt: 'Estou bem, obrigado.' }], q: [{ q: 'Como se diz "Bom dia"?', ctx: 'São 9h da manhã...', opts: ['Good morning', 'Good night', 'Good afternoon', 'Good evening'], ans: 0, exp: 'Good morning = Bom dia.' }, { q: 'Complete: "_____ name is João."', ctx: '', opts: ['My', 'Your', 'His', 'Me'], ans: 0, exp: 'My = meu/minha.' }, { q: 'Como responder "How are you?"', ctx: '', opts: ["I'm fine, thank you", 'Yes, I am', 'My name is Ana', 'Good morning'], ans: 0, exp: "I'm fine, thank you." }, { q: 'O que significa "Nice to meet you"?', ctx: '', opts: ['Prazer em te conhecer', 'Como vai você?', 'Até logo', 'Obrigado'], ans: 0, exp: 'Prazer em te conhecer.' }, { q: 'Como se despedir à noite?', ctx: '', opts: ['Good night', 'Good morning', 'Good evening', 'Goodbye'], ans: 0, exp: 'Good night = despedida para dormir.' }, { q: 'Forma informal de "Hello":', ctx: '', opts: ['Hi', 'Good morning', 'How do you do', 'Good afternoon'], ans: 0, exp: 'Hi é a forma informal de Hello.' }] },
    { title: 'Números de 1 a 100', sub: 'One, two, three...', icon: '🔢', done: false, explanation: 'De 13 a 19 terminam em "-teen". De 20 a 90 terminam em "-ty".', tip: 'Cuidado: thirteen (13) vs thirty (30).', examples: [{ en: 'I have twenty-five students.', pt: 'Tenho vinte e cinco alunos.' }, { en: 'The apartment is on the fifteenth floor.', pt: 'O apartamento fica no décimo quinto andar.' }, { en: 'She is forty-two years old.', pt: 'Ela tem quarenta e dois anos.' }], q: [{ q: 'Como se escreve 7?', ctx: '', opts: ['Seven', 'Eleven', 'Seventeen', 'Seventy'], ans: 0, exp: '7 = seven.' }, { q: '"Fifteen" é qual número?', ctx: '', opts: ['15', '50', '5', '500'], ans: 0, exp: 'Fifteen = 15.' }, { q: 'Como se diz 30?', ctx: '', opts: ['Thirty', 'Thirteen', 'Three', 'Threety'], ans: 0, exp: 'Thirty = 30.' }, { q: '"Forty-five" em número:', ctx: '', opts: ['45', '54', '405', '14'], ans: 0, exp: 'Forty-five = 45.' }, { q: 'Como se diz 100?', ctx: '', opts: ['One hundred', 'One thousand', 'Ten', 'Hundredty'], ans: 0, exp: '100 = one hundred.' }, { q: '"Eighty-three" é:', ctx: '', opts: ['83', '38', '80', '803'], ans: 0, exp: 'Eighty-three = 83.' }] },
    { title: 'Cores e adjetivos básicos', sub: 'Red, blue, big, small...', icon: '🎨', done: false, explanation: 'Em inglês, os adjetivos vêm ANTES do substantivo: "a red car".', tip: '"A beautiful girl" e "beautiful girls" — o adjetivo fica igual!', examples: [{ en: 'She has a big blue house.', pt: 'Ela tem uma casa azul grande.' }, { en: 'I want the small red bag.', pt: 'Eu quero a bolsa vermelha pequena.' }, { en: 'The old black car is mine.', pt: 'O carro preto velho é meu.' }], q: [{ q: '"Azul" em inglês:', ctx: '', opts: ['Blue', 'Green', 'Yellow', 'Purple'], ans: 0, exp: 'Blue = azul.' }, { q: '"Red" significa:', ctx: '', opts: ['Vermelho', 'Azul', 'Verde', 'Branco'], ans: 0, exp: 'Red = vermelho.' }, { q: '"Carro vermelho" em inglês:', ctx: '', opts: ['Red car', 'Car red', 'A car red', 'Car is red'], ans: 0, exp: 'Adjetivo ANTES: red car.' }, { q: '"Big" significa:', ctx: '', opts: ['Grande', 'Pequeno', 'Velho', 'Novo'], ans: 0, exp: 'Big = grande.' }, { q: '"Casa nova" em inglês:', ctx: '', opts: ['New house', 'House new', 'New houses', 'A house new'], ans: 0, exp: 'New house = casa nova.' }, { q: 'Oposto de "beautiful":', ctx: '', opts: ['Ugly', 'Small', 'Old', 'Short'], ans: 0, exp: 'Ugly = feio.' }] },
    { title: 'Família e pessoas', sub: 'Mother, father, brother...', icon: '👨‍👩‍👧', done: false, explanation: '"Grand-" indica avós. "Cousin" serve para primo E prima.', tip: '"Cousin" não tem distinção de gênero.', examples: [{ en: 'My mother and father are both doctors.', pt: 'Minha mãe e meu pai são médicos.' }, { en: 'I have two brothers and one sister.', pt: 'Tenho dois irmãos e uma irmã.' }, { en: 'My grandparents live in the countryside.', pt: 'Meus avós moram no interior.' }], q: [{ q: '"Irmã" em inglês:', ctx: '', opts: ['Sister', 'Brother', 'Mother', 'Daughter'], ans: 0, exp: 'Sister = irmã.' }, { q: '"My father is a doctor." Significa:', ctx: '', opts: ['Meu pai é médico', 'Meu irmão é professor', 'Minha mãe é dentista', 'Meu filho é engenheiro'], ans: 0, exp: 'Father = pai.' }, { q: '"Avó" em inglês:', ctx: '', opts: ['Grandmother', 'Grandfather', 'Aunt', 'Mother'], ans: 0, exp: 'Grandmother = avó.' }, { q: '"Cousin" significa:', ctx: '', opts: ['Primo/Prima', 'Irmão/Irmã', 'Sobrinho', 'Tio/Tia'], ans: 0, exp: 'Cousin = primo ou prima.' }, { q: '"Marido" em inglês:', ctx: '', opts: ['Husband', 'Wife', 'Brother', 'Father'], ans: 0, exp: 'Husband = marido.' }, { q: '"Nephew" significa:', ctx: '', opts: ['Sobrinho', 'Neto', 'Primo', 'Filho'], ans: 0, exp: 'Nephew = sobrinho.' }] },
    { title: 'Dias, meses e datas', sub: 'Monday, January...', icon: '📅', done: false, explanation: 'Dias e meses sempre com MAIÚSCULA.', tip: 'Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.', examples: [{ en: 'My birthday is on March 15th.', pt: 'Meu aniversário é no dia 15 de março.' }, { en: 'The meeting is on Monday morning.', pt: 'A reunião é na segunda-feira.' }, { en: 'See you next Wednesday!', pt: 'Te vejo na próxima quarta!' }], q: [{ q: '"Segunda-feira" em inglês:', ctx: '', opts: ['Monday', 'Tuesday', 'Sunday', 'Friday'], ans: 0, exp: 'Monday = segunda.' }, { q: '"Janeiro" em inglês:', ctx: '', opts: ['January', 'June', 'July', 'February'], ans: 0, exp: 'January = janeiro.' }, { q: 'Mês depois de "March":', ctx: '', opts: ['April', 'February', 'May', 'June'], ans: 0, exp: 'April (abril).' }, { q: '"Last Friday" significa:', ctx: '', opts: ['Na sexta passada', 'Na próxima sexta', 'Toda sexta', 'Na sexta à noite'], ans: 0, exp: 'Last = passado.' }, { q: '"Fim de semana" em inglês:', ctx: '', opts: ['Weekend', 'Weekday', 'Holiday', 'Week'], ans: 0, exp: 'Weekend = fim de semana.' }, { q: 'Terceiro mês do ano:', ctx: '', opts: ['March', 'May', 'February', 'April'], ans: 0, exp: 'March = março.' }] },
    { title: 'Comida e bebidas', sub: 'Rice, chicken, water...', icon: '🍽️', done: false, explanation: 'Para pedir educadamente: "I would like...".', tip: '"I am starving!" = morrendo de fome.', examples: [{ en: 'I would like a glass of water, please.', pt: 'Eu gostaria de um copo de água.' }, { en: 'This chicken and rice is delicious!', pt: 'Este frango com arroz está delicioso!' }, { en: 'I am hungry. Can we eat now?', pt: 'Estou com fome.' }], q: [{ q: '"Frango" em inglês:', ctx: '', opts: ['Chicken', 'Beef', 'Pork', 'Fish'], ans: 0, exp: 'Chicken = frango.' }, { q: '"Breakfast" é:', ctx: '', opts: ['Café da manhã', 'Almoço', 'Jantar', 'Lanche'], ans: 0, exp: 'Breakfast = café.' }, { q: 'Como dizer "Estou com sede":', ctx: '', opts: ['I am thirsty', 'I am hungry', 'I am tired', 'I am full'], ans: 0, exp: 'Thirsty = com sede.' }, { q: '"Delicious" significa:', ctx: '', opts: ['Delicioso', 'Horrível', 'Salgado', 'Doce'], ans: 0, exp: 'Delicious = delicioso.' }, { q: 'Como pedir educadamente:', ctx: '', opts: ['I would like a coffee, please.', 'Give me a coffee.', 'I want coffee now.', 'Coffee!'], ans: 0, exp: '"I would like" é a forma mais educada.' }, { q: '"Arroz" em inglês:', ctx: '', opts: ['Rice', 'Beans', 'Bread', 'Pasta'], ans: 0, exp: 'Rice = arroz.' }] },
    { title: 'No restaurante', sub: 'Ordering food, paying...', icon: '🍴', done: false, explanation: 'Para chamar o garçom: "Excuse me!" Para a conta: "Can I have the bill?"', tip: '"What do you recommend?" = O que você recomenda?', examples: [{ en: 'A table for two, please.', pt: 'Uma mesa para dois.' }, { en: 'What do you recommend?', pt: 'O que você recomenda?' }, { en: 'Can I have the bill, please?', pt: 'Posso pegar a conta?' }], q: [{ q: 'Como pedir mesa para 4:', ctx: '', opts: ['A table for four, please.', 'Four tables, please.', 'I need four seats.', 'Table four.'], ans: 0, exp: '"A table for [número]".' }, { q: '"Menu" significa:', ctx: '', opts: ['Cardápio', 'Conta', 'Prato', 'Garçom'], ans: 0, exp: 'Menu = cardápio.' }, { q: 'Como dizer que é vegetariano:', ctx: '', opts: ['I am vegetarian.', 'I do not eat.', 'No meat menu.', 'Vegetables only.'], ans: 0, exp: '"I am vegetarian".' }, { q: '"Is service included?" significa:', ctx: '', opts: ['A gorjeta está incluída?', 'O serviço está aberto?', 'Posso pagar?', 'Aceitam cartão?'], ans: 0, exp: 'Service = gorjeta.' }, { q: 'Como elogiar a comida:', ctx: '', opts: ['The food is excellent!', 'Food is good.', 'I like eat.', 'Very food!'], ans: 0, exp: '"Excellent!" ou "delicious!".' }, { q: 'Como perguntar se aceitam cartão:', ctx: '', opts: ['Do you accept credit cards?', 'Card payment?', 'I have a card.', 'No cash.'], ans: 0, exp: '"Do you accept credit cards?"' }] },
    { title: 'Partes do corpo', sub: 'Head, shoulders, knees...', icon: '🧍', done: false, explanation: '"My [parte] hurts." Headache = dor de cabeça.', tip: '"My back hurts" = minhas costas doem.', examples: [{ en: 'My back hurts after work.', pt: 'Minhas costas doem.' }, { en: 'She broke her arm playing football.', pt: 'Ela quebrou o braço.' }, { en: 'I have a terrible headache today.', pt: 'Estou com dor de cabeça.' }], q: [{ q: '"Joelho" em inglês:', ctx: '', opts: ['Knee', 'Elbow', 'Ankle', 'Wrist'], ans: 0, exp: 'Knee = joelho.' }, { q: '"Shoulder" significa:', ctx: '', opts: ['Ombro', 'Cotovelo', 'Pescoço', 'Costas'], ans: 0, exp: 'Shoulder = ombro.' }, { q: 'Como dizer "Minha cabeça dói":', ctx: '', opts: ['My head hurts.', 'I have head.', 'Head is bad.', 'My head is hurt.'], ans: 0, exp: '"My [parte] hurts."' }, { q: '"Dedo do pé" em inglês:', ctx: '', opts: ['Toe', 'Finger', 'Thumb', 'Heel'], ans: 0, exp: 'Toe = dedo do pé.' }, { q: '"Stomach" significa:', ctx: '', opts: ['Estômago/barriga', 'Costas', 'Peito', 'Pescoço'], ans: 0, exp: 'Stomach = estômago.' }, { q: '"Braço" em inglês:', ctx: '', opts: ['Arm', 'Hand', 'Leg', 'Foot'], ans: 0, exp: 'Arm = braço.' }] },
    { title: 'O verbo To Be', sub: 'I am, you are, he is...', icon: '🔤', done: false, explanation: 'To be: I am, you are, he/she/it is, we/you/they are. Passado: was/were.', tip: "Contrações: I'm, you're, he's, she's, we're, they're.", examples: [{ en: 'I am a student. She is a teacher.', pt: 'Sou estudante. Ela é professora.' }, { en: 'We are tired after the trip.', pt: 'Estamos cansados.' }, { en: 'Is he from Brazil? Yes, he is.', pt: 'Ele é do Brasil? Sim.' }], q: [{ q: '"I _____ Brazilian."', ctx: '', opts: ['am', 'is', 'are', 'be'], ans: 0, exp: 'Com "I" sempre "am".' }, { q: '"They _____ very happy."', ctx: '', opts: ['are', 'is', 'am', 'be'], ans: 0, exp: 'Com they/we/you: "are".' }, { q: 'Negativa de "I am tired":', ctx: '', opts: ['I am not tired.', 'I not am tired.', "I don't am tired.", "I isn't tired."], ans: 0, exp: 'Negativa: am/is/are + not.' }, { q: '"She is not here." — contração:', ctx: '', opts: ["She isn't here.", "She aren't here.", "She not is here.", "She amn't here."], ans: 0, exp: "Is not = isn't." }, { q: '"Were you at the party?" Quando?', ctx: '', opts: ['No passado', 'No presente', 'No futuro', 'Agora'], ans: 0, exp: 'Were = passado de "are".' }, { q: 'Como perguntar de onde alguém é:', ctx: '', opts: ['Where are you from?', 'Who are you?', 'What is you?', 'Where you from?'], ans: 0, exp: '"Where are you from?"' }] },
    { title: 'Verbos do cotidiano', sub: 'Eat, sleep, work, study...', icon: '⚡', done: false, explanation: 'Terceira pessoa leva "-s": "I eat" mas "she eats".', tip: 'Rotina: wake up, get dressed, have breakfast, go to work, go to bed.', examples: [{ en: 'I wake up at 6am every day.', pt: 'Acordo às 6h todo dia.' }, { en: 'She works at a hospital.', pt: 'Ela trabalha num hospital.' }, { en: 'We eat dinner together on Sundays.', pt: 'Jantamos juntos.' }], q: [{ q: '"Dormir" em inglês:', ctx: '', opts: ['Sleep', 'Wake', 'Rest', 'Dream'], ans: 0, exp: 'Sleep = dormir.' }, { q: '"She _____ to work by bus."', ctx: '', opts: ['goes', 'go', 'going', 'gone'], ans: 0, exp: 'Com she/he/it: goes.' }, { q: '"Study" significa:', ctx: '', opts: ['Estudar', 'Trabalhar', 'Brincar', 'Correr'], ans: 0, exp: 'Study = estudar.' }, { q: 'Passado de "eat":', ctx: '"I _____ pizza yesterday."', opts: ['ate', 'eated', 'eat', 'aten'], ans: 0, exp: 'Eat → ate.' }, { q: 'Como dizer "tomar banho":', ctx: '', opts: ['Take a shower', 'Make a shower', 'Do a shower', 'Have a shower'], ans: 0, exp: 'Take/have a shower.' }, { q: '"Cook" significa:', ctx: '', opts: ['Cozinhar', 'Comer', 'Limpar', 'Comprar'], ans: 0, exp: 'Cook = cozinhar.' }] },
    { title: 'Animais e natureza', sub: 'Dog, cat, river, mountain...', icon: '🐾', done: false, explanation: 'Wild = selvagem. Pet = animal de estimação.', tip: 'Endangered = em extinção. Biodiversity = biodiversidade.', examples: [{ en: 'There is a beautiful waterfall in the forest.', pt: 'Há uma cachoeira linda na floresta.' }, { en: 'The dog is playing in the garden.', pt: 'O cachorro está brincando.' }, { en: 'Brazil has incredible biodiversity.', pt: 'O Brasil tem biodiversidade incrível.' }], q: [{ q: '"Cachorro" em inglês:', ctx: '', opts: ['Dog', 'Cat', 'Bird', 'Horse'], ans: 0, exp: 'Dog = cachorro.' }, { q: '"River" significa:', ctx: '', opts: ['Rio', 'Mar', 'Lago', 'Cachoeira'], ans: 0, exp: 'River = rio.' }, { q: '"Floresta" em inglês:', ctx: '', opts: ['Forest', 'Desert', 'Beach', 'Mountain'], ans: 0, exp: 'Forest = floresta.' }, { q: '"Wild" significa:', ctx: '', opts: ['Selvagem', 'Domesticado', 'Perigoso', 'Raro'], ans: 0, exp: 'Wild = selvagem.' }, { q: '"Abelha" em inglês:', ctx: '', opts: ['Bee', 'Ant', 'Fly', 'Butterfly'], ans: 0, exp: 'Bee = abelha.' }, { q: '"Sunrise" significa:', ctx: '', opts: ['Nascer do sol', 'Pôr do sol', 'Lua cheia', 'Tempestade'], ans: 0, exp: 'Sunrise = nascer do sol.' }] },
    { title: 'Profissões', sub: 'Doctor, teacher, engineer...', icon: '👩‍⚕️', done: false, explanation: '"I am a/an + profissão". Use "a" antes de consoante, "an" antes de vogal.', tip: '"What do you do for a living?" = Qual é a sua profissão?', examples: [{ en: 'My sister is a nurse at the city hospital.', pt: 'Minha irmã é enfermeira.' }, { en: 'He works as an engineer at a tech company.', pt: 'Ele trabalha como engenheiro.' }, { en: 'What do you do for a living?', pt: 'Qual é a sua profissão?' }], q: [{ q: '"Advogado" em inglês:', ctx: '', opts: ['Lawyer', 'Doctor', 'Engineer', 'Accountant'], ans: 0, exp: 'Lawyer = advogado.' }, { q: '"She is _____ architect."', ctx: '', opts: ['an', 'a', 'the', 'one'], ans: 0, exp: '"An" antes de vogal.' }, { q: 'Como perguntar a profissão:', ctx: '', opts: ['What do you do?', 'Who are you?', 'What are you?', 'How do you work?'], ans: 0, exp: '"What do you do?"' }, { q: '"Firefighter" é:', ctx: '', opts: ['Bombeiro', 'Policial', 'Segurança', 'Soldado'], ans: 0, exp: 'Firefighter = bombeiro.' }, { q: 'Como dizer "Sou professor":', ctx: '', opts: ['I am a teacher.', 'I am teacher.', 'I work teacher.', 'I do teaching.'], ans: 0, exp: '"I am a teacher."' }, { q: '"Self-employed" significa:', ctx: '', opts: ['Autônomo', 'Desempregado', 'Funcionário público', 'Aposentado'], ans: 0, exp: 'Self-employed = autônomo.' }] },
    { title: 'Tempo e clima', sub: 'Sunny, rainy, hot, cold...', icon: '🌤️', done: false, explanation: '"It is" + adjetivo de clima. O "It" é obrigatório.', tip: '"What is the weather like?" = Como está o tempo?', examples: [{ en: 'It is sunny and warm today.', pt: 'Está ensolarado e quente.' }, { en: 'It was raining all day yesterday.', pt: 'Estava chovendo o dia todo.' }, { en: "What's the weather like today?", pt: 'Como está o tempo hoje?' }], q: [{ q: 'Como dizer "Está chovendo":', ctx: '', opts: ['It is raining.', 'Rain is happening.', 'The rain is.', 'Is raining.'], ans: 0, exp: '"It is raining."' }, { q: '"Cloudy" significa:', ctx: '', opts: ['Nublado', 'Ensolarado', 'Ventoso', 'Nevando'], ans: 0, exp: 'Cloudy = nublado.' }, { q: 'Como dizer "Está muito quente":', ctx: '', opts: ['It is very hot.', 'The weather is heat.', 'Is very hot.', 'Too much hot.'], ans: 0, exp: '"It is hot."' }, { q: '"Forecast" significa:', ctx: '', opts: ['Previsão do tempo', 'Temperatura', 'Tempestade', 'Estação'], ans: 0, exp: 'Weather forecast = previsão do tempo.' }, { q: '"As quatro estações" em inglês:', ctx: '', opts: ['The four seasons', 'The four climates', 'The four weathers', 'The four times'], ans: 0, exp: 'Spring, Summer, Autumn, Winter.' }, { q: '"It is freezing!" significa:', ctx: '', opts: ['Está muito frio', 'Está muito quente', 'Está nevando', 'Está ventando'], ans: 0, exp: 'Freezing = congelando.' }] },
    { title: 'Adjetivos de personalidade', sub: 'Friendly, shy, brave...', icon: '😊', done: false, explanation: '"He/She is + adjetivo". Adjetivos não variam em gênero/número.', tip: '"Quite shy" = bastante tímido.', examples: [{ en: 'My brother is very outgoing and funny.', pt: 'Meu irmão é extrovertido e engraçado.' }, { en: 'She is hardworking and reliable.', pt: 'Ela é trabalhadora e confiável.' }, { en: 'He can be stubborn sometimes.', pt: 'Ele pode ser teimoso às vezes.' }], q: [{ q: '"Shy" significa:', ctx: '', opts: ['Tímido', 'Extrovertido', 'Corajoso', 'Preguiçoso'], ans: 0, exp: 'Shy = tímido.' }, { q: '"Generoso" em inglês:', ctx: '', opts: ['Generous', 'Greedy', 'Selfish', 'Rude'], ans: 0, exp: 'Generous = generoso.' }, { q: '"Reliable" significa:', ctx: '', opts: ['Confiável', 'Criativo', 'Ambicioso', 'Paciente'], ans: 0, exp: 'Reliable = confiável.' }, { q: 'Oposto de "hardworking":', ctx: '', opts: ['Lazy', 'Shy', 'Rude', 'Selfish'], ans: 0, exp: 'Lazy = preguiçoso.' }, { q: '"Engraçado" em inglês:', ctx: '', opts: ['Funny', 'Serious', 'Boring', 'Quiet'], ans: 0, exp: 'Funny = engraçado.' }, { q: '"Open-minded" significa:', ctx: '', opts: ['Mente aberta/tolerante', 'Muito inteligente', 'Extrovertido', 'Honesto'], ans: 0, exp: 'Open-minded = mente aberta.' }] },
    { title: 'Transporte e direções', sub: 'Bus, train, turn left...', icon: '🚌', done: false, explanation: '"Take the bus/train/subway" = pegar transporte. Go straight = em frente.', tip: '"How do I get to...?" = Como chego a...?', examples: [{ en: 'Take the subway to downtown, then walk two blocks.', pt: 'Pegue o metrô ao centro.' }, { en: 'How do I get to the airport?', pt: 'Como eu chego ao aeroporto?' }, { en: 'The bus stop is just around the corner.', pt: 'O ponto fica na esquina.' }], q: [{ q: '"Metrô" em inglês:', ctx: '', opts: ['Subway / Metro', 'Train', 'Tram', 'Bus'], ans: 0, exp: 'Subway (EUA) / Metro (UK).' }, { q: '"Go straight for two blocks." significa:', ctx: '', opts: ['Siga dois quarteirões em frente', 'Vire à direita', 'Vire à esquerda', 'Pare'], ans: 0, exp: 'Go straight = em frente.' }, { q: 'Como dizer "pegar o ônibus":', ctx: '', opts: ['Take/catch the bus', 'Ride the bus only', 'Use the bus', 'Board the bus only'], ans: 0, exp: '"Take" ou "catch the bus".' }, { q: '"Fare" significa:', ctx: '', opts: ['Tarifa/passagem', 'Horário', 'Rota', 'Parada'], ans: 0, exp: 'Fare = tarifa.' }, { q: '"Within walking distance" significa:', ctx: '', opts: ['Dá para ir a pé', 'É muito longe', 'Só de carro', 'Outro lado da cidade'], ans: 0, exp: 'Perto o suficiente para ir a pé.' }, { q: 'Como perguntar quanto tempo leva:', ctx: '', opts: ['How long does it take?', 'How much time is?', 'What time does it take?', 'How far takes?'], ans: 0, exp: '"How long does it take?"' }] },
    { title: 'Compras e dinheiro', sub: 'Price, cheap, expensive...', icon: '🛍️', done: false, explanation: '"How much is it?" = Quanto custa? "On sale" = em promoção.', tip: '"I am just browsing" = só estou olhando.', examples: [{ en: 'How much does this cost?', pt: 'Quanto custa isso?' }, { en: 'This jacket is on sale — 30% off!', pt: 'Essa jaqueta está em promoção!' }, { en: 'Can I pay by credit card?', pt: 'Posso pagar com cartão?' }], q: [{ q: 'Como perguntar o preço:', ctx: '', opts: ['How much is it?', 'What is the price?', 'How many does it cost?', 'What cost is?'], ans: 0, exp: '"How much is it?"' }, { q: '"Expensive" significa:', ctx: '', opts: ['Caro', 'Barato', 'Grátis', 'Em promoção'], ans: 0, exp: 'Expensive = caro.' }, { q: 'Como pedir desconto:', ctx: '', opts: ['Can you give me a discount?', 'Make it cheaper.', 'I want less price.', 'Discount now!'], ans: 0, exp: '"Can you give me a discount?"' }, { q: '"Receipt" é:', ctx: '', opts: ['Recibo/nota fiscal', 'Preço', 'Etiqueta', 'Embalagem'], ans: 0, exp: 'Receipt = recibo.' }, { q: '"I am just browsing." significa:', ctx: '', opts: ['Só estou olhando', 'Quero comprar tudo', 'Procuro algo específico', 'Vou voltar'], ans: 0, exp: '"Just browsing" = só olhando.' }, { q: 'Como pedir para trocar:', ctx: '', opts: ['I would like to exchange this.', 'I want another one.', 'This is wrong.', 'Change this.'], ans: 0, exp: '"I would like to exchange/return this."' }] },
  ],
  intermediate: [
    { title: 'Present Perfect na prática', sub: 'Have you ever...?', icon: '⏰', done: false, explanation: 'Conecta o passado ao presente. Estrutura: have/has + particípio.', tip: 'Palavras-chave: already, yet, just, ever, never, since, for.', examples: [{ en: "I have already eaten. I'm not hungry.", pt: 'Já comi.' }, { en: 'She has never been to Europe.', pt: 'Ela nunca foi à Europa.' }, { en: 'Have you ever tried sushi?', pt: 'Você já provou sushi?' }], q: [{ q: 'Qual usa Present Perfect corretamente?', ctx: '', opts: ['I have visited Paris', 'I have visited Paris last year', 'I visited Paris recently', 'I am visiting Paris'], ans: 0, exp: 'Tempo indefinido: Present Perfect.' }, { q: '"She _____ never eaten sushi."', ctx: '', opts: ['has', 'have', 'had', 'is'], ans: 0, exp: "Com she/he/it: 'has'." }, { q: '"I have just arrived." Quando?', ctx: '', opts: ['Acabei de chegar', 'Há muito tempo', 'Vou chegar logo', 'Ontem'], ans: 0, exp: '"Just" = há pouquíssimo tempo.' }, { q: 'Since vs For:', ctx: '"___ 2010" / "___ 5 years"', opts: ['since / for', 'for / since', 'since / since', 'for / for'], ans: 0, exp: 'Since = desde. For = por/há.' }, { q: '"Have you _____ been to London?"', ctx: '', opts: ['ever', 'already', 'just', 'yet'], ans: 0, exp: '"Ever" = alguma vez.' }, { q: 'Como perguntar se algo já foi feito:', ctx: '', opts: ['Have you finished yet?', 'Did you finish yet?', 'Have you finish?', 'You have finished?'], ans: 0, exp: '"Yet" em perguntas.' }] },
    { title: 'Conditional — If clauses', sub: 'If I were rich...', icon: '🔀', done: false, explanation: '1º: If + present + will. 2º: If + were/past + would. Nunca "would" na cláusula com "if".', tip: 'Use WERE para todas as pessoas no 2º condicional.', examples: [{ en: 'If I study hard, I will pass.', pt: 'Se estudar muito, vou passar.' }, { en: 'If I were you, I would apologize.', pt: 'Se eu fosse você, pediria desculpas.' }, { en: 'What would you do if you won the lottery?', pt: 'O que faria se ganhasse na loteria?' }], q: [{ q: 'Para situação possível no futuro:', ctx: '', opts: ['1st Conditional (will)', '2nd Conditional (would)', '3rd Conditional', 'Zero Conditional'], ans: 0, exp: '1º: If + Simple Present + will.' }, { q: '"If I _____ a millionaire, I would travel."', ctx: '', opts: ['were', 'am', 'will be', 'was being'], ans: 0, exp: '2º: If + were/past.' }, { q: '"If it rains, I _____ stay home."', ctx: '', opts: ['will', 'would', 'should', 'could'], ans: 0, exp: '1º: will.' }, { q: '"I would travel if I had money" significa:', ctx: '', opts: ['Eu viajaria se tivesse', 'Vou viajar se tiver', 'Viajei quando tinha', 'Viajo quando tenho'], ans: 0, exp: 'Would = hipotético.' }, { q: 'Qual está correta?', ctx: '', opts: ['If she studies, she will pass.', 'If she would study, she will pass.', 'If she studies, she would pass.', 'If she will study, she passes.'], ans: 0, exp: 'If + Simple Present + will.' }, { q: '"What would you do if you _____ president?"', ctx: '', opts: ['were', 'are', 'will be', 'had been'], ans: 0, exp: '2º: If + were.' }] },
    { title: 'Phrasal verbs essenciais', sub: 'Give up, look up, turn on...', icon: '🔄', done: false, explanation: 'Verbo + preposição com significado completamente novo. Não traduza literalmente.', tip: 'Mais usados: get up, wake up, look up, turn on/off, give up, figure out.', examples: [{ en: 'I gave up eating sugar last month.', pt: 'Parei de comer açúcar.' }, { en: 'Can you look up this word?', pt: 'Pode pesquisar essa palavra?' }, { en: "I can't figure out how to fix this.", pt: 'Não consigo descobrir como consertar.' }], q: [{ q: '"Give up" significa:', ctx: '', opts: ['Desistir', 'Continuar', 'Começar', 'Dar de presente'], ans: 0, exp: 'Give up = desistir.' }, { q: '"Turn off the TV" — o que fazer:', ctx: '', opts: ['Desligar a TV', 'Ligar', 'Aumentar volume', 'Trocar canal'], ans: 0, exp: 'Turn off = desligar.' }, { q: '"Look up" significa:', ctx: '', opts: ['Pesquisar/consultar', 'Olhar para cima', 'Ignorar', 'Escrever'], ans: 0, exp: 'Look up = pesquisar.' }, { q: '"Think it over" significa:', ctx: '', opts: ['Pensar bem', 'Pensar rápido', 'Já decidir', 'Não pensar'], ans: 0, exp: 'Think over = pensar bem.' }, { q: 'Como dizer "Me ligue de volta":', ctx: '', opts: ['Call me back.', 'Call me again.', 'Call back me.', 'Phone me return.'], ans: 0, exp: 'Call back = ligar de volta.' }, { q: '"We ran out of coffee" significa:', ctx: '', opts: ['O café acabou', 'Corremos para o café', 'Compramos mais', 'Jogamos fora'], ans: 0, exp: 'Run out of = acabar.' }] },
    { title: 'Passive Voice', sub: 'The cake was made by...', icon: '🔁', done: false, explanation: 'Foca na ação/objeto. Estrutura: sujeito + to be + particípio.', tip: 'Presente: is/are + particípio. Passado: was/were + particípio.', examples: [{ en: 'This bridge was built in 1895.', pt: 'Esta ponte foi construída em 1895.' }, { en: 'English is spoken in 50+ countries.', pt: 'O inglês é falado em mais de 50 países.' }, { en: 'The package will be delivered tomorrow.', pt: 'O pacote será entregue amanhã.' }], q: [{ q: 'Passiva de "They built the house":', ctx: '', opts: ['The house was built.', 'The house is building.', 'They were building.', 'The house built.'], ans: 0, exp: 'Passado passivo: was + particípio.' }, { q: '"English _____ all over the world."', ctx: '', opts: ['is spoken', 'speaks', 'is speaking', 'was speak'], ans: 0, exp: 'Presente passivo: is + particípio.' }, { q: 'A voz passiva enfatiza:', ctx: '', opts: ['O objeto da ação', 'Quem fez', 'O tempo', 'O lugar'], ans: 0, exp: 'Passiva foca no objeto.' }, { q: 'Futuro passivo de "They will deliver it":', ctx: '', opts: ['It will be delivered.', 'It will delivered.', 'It is being delivered.', 'It was delivered.'], ans: 0, exp: 'Futuro: will be + particípio.' }, { q: '"Three people were arrested." Quem?', ctx: '', opts: ['Três pessoas', 'A polícia', 'Ninguém', 'Um suspeito'], ans: 0, exp: 'Were arrested = foram presos.' }, { q: 'Qual está na voz passiva?', ctx: '', opts: ['The report was written by Ana.', 'Ana wrote the report.', 'Ana is writing.', 'Ana had written it.'], ans: 0, exp: '"Was written" = voz passiva.' }] },
    { title: 'Reported Speech', sub: 'He said that...', icon: '💬', done: false, explanation: 'O tempo verbal recua um grau. "I am tired" → She said she was tired.', tip: '"Told" precisa de objeto: told me, told her. "Said" não precisa.', examples: [{ en: 'She said she was tired.', pt: 'Ela disse que estava cansada.' }, { en: 'He told me he would call later.', pt: 'Ele me disse que ligaria mais tarde.' }, { en: 'They asked if I could help them.', pt: 'Perguntaram se eu poderia ajudá-los.' }], q: [{ q: '"I am happy." → She said she _____ happy.', ctx: '', opts: ['was', 'is', 'were', 'had been'], ans: 0, exp: 'Presente → passado.' }, { q: '"I will help." → He said he _____ help.', ctx: '', opts: ['would', 'will', 'could', 'should'], ans: 0, exp: 'Will → would.' }, { q: 'Diferença said/told:', ctx: '', opts: ['told precisa de objeto', 'São idênticos', 'said é mais formal', 'told é mais antigo'], ans: 0, exp: '"Told me/her/him". Said não precisa.' }, { q: '"Are you coming?" → She asked if I _____ coming.', ctx: '', opts: ['was', 'am', 'were', 'is'], ans: 0, exp: 'Tempo recuado.' }, { q: 'Como reportar "I can swim":', ctx: '', opts: ['He said he could swim.', 'He said he can swim.', 'He told swim.', 'He said I could swim.'], ans: 0, exp: 'Can → could.' }, { q: '"She _____ me the meeting was cancelled."', ctx: '', opts: ['told', 'said', 'spoke', 'talked'], ans: 0, exp: '"Told me" precisa de objeto.' }] },
    { title: 'Modal Verbs', sub: 'Can, should, must...', icon: '⚙️', done: false, explanation: 'Nunca levam "s" na 3ª pessoa. Seguidos pelo verbo base sem "to".', tip: 'Can (habilidade), should (conselho), must (obrigação), might (possibilidade).', examples: [{ en: 'You should see a doctor.', pt: 'Você deveria ver um médico.' }, { en: 'I can speak three languages.', pt: 'Sei falar três idiomas.' }, { en: 'You must not smoke here.', pt: 'Não pode fumar aqui.' }], q: [{ q: 'Modal para conselho:', ctx: '', opts: ['should', 'must', 'can', 'will'], ans: 0, exp: 'Should = deveria.' }, { q: '"She _____ speak French." (habilidade)', ctx: '', opts: ['can', 'must', 'should', 'might'], ans: 0, exp: 'Can = saber fazer.' }, { q: '"Must not" expressa:', ctx: '', opts: ['Proibição', 'Conselho', 'Possibilidade', 'Habilidade'], ans: 0, exp: 'Must not = proibição.' }, { q: '"It might rain." significa:', ctx: '', opts: ['Talvez chova', 'Vai chover', 'Não vai chover', 'Deve chover'], ans: 0, exp: 'Might = talvez.' }, { q: 'Qual está ERRADA:', ctx: '', opts: ['She musts go now.', 'She must go now.', 'She should go now.', 'She can go now.'], ans: 0, exp: 'Modais nunca levam "s".' }, { q: '"Would you like coffee?" É:', ctx: '', opts: ['Oferta educada', 'Ordem', 'Permissão', 'Obrigação'], ans: 0, exp: '"Would you like?" = oferta educada.' }] },
    { title: 'Simple Past vs Present Perfect', sub: 'I went vs I have gone...', icon: '⏳', done: false, explanation: 'Simple Past: tempo definido. Present Perfect: experiência sem tempo definido.', tip: 'Com "yesterday/last year": Simple Past. Sem marcador: Present Perfect.', examples: [{ en: 'I visited London last summer.', pt: 'Visitei Londres no verão passado.' }, { en: 'I have visited London twice.', pt: 'Já visitei Londres duas vezes.' }, { en: 'Have you eaten yet?', pt: 'Você já comeu?' }], q: [{ q: 'Com "last year" — qual tempo?', ctx: '"I _____ to Japan last year."', opts: ['went', 'have gone', 'go', 'have went'], ans: 0, exp: 'Tempo definido = Simple Past.' }, { q: 'Para experiência de vida:', ctx: '"_____ you ever eaten frog?"', opts: ['Have', 'Did', 'Do', 'Were'], ans: 0, exp: 'Experiência = Present Perfect.' }, { q: '"She has lost her keys." implica:', ctx: '', opts: ['Ainda não achou', 'Perdeu no passado', 'Já achou', 'Vai perder'], ans: 0, exp: 'Present Perfect = impacto no presente.' }, { q: 'Qual está correta?', ctx: '', opts: ['I saw this film yesterday.', 'I have seen this film yesterday.', 'I have saw it yesterday.', 'I did see it yesterday.'], ans: 0, exp: 'Com "yesterday": Simple Past.' }, { q: '"I have never tried Indian food." Qual tempo?', ctx: '', opts: ['Present Perfect', 'Simple Past', 'Simple Present', 'Past Perfect'], ans: 0, exp: '"Never" + experiência = Present Perfect.' }, { q: 'Como perguntar sobre experiência de vida:', ctx: '', opts: ['Have you ever been to Japan?', 'Did you go to Japan?', 'Were you in Japan?', 'Do you go to Japan?'], ans: 0, exp: '"Have you ever been?"' }] },
    { title: 'Preposições de tempo e lugar', sub: 'In, on, at, since, for...', icon: '📍', done: false, explanation: 'AT para momentos precisos. ON para dias. IN para períodos longos e espaços fechados.', tip: 'IN (mês, ano, estação) / ON (dia, data) / AT (hora, night).', examples: [{ en: 'I was born in 1990, on a Tuesday, at 3am.', pt: 'Nasci em 1990, numa terça, às 3h.' }, { en: 'She lives at 42 Oak Street, in London.', pt: 'Ela mora na Rua Oak 42, em Londres.' }, { en: 'The meeting is on Monday at 9am.', pt: 'A reunião é na segunda às 9h.' }], q: [{ q: '"I was born _____ 1995."', ctx: '', opts: ['in', 'on', 'at', 'during'], ans: 0, exp: 'IN = anos, meses, estações.' }, { q: '"The party is _____ Friday."', ctx: '', opts: ['on', 'in', 'at', 'by'], ans: 0, exp: 'ON = dias da semana.' }, { q: '"The class starts _____ 8am."', ctx: '', opts: ['at', 'in', 'on', 'by'], ans: 0, exp: 'AT = horas específicas.' }, { q: '"She lives _____ Brazil."', ctx: '', opts: ['in', 'at', 'on', 'by'], ans: 0, exp: 'IN para países.' }, { q: '"The keys are _____ the table."', ctx: '', opts: ['on', 'in', 'at', 'above'], ans: 0, exp: 'ON = superfície.' }, { q: '"I will be ready _____ 10 minutes."', ctx: '', opts: ['in', 'on', 'at', 'after'], ans: 0, exp: 'IN + futuro = daqui a.' }] },
    { title: 'Question Words', sub: 'Who, what, where, when, why...', icon: '❓', done: false, explanation: 'Perguntas exigem inversão: auxiliar + sujeito + verbo.', tip: 'Who (quem), What (o quê), Where (onde), When (quando), Why (por quê), How (como).', examples: [{ en: 'Where do you live?', pt: 'Onde você mora?' }, { en: 'Why did she leave so early?', pt: 'Por que ela foi embora tão cedo?' }, { en: 'How long have you been studying?', pt: 'Há quanto tempo você estuda?' }], q: [{ q: '"Onde você trabalha?" em inglês:', ctx: '', opts: ['Where do you work?', 'Where you work?', 'Where works you?', 'Do you work where?'], ans: 0, exp: 'WH + auxiliar + sujeito + verbo.' }, { q: '"_____ is your favorite movie?"', ctx: '', opts: ['What', 'Which', 'Who', 'How'], ans: 0, exp: 'What = o quê/qual.' }, { q: '"_____ are you crying?"', ctx: '', opts: ['Why', 'How', 'What', 'When'], ans: 0, exp: 'Why = por quê.' }, { q: '"How much" vs "How many":', ctx: '', opts: ['much = incontável / many = contável', 'many = incontável / much = contável', 'São idênticos', 'much = formal'], ans: 0, exp: 'How much = incontável.' }, { q: '"Whose bag is this?" significa:', ctx: '', opts: ['De quem é essa bolsa?', 'Qual bolsa?', 'Onde está?', 'Quando comprou?'], ans: 0, exp: 'Whose = de quem.' }, { q: 'Como perguntar a duração:', ctx: '', opts: ['How long does it take?', 'How much time is?', 'What time does it take?', 'How far takes?'], ans: 0, exp: '"How long does it take?"' }] },
    { title: 'Vocabulário de saúde', sub: 'Symptoms, medicine, doctor...', icon: '🏥', done: false, explanation: '"I have a fever/headache/stomachache." "I feel sick." "I am allergic to..."', tip: '"Call an ambulance!" = chame uma ambulância.', examples: [{ en: 'I have a high fever and a sore throat.', pt: 'Estou com febre alta e dor de garganta.' }, { en: 'The doctor prescribed antibiotics.', pt: 'O médico prescreveu antibióticos.' }, { en: 'I am allergic to penicillin.', pt: 'Sou alérgico à penicilina.' }], q: [{ q: 'Como dizer "Estou com febre":', ctx: '', opts: ['I have a fever.', 'I am fever.', 'My body is fever.', 'I feel fever.'], ans: 0, exp: '"I have a fever".' }, { q: '"Prescription" é:', ctx: '', opts: ['Receita médica', 'Diagnóstico', 'Cirurgia', 'Exame'], ans: 0, exp: 'Prescription = receita médica.' }, { q: 'Como dizer que é alérgico:', ctx: '', opts: ['I am allergic to...', 'I have allergy of...', 'I allergic to...', 'Allergy: yes.'], ans: 0, exp: '"I am allergic to..."' }, { q: '"Symptoms" significa:', ctx: '', opts: ['Sintomas', 'Remédios', 'Alergias', 'Vacinas'], ans: 0, exp: 'Symptoms = sintomas.' }, { q: '"I feel dizzy." significa:', ctx: '', opts: ['Estou com tontura', 'Estou com fome', 'Estou cansado', 'Estou com frio'], ans: 0, exp: 'Dizzy = tonto.' }, { q: 'Como pedir socorro:', ctx: '', opts: ['Call an ambulance, please!', 'I need ambulance.', 'Ambulance now!', 'Help me ambulance!'], ans: 0, exp: '"Call an ambulance!"' }] },
    { title: 'Comparativos e superlativos', sub: 'Bigger, the biggest...', icon: '📊', done: false, explanation: 'Curtos: + er/est. Longos: more/most. Irregulares: good→better→best.', tip: '"As + adjetivo + as" = tão...quanto.', examples: [{ en: 'This coffee is stronger than that one.', pt: 'Este café é mais forte.' }, { en: 'She is the most intelligent in the class.', pt: 'Ela é a mais inteligente.' }, { en: 'Today is worse than yesterday.', pt: 'Hoje está pior.' }], q: [{ q: 'Comparativo de "tall":', ctx: '', opts: ['taller', 'more tall', 'tallest', 'most tall'], ans: 0, exp: 'Curtos: + er.' }, { q: 'Superlativo de "beautiful":', ctx: '', opts: ['the most beautiful', 'the beautifulest', 'more beautiful', 'the beautifuller'], ans: 0, exp: 'Longo: the most + adjetivo.' }, { q: 'Comparativo de "good":', ctx: '', opts: ['better', 'gooder', 'more good', 'best'], ans: 0, exp: 'Good → better → the best.' }, { q: 'Como dizer "tão alto quanto":', ctx: '', opts: ['as tall as', 'so tall as', 'more tall than', 'as tall than'], ans: 0, exp: 'As + adjetivo + as.' }, { q: '"The worst" é superlativo de:', ctx: '', opts: ['Bad', 'Good', 'Far', 'Old'], ans: 0, exp: 'Bad → worse → the worst.' }, { q: '"This exam is _____ than the last."', ctx: '', opts: ['more difficult', 'difficulter', 'most difficult', 'the most difficult'], ans: 0, exp: 'Difficult: more difficult.' }] },
    { title: 'Tecnologia e internet', sub: 'Download, update, app...', icon: '💻', done: false, explanation: '"Log in" = entrar. "Log out" = sair. "Crash" = travou.', tip: '"Back up" = fazer backup. "Update" = atualizar.', examples: [{ en: 'The app crashed and I lost all my data.', pt: 'O app travou e perdi os dados.' }, { en: 'You need to update your software.', pt: 'Você precisa atualizar.' }, { en: 'I will send you the file via email.', pt: 'Vou te mandar o arquivo por e-mail.' }], q: [{ q: '"Crash" significa:', ctx: '', opts: ['Travou/parou de funcionar', 'Acelerou', 'Foi atualizado', 'Foi desligado'], ans: 0, exp: 'Crash = travar.' }, { q: '"Log out" significa:', ctx: '', opts: ['Sair da conta', 'Entrar', 'Se cadastrar', 'Esqueci a senha'], ans: 0, exp: 'Log out = sair.' }, { q: '"Bandwidth" é:', ctx: '', opts: ['Largura de banda/velocidade', 'Tamanho do arquivo', 'Memória', 'Espaço no disco'], ans: 0, exp: 'Bandwidth = largura de banda.' }, { q: 'Como dizer "fazer backup":', ctx: '', opts: ['Back up your files.', 'Copy all files.', 'Save files again.', 'Duplicate data.'], ans: 0, exp: '"Back up".' }, { q: '"The website is down." significa:', ctx: '', opts: ['Fora do ar', 'Lento', 'Atualizado', 'Deletado'], ans: 0, exp: '"Down" = fora do ar.' }, { q: '"Phishing" é:', ctx: '', opts: ['Golpe para roubar dados', 'Tipo de vírus', 'Software desatualizado', 'Spam'], ans: 0, exp: 'Phishing = golpe para roubar dados.' }] },
    { title: 'Conectivos e coesão', sub: 'However, although, therefore...', icon: '🔗', done: false, explanation: 'Conectivos mostram relações lógicas entre ideias.', tip: 'Contraste: however, although. Adição: moreover. Conclusão: therefore.', examples: [{ en: 'He studied hard. However, he failed.', pt: 'Estudou muito. No entanto, foi reprovado.' }, { en: 'Although it rained, we went for a walk.', pt: 'Embora chovesse, fomos caminhar.' }, { en: 'She was tired. Therefore, she slept early.', pt: 'Ela estava cansada. Por isso, dormiu cedo.' }], q: [{ q: 'Para contraste:', ctx: '"He is rich. _____, he is unhappy."', opts: ['However', 'Therefore', 'Moreover', 'Besides'], ans: 0, exp: 'However = no entanto.' }, { q: '"Although" introduz:', ctx: '', opts: ['Contraste/concessão', 'Causa', 'Conclusão', 'Adição'], ans: 0, exp: 'Although = embora.' }, { q: '"Therefore" significa:', ctx: '', opts: ['Portanto/por isso', 'No entanto', 'Além disso', 'Embora'], ans: 0, exp: 'Therefore = portanto.' }, { q: 'Para adicionar informação positiva:', ctx: '', opts: ['Moreover', 'However', 'Although', 'Therefore'], ans: 0, exp: 'Moreover = além disso.' }, { q: '"Despite" é seguido de:', ctx: '', opts: ['Substantivo/pronome', 'Oração com verbo', 'Adjetivo', 'Advérbio'], ans: 0, exp: '"Despite" + substantivo.' }, { q: '"As a result" indica:', ctx: '', opts: ['Consequência', 'Contraste', 'Adição', 'Concessão'], ans: 0, exp: '"As a result" = consequentemente.' }] },
    { title: 'Vocabulário para viagens', sub: 'Airport, hotel, customs...', icon: '✈️', done: false, explanation: '"Check in" = chegada. "Carry-on" = bagagem de mão. "Layover" = escala.', tip: '"The flight is delayed" = atrasado.', examples: [{ en: 'My flight has a two-hour layover in Miami.', pt: 'Meu voo tem escala de 2h em Miami.' }, { en: 'Can I have a window seat, please?', pt: 'Posso ter assento na janela?' }, { en: 'Do you have anything to declare?', pt: 'Você tem algo a declarar?' }], q: [{ q: '"Boarding pass" é:', ctx: '', opts: ['Cartão de embarque', 'Passaporte', 'Visto', 'Passagem'], ans: 0, exp: 'Boarding pass = cartão de embarque.' }, { q: '"Carry-on luggage" é:', ctx: '', opts: ['Bagagem de mão', 'Bagagem despachada', 'Bagagem perdida', 'Bagagem extra'], ans: 0, exp: 'Carry-on = mão.' }, { q: '"Customs" é:', ctx: '', opts: ['Alfândega', 'Imigração', 'Embarque', 'Desembarque'], ans: 0, exp: 'Customs = alfândega.' }, { q: 'Como pedir late check-out:', ctx: '', opts: ['Can I have a late check-out?', 'I want to stay more.', 'Late please.', 'More time in room.'], ans: 0, exp: '"Can I have a late check-out?"' }, { q: '"The flight is delayed." significa:', ctx: '', opts: ['O voo está atrasado', 'Cancelado', 'Adiantou', 'Pousou'], ans: 0, exp: 'Delayed = atrasado.' }, { q: 'Como dizer "minha mala foi perdida":', ctx: '', opts: ['My luggage was lost.', 'I lose my luggage.', 'My bag is missing.', 'A e C corretas'], ans: 3, exp: '"My luggage was lost" e "My bag is missing" são corretas.' }] },
    { title: 'Make vs Do', sub: 'Make a cake, do homework...', icon: '🛠️', done: false, explanation: 'MAKE = criar, produzir algo. DO = realizar, executar uma atividade.', tip: 'Make: mistake, decision, money. Do: homework, exercise, business.', examples: [{ en: 'I made a big mistake at work.', pt: 'Cometi um erro grande.' }, { en: 'Can you do me a favor?', pt: 'Você pode me fazer um favor?' }, { en: 'She makes a lot of money.', pt: 'Ela ganha muito dinheiro.' }], q: [{ q: '"_____ a decision":', ctx: '', opts: ['Make', 'Do', 'Both', 'Neither'], ans: 0, exp: 'Make a decision.' }, { q: '"_____ homework":', ctx: '', opts: ['Do', 'Make', 'Both', 'Neither'], ans: 0, exp: 'Do homework.' }, { q: 'Como dizer "Cometi um erro":', ctx: '', opts: ['I made a mistake.', 'I did a mistake.', 'I made an error.', 'A e C corretas'], ans: 3, exp: '"Make a mistake" ou "make an error".' }, { q: '"_____ me a favor":', ctx: '', opts: ['do', 'make', 'give', 'get'], ans: 0, exp: '"Do someone a favor."' }, { q: '"She is _____ progress."', ctx: '', opts: ['making', 'doing', 'having', 'getting'], ans: 0, exp: '"Make progress".' }, { q: '"I need to _____ the dishes."', ctx: '', opts: ['do / wash (ambos corretos)', 'make', 'clean only', 'fix'], ans: 0, exp: '"Do/wash the dishes".' }] },
    { title: 'Inglês informal e gírias', sub: 'Awesome, hang out, chill...', icon: '😎', done: false, explanation: 'O inglês falado entre amigos é muito diferente do formal.', tip: '"Awesome" = incrível. "Hang out" = sair juntos. "ASAP" = o mais rápido possível.', examples: [{ en: 'That movie was absolutely awesome!', pt: 'Esse filme foi absolutamente incrível!' }, { en: "Let's hang out this weekend.", pt: 'Vamos sair juntos esse fim de semana.' }, { en: 'Just chill — everything will be fine.', pt: 'Relaxa — vai ficar tudo bem.' }], q: [{ q: '"Awesome" significa:', ctx: '', opts: ['Incrível', 'Terrível', 'Estranho', 'Normal'], ans: 0, exp: 'Awesome = incrível.' }, { q: '"Hang out" significa:', ctx: '', opts: ['Sair juntos', 'Pendurar algo', 'Ir embora', 'Trabalhar'], ans: 0, exp: 'Hang out = sair juntos.' }, { q: '"ASAP" significa:', ctx: '', opts: ['O mais rápido possível', 'Quando puder', 'Amanhã', 'Urgente'], ans: 0, exp: 'ASAP = As Soon As Possible.' }, { q: '"Under the weather" significa:', ctx: '', opts: ['Mal/doente', 'Com calor', 'Ansioso', 'Animado'], ans: 0, exp: '"Under the weather" = sentindo-se mal.' }, { q: '"To ghost someone" significa:', ctx: '', opts: ['Sumir sem explicação', 'Assustar', 'Mentir', 'Ignorar'], ans: 0, exp: 'Ghost = sumir sem avisar.' }, { q: '"No worries!" equivale a:', ctx: '', opts: ['Sem problema! / De nada!', 'Cuidado!', 'Não tenho certeza.', 'Que pena!'], ans: 0, exp: '"No worries!" = sem problema.' }] },
  ],
  advanced: [
    { title: 'Expressões idiomáticas', sub: 'Hit the nail on the head...', icon: '🎯', done: false, explanation: 'Idioms não podem ser traduzidos literalmente. Aprenda como um bloco.', tip: '"Raining cats and dogs" = chovendo muito.', examples: [{ en: "It's raining cats and dogs!", pt: 'Está chovendo muito!' }, { en: 'She hit the nail on the head.', pt: 'Ela acertou em cheio.' }, { en: "Don't beat around the bush.", pt: 'Não enrole.' }], q: [{ q: '"Raining cats and dogs" =', ctx: '', opts: ['Chovendo muito', 'Animais caindo', 'Tempo bom', 'Garoa'], ans: 0, exp: 'Chovendo muito.' }, { q: '"Bit off more than she could chew."', ctx: '', opts: ['Assumiu mais do que aguentava', 'Comeu demais', 'Recusou oportunidade', 'Mentiu'], ans: 0, exp: 'Se comprometeu demais.' }, { q: '"Beat around the bush" =', ctx: '', opts: ['Enrolar, não ir ao ponto', 'Bater em arbustos', 'Falar alto', 'Demorar'], ans: 0, exp: 'Enrolar.' }, { q: '"Let us hit the road!" =', ctx: '', opts: ['Vamos embora', 'Bater na estrada', 'Parar aqui', 'Dirigir devagar'], ans: 0, exp: 'Vamos embora.' }, { q: '"She has a lot on her plate."', ctx: '', opts: ['Está sobrecarregada', 'Está comendo muito', 'Problemas de saúde', 'Está feliz'], ans: 0, exp: 'Muito para resolver.' }, { q: '"He passed the buck."', ctx: '', opts: ['Jogou a responsabilidade para outro', 'Passou dinheiro', 'Ajudou alguém', 'Culpou o cliente'], ans: 0, exp: 'Transferir responsabilidade.' }] },
    { title: 'Vocabulário para negócios', sub: 'Meetings, deadlines, deals...', icon: '💼', done: false, explanation: 'Business English tem vocabulário específico para reuniões e negociações.', tip: 'Discordar: "I see your point, however..."', examples: [{ en: 'We need to meet the deadline by Friday.', pt: 'Precisamos cumprir o prazo.' }, { en: "Let's schedule a meeting.", pt: 'Vamos agendar uma reunião.' }, { en: 'We closed the deal with the new client.', pt: 'Fechamos o negócio.' }], q: [{ q: '"Deadline" é:', ctx: '', opts: ['Prazo final', 'Reunião', 'Contrato', 'Meta'], ans: 0, exp: 'Deadline = prazo final.' }, { q: '"Reschedule the meeting" =', ctx: '', opts: ['Remarcar', 'Cancelar', 'Começar', 'Encerrar'], ans: 0, exp: 'Reschedule = remarcar.' }, { q: '"Close the deal" =', ctx: '', opts: ['Fechar o negócio', 'Fazer o negócio', 'Assinar', 'Discutir'], ans: 0, exp: 'Fechar negócio.' }, { q: '"Bottom line" =', ctx: '', opts: ['O ponto principal', 'Linha do contrato', 'Lucro bruto', 'Última página'], ans: 0, exp: 'O que realmente importa.' }, { q: '"Think outside the box" =', ctx: '', opts: ['Pensar criativamente', 'Sair da sala', 'Usar caixa diferente', 'Trabalhar fora'], ans: 0, exp: 'Pensar de forma inovadora.' }, { q: 'Como responder formalmente a e-mail:', ctx: '', opts: ['Thank you for reaching out. I will get back to you shortly.', 'Thanks. Will answer later.', 'Got it.', 'OK.'], ans: 0, exp: '"Thank you for reaching out".' }] },
    { title: 'False Friends', sub: 'Actually, pretend, push...', icon: '🪤', done: false, explanation: 'Palavras parecidas com o português mas com significados completamente diferentes.', tip: 'actually (na verdade), college (faculdade), sensible (sensato), push (empurrar).', examples: [{ en: "Actually, I'm happy — not angry.", pt: 'Na verdade, estou feliz.' }, { en: 'He pretended to be sick.', pt: 'Ele fingiu estar doente.' }, { en: 'She is very sensible.', pt: 'Ela é muito sensata.' }], q: [{ q: '"Actually" =', ctx: '', opts: ['Na verdade', 'Atualmente', 'Normalmente', 'Recentemente'], ans: 0, exp: 'Actually = na verdade.' }, { q: '"He pretended to know."', ctx: '', opts: ['Fingiu saber', 'Pretendia saber', 'Tentou saber', 'Afirmou saber'], ans: 0, exp: 'Pretend = fingir.' }, { q: '"College" (EUA) é:', ctx: '', opts: ['Faculdade', 'Colégio', 'Cursinho', 'Pós-graduação'], ans: 0, exp: 'College = faculdade.' }, { q: '"Sensible" =', ctx: '', opts: ['Sensato/racional', 'Sensível', 'Sério', 'Inteligente'], ans: 0, exp: 'Sensible = sensato.' }, { q: 'Placa "PUSH" = fazer o quê?', ctx: '', opts: ['Empurrar', 'Puxar', 'Apertar', 'Esperar'], ans: 0, exp: 'Push = empurrar.' }, { q: '"Eventually" =', ctx: '', opts: ['Em algum momento', 'Imediatamente', 'Logo', 'Talvez'], ans: 0, exp: 'Em algum momento futuro.' }] },
    { title: 'Escrita formal e acadêmica', sub: 'Essays, reports, emails...', icon: '✍️', done: false, explanation: 'Sem contrações, vocabulário sofisticado, conectivos lógicos.', tip: 'Furthermore (além disso), However (no entanto), Therefore (portanto).', examples: [{ en: 'Furthermore, the data suggests a significant increase.', pt: 'Além disso, os dados sugerem aumento significativo.' }, { en: 'However, this has several limitations.', pt: 'No entanto, isso tem várias limitações.' }, { en: 'I am writing to inquire about the position.', pt: 'Escrevo para perguntar sobre a vaga.' }], q: [{ q: 'Qual é mais formal:', ctx: '', opts: ['I am writing to inquire about your services.', "Hey, I wanna know stuff.", 'Just checking.', 'Tell me?'], ans: 0, exp: '"I am writing to inquire" = tom formal.' }, { q: '"Furthermore" =', ctx: '', opts: ['Além disso', 'No entanto', 'Portanto', 'Em contraste'], ans: 0, exp: 'Furthermore = além disso.' }, { q: 'Conectivo para conclusão:', ctx: '', opts: ['In conclusion', 'Furthermore', 'However', 'In contrast'], ans: 0, exp: '"In conclusion" encerra.' }, { q: 'Por que evitar contrações no formal:', ctx: '', opts: ['São informais', 'Estão erradas', 'São longas', 'Confundem'], ans: 0, exp: "Contrações = informais. Use: do not." }, { q: '"However" indica:', ctx: '', opts: ['Contraste', 'Adição', 'Conclusão', 'Causa'], ans: 0, exp: 'However = contraste.' }, { q: 'Como começar e-mail formal sem saber o nome:', ctx: '', opts: ['Dear Sir or Madam,', 'Hello there,', 'To whoever,', 'Hi,'], ans: 0, exp: '"Dear Sir or Madam" é o padrão.' }] },
    { title: 'Subjuntivo em inglês', sub: 'I wish, if only...', icon: '🌀', done: false, explanation: 'Aparece após "wish", "if only", "would rather". Com wish usa-se WERE para todas as pessoas.', tip: '"I wish I were" — WERE para todas as pessoas.', examples: [{ en: 'I wish I were taller.', pt: 'Eu queria ser mais alto.' }, { en: 'If only I had studied harder!', pt: 'Se ao menos eu tivesse estudado mais!' }, { en: 'It is essential that he be informed.', pt: 'É essencial que ele seja informado.' }], q: [{ q: '"I wish I _____ rich."', ctx: '', opts: ['were', 'was', 'am', 'would be'], ans: 0, exp: 'Com "wish": were.' }, { q: '"If only she _____ here now!"', ctx: '', opts: ['were', 'is', 'will be', 'has been'], ans: 0, exp: '"If only" + were.' }, { q: '"I would rather you _____ the truth."', ctx: '', opts: ['told', 'tell', 'would tell', 'tells'], ans: 0, exp: '"Would rather + sujeito + passado".' }, { q: '"I wish I had studied" expressa:', ctx: '', opts: ['Arrependimento sobre o passado', 'Desejo no presente', 'Plano futuro', 'Conselho'], ans: 0, exp: '"Wish + past perfect" = arrependimento.' }, { q: '"It is crucial that she _____ on time."', ctx: '', opts: ['be', 'is', 'was', 'will be'], ans: 0, exp: 'Subjuntivo formal: verbo base.' }, { q: '"If only I _____ more money last year!"', ctx: '', opts: ['had saved', 'saved', 'have saved', 'would save'], ans: 0, exp: '"If only + past perfect".' }] },
    { title: 'Vocabulário acadêmico (AWL)', sub: 'Analyze, hypothesis, conclude...', icon: '🎓', done: false, explanation: 'O Academic Word List (AWL) são as palavras mais usadas em textos acadêmicos.', tip: 'Frequentes: analyze, concept, establish, indicate, significant, theory, evidence.', examples: [{ en: 'The study indicates a significant correlation.', pt: 'O estudo indica uma correlação significativa.' }, { en: 'We need to analyze the data before concluding.', pt: 'Precisamos analisar os dados.' }, { en: 'The hypothesis was not supported by the evidence.', pt: 'A hipótese não foi sustentada pelas evidências.' }], q: [{ q: '"Analyze" =', ctx: '', opts: ['Analisar', 'Criar', 'Resumir', 'Publicar'], ans: 0, exp: 'Analyze = analisar.' }, { q: '"The results are significant." =', ctx: '', opts: ['Os resultados são relevantes', 'São pequenos', 'São negativos', 'São provisórios'], ans: 0, exp: 'Significant = relevante.' }, { q: '"Hypothesis" é:', ctx: '', opts: ['Hipótese', 'Conclusão', 'Método', 'Resultado'], ans: 0, exp: 'Hypothesis = hipótese.' }, { q: '"Data" em inglês acadêmico formal é:', ctx: '', opts: ['Plural de datum', 'Sempre singular', 'Nunca singular', 'Abreviação'], ans: 0, exp: '"Data" = plural de datum.' }, { q: '"To establish a framework" =', ctx: '', opts: ['Estabelecer uma estrutura', 'Criar um problema', 'Desafiar teoria', 'Publicar'], ans: 0, exp: 'Establish = estabelecer.' }, { q: 'Como expressar que resultados variam:', ctx: '', opts: ['The results vary significantly.', 'The results are different a lot.', 'Results change too much.', 'The results variate.'], ans: 0, exp: '"Vary" = variar.' }] },
    { title: 'Ironia e sarcasmo', sub: 'Yeah, right. Sure...', icon: '😏', done: false, explanation: 'Em inglês, ironia e sarcasmo são muito comuns. O significado é frequentemente o oposto das palavras.', tip: '"Yeah, right." sarcasticamente = "claro que não".', examples: [{ en: '"He is always on time." "Yeah, right!"', pt: '"Ele sempre chega no horário." "Claro, né!"' }, { en: 'Oh, great. Another Monday.', pt: 'Ah, ótimo. Mais uma segunda.' }, { en: '"Good luck with that!"', pt: '"Boa sorte com isso!" (sarcástico)' }], q: [{ q: '"Yeah, right!" sarcasticamente =', ctx: '', opts: ['Não acredito / De jeito nenhum', 'Sim, concordo', 'Que ótimo!', 'Com certeza!'], ans: 0, exp: '"Yeah, right!" = descrença.' }, { q: '"Oh, great." após notícia ruim:', ctx: '', opts: ['Significa péssimo (irônico)', 'Significa ótimo', 'Que alívio', 'Não me importo'], ans: 0, exp: 'Tom sarcástico inverte o significado.' }, { q: '"As if!" geralmente significa:', ctx: '', opts: ['Impossível / De jeito nenhum', 'Talvez', 'Com certeza', 'Não sei'], ans: 0, exp: '"As if!" = impossível.' }, { q: '"Sure, because THAT always works." O tom indica:', ctx: '', opts: ['Sarcasmo — não funciona', 'Entusiasmo genuíno', 'Dúvida sincera', 'Conselho real'], ans: 0, exp: '"THAT" em maiúsculo = sarcasmo.' }, { q: 'Como distinguir ironia em texto:', ctx: '', opts: ['Contexto, emojis e pontuação ajudam', 'É sempre impossível', 'Pela gramática', 'Apenas pelas palavras'], ans: 0, exp: 'Contexto é fundamental.' }, { q: '"I am so happy it is Monday." Provavelmente é:', ctx: '', opts: ['Irônico — não gosta de segunda', 'Sincero — ama trabalhar', 'Neutro', 'Uma pergunta'], ans: 0, exp: 'Raramente sincero.' }] },
    { title: 'Registro formal vs informal', sub: 'Can vs May, Want vs Would like...', icon: '🎭', done: false, explanation: 'O que é natural com amigos soa rude numa entrevista. Dominar o registro é sinal de fluência real.', tip: 'Formal: "I would like to request...", "Could you please...".', examples: [{ en: 'Formal: I would like to schedule a meeting.', pt: 'Gostaria de agendar uma reunião.' }, { en: 'Informal: Can we meet up sometime?', pt: 'A gente pode se encontrar?' }, { en: 'Formal: I am afraid I cannot attend.', pt: 'Lamento, mas não poderei comparecer.' }], q: [{ q: 'Qual é mais formal:', ctx: '', opts: ['Could you please send me the report?', 'Can you send me the report?', 'Send me the report.', 'I need the report.'], ans: 0, exp: '"Could you please" é mais formal.' }, { q: 'Versão formal de "I want to apply for the job":', ctx: '', opts: ['I would like to apply for the position.', 'I wanna apply.', 'I am interested in the job.', 'Give me the application.'], ans: 0, exp: '"I would like" + "position".' }, { q: '"I am afraid I cannot attend." Em informal:', ctx: '', opts: ["Sorry, I can't make it.", "I will not go.", "I do not want to come.", "Not possible."], ans: 0, exp: '"I cannot make it" = casual.' }, { q: 'Qual é mais informal:', ctx: '', opts: ['Got it!', 'I have understood.', 'I acknowledge your message.', 'Message received.'], ans: 0, exp: '"Got it!" é muito informal.' }, { q: 'Em e-mail formal para desconhecido, você usa:', ctx: '', opts: ['Dear Mr./Ms. [Surname],', 'Hey [First Name],', 'Hi there,', 'To whoever,'], ans: 0, exp: '"Dear Mr./Ms. [Surname]".' }, { q: '"FYI" é:', ctx: '', opts: ['Informal / Para sua informação', 'Formal e profissional', 'Gíria britânica', 'Erro de inglês'], ans: 0, exp: 'FYI = For Your Information. Informal.' }] },
    { title: 'Discourse Markers', sub: 'Well, actually, you know, I mean...', icon: '🗣️', done: false, explanation: 'Discourse markers organizam o discurso e ganham tempo para pensar.', tip: 'Para pensar: "Well...". Para corrigir: "I mean...". Para concordar: "Exactly!"', examples: [{ en: 'Well, I think we should consider all options.', pt: 'Bom, acho que deveríamos considerar tudo.' }, { en: "I mean, it is not that simple.", pt: 'Quer dizer, não é tão simples.' }, { en: "You know what I mean?", pt: 'Você entende o que quero dizer?' }], q: [{ q: '"Well..." no início de uma resposta indica:', ctx: '', opts: ['O falante está pensando/hesitando', 'O falante discorda', 'O falante não entendeu', 'O falante está com raiva'], ans: 0, exp: '"Well" = pausa para pensar.' }, { q: '"I mean" serve para:', ctx: '', opts: ['Esclarecer ou corrigir o que disse', 'Concordar', 'Mudar de assunto', 'Finalizar'], ans: 0, exp: '"I mean" = esclarecer.' }, { q: '"You know?" no final busca:', ctx: '', opts: ['Confirmação/acordo do ouvinte', 'Uma resposta específica', 'Mostrar incerteza', 'Finalizar'], ans: 0, exp: '"You know?" = conexão.' }, { q: '"Actually" como discourse marker:', ctx: '"Actually, I think you are wrong."', opts: ['Introduz correção ou contraste', 'Concordar', 'Mudar de assunto', 'Pedir informação'], ans: 0, exp: '"Actually" = corrige ou contrasta.' }, { q: '"To be honest..." indica:', ctx: '', opts: ['Vai dizer algo mais sincero/direto', 'Não tem certeza', 'Está mudando de assunto', 'Está sendo irônico'], ans: 0, exp: '"To be honest" = opinião franca.' }, { q: 'Qual NÃO é um discourse marker típico:', ctx: '', opts: ['Therefore', 'Well', 'You know', 'I mean'], ans: 0, exp: '"Therefore" é conectivo formal.' }] },
    { title: 'Phrasal verbs avançados', sub: 'Put up with, come across, set up...', icon: '🔧', done: false, explanation: 'Phrasal verbs de 3 partes nunca separam as partículas.', tip: 'Put up with = tolerar. Come across = parecer. Fall through = não dar certo. Turn down = recusar.', examples: [{ en: "I can't put up with his rudeness.", pt: 'Não aguento mais a grosseria dele.' }, { en: 'She came across as very confident.', pt: 'Ela pareceu muito confiante.' }, { en: 'We need to set up a meeting.', pt: 'Precisamos organizar uma reunião.' }], q: [{ q: '"Put up with" significa:', ctx: '', opts: ['Tolerar/aguentar', 'Colocar em cima', 'Desistir', 'Preparar'], ans: 0, exp: 'Put up with = tolerar.' }, { q: '"She came across as nervous." =', ctx: '', opts: ['Ela pareceu nervosa', 'Ficou nervosa', 'Encontrou alguém nervoso', 'Se sentiu nervosa'], ans: 0, exp: 'Come across as = parecer.' }, { q: '"Set up a meeting" significa:', ctx: '', opts: ['Organizar/marcar uma reunião', 'Cancelar', 'Participar', 'Adiar'], ans: 0, exp: 'Set up = organizar.' }, { q: '"The deal fell through." =', ctx: '', opts: ['O negócio não deu certo', 'Foi fechado', 'Foi adiado', 'Cancelado pelos dois lados'], ans: 0, exp: 'Fall through = não dar certo.' }, { q: '"She turned down the offer." =', ctx: '', opts: ['Recusou a oferta', 'Aceitou', 'Considerou', 'Pediu mais tempo'], ans: 0, exp: 'Turn down = recusar.' }, { q: '"I will look into the matter." =', ctx: '', opts: ['Vou investigar o assunto', 'Vou ignorar', 'Vou resolver agora', 'Vou delegar'], ans: 0, exp: 'Look into = investigar.' }] },
    { title: 'Inglês para entrevistas', sub: 'Strengths, weaknesses, goals...', icon: '👔', done: false, explanation: 'Entrevistas em inglês têm perguntas previsíveis. O método STAR: Situation, Task, Action, Result.', tip: '"Tell me about yourself" = pitch profissional de 1-2 min.', examples: [{ en: 'My greatest strength is my ability to work under pressure.', pt: 'Meu maior ponto forte é trabalhar sob pressão.' }, { en: 'I see myself leading a team in five years.', pt: 'Me vejo liderando uma equipe em cinco anos.' }, { en: 'I am a fast learner and adapt quickly.', pt: 'Aprendo rápido e me adapto facilmente.' }], q: [{ q: 'Como responder "What is your greatest weakness?"', ctx: '', opts: ['Mencione uma fraqueza real e como está melhorando', 'Diga que não tem fraquezas', 'Recuse responder', 'Diga que trabalha demais'], ans: 0, exp: 'Fraqueza real + como está melhorando.' }, { q: '"Tell me about yourself." Deve incluir:', ctx: '', opts: ['Resumo profissional relevante ao cargo', 'Sua vida pessoal completa', 'Problemas anteriores', 'Apenas formação'], ans: 0, exp: 'Elevator pitch.' }, { q: 'Como dizer "Sou bom em trabalhar em equipe":', ctx: '', opts: ['I am a strong team player.', 'I like to work with people.', 'Teams are good for me.', 'I work in teams.'], ans: 0, exp: '"Team player".' }, { q: 'O que é o método STAR?', ctx: '', opts: ['Situation, Task, Action, Result', 'Skills, Training, Achievement, Recognition', 'Strengths, Teamwork, Ambition, Responsibility', 'Summary, Timeline, Action, Report'], ans: 0, exp: 'STAR = estrutura para respostas.' }, { q: '"What are your salary expectations?" Como responder:', ctx: '', opts: ['Dê um intervalo baseado no mercado', 'Diga que qualquer valor está bom', 'Recuse responder', 'Pergunte o que oferecem primeiro'], ans: 0, exp: '"Based on my research, I am looking for X to Y."' }, { q: '"Do you have any questions for us?" Você deve:', ctx: '', opts: ['Fazer perguntas inteligentes sobre a empresa', 'Dizer que não tem perguntas', 'Perguntar sobre salário imediatamente', 'Agradecer e sair'], ans: 0, exp: 'Sempre tenha 2-3 perguntas.' }] },
    { title: 'Sotaques e variações', sub: 'American vs British vs Australian...', icon: '🌍', done: false, explanation: 'O inglês varia entre países em vocabulário, pronúncia e gramática.', tip: 'Elevator (EUA) = Lift (UK). Apartment (EUA) = Flat (UK). Soccer (EUA) = Football (UK).', examples: [{ en: 'American: "I live in an apartment on the first floor."', pt: 'Moro num apartamento no primeiro andar.' }, { en: 'British: "I live in a flat on the ground floor."', pt: 'Moro num flat no rés-do-chão.' }, { en: 'Australian: "No worries, mate!"', pt: 'Sem problema, amigo!' }], q: [{ q: '"Elevator" (EUA) = qual palavra britânica?', ctx: '', opts: ['Lift', 'Escalator', 'Stairs', 'Floor'], ans: 0, exp: 'Elevator = Lift.' }, { q: '"Apartment" (EUA) em UK é:', ctx: '', opts: ['Flat', 'House', 'Studio', 'Room'], ans: 0, exp: 'Apartment = Flat.' }, { q: '"Soccer" (EUA) em UK é:', ctx: '', opts: ['Football', 'Rugby', 'Cricket', 'Handball'], ans: 0, exp: 'Soccer = Football.' }, { q: '"Autumn" é a palavra britânica para:', ctx: '', opts: ['Outono', 'Primavera', 'Inverno', 'Verão'], ans: 0, exp: 'Autumn = Fall = outono.' }, { q: '"Cheers!" no UK pode significar:', ctx: '', opts: ['Obrigado / Saúde / Tchau', 'Apenas saúde', 'Apenas obrigado', 'Apenas tchau'], ans: 0, exp: '"Cheers!" = muito versátil.' }, { q: '"G-day mate!" é típico de:', ctx: '', opts: ['Austrália', 'Reino Unido', 'Estados Unidos', 'Irlanda'], ans: 0, exp: '"G-day" = saudação australiana.' }] },
    { title: 'Argumentação e debate', sub: 'In my opinion, on the other hand...', icon: '⚖️', done: false, explanation: 'Argumentar em inglês exige vocabulário específico para opinar e discordar diplomaticamente.', tip: 'Opinar: "In my opinion...", "I believe...". Discordar: "I see your point, but..."', examples: [{ en: 'In my opinion, remote work increases productivity.', pt: 'Na minha opinião, o home office aumenta a produtividade.' }, { en: 'I see your point, but I tend to disagree.', pt: 'Entendo seu ponto, mas tendo a discordar.' }, { en: 'On the other hand, there are clear disadvantages.', pt: 'Por outro lado, há desvantagens claras.' }], q: [{ q: 'Como expressar opinião formalmente:', ctx: '', opts: ['In my opinion / I believe', 'I think so.', 'For me...', 'My idea is...'], ans: 0, exp: '"In my opinion", "I believe".' }, { q: 'Como discordar educadamente:', ctx: '', opts: ['I see your point, but I tend to disagree.', 'You are wrong.', 'That is not right.', 'No, incorrect.'], ans: 0, exp: '"I see your point, but..." = diplomático.' }, { q: '"I beg to differ." significa:', ctx: '', opts: ['Discordo respeitosamente', 'Concordo completamente', 'Não entendi', 'Preciso de mais informação'], ans: 0, exp: '"I beg to differ" = discordo.' }, { q: 'Para o outro lado do argumento:', ctx: '', opts: ['On the other hand / However / That said', 'Therefore / As a result', 'Furthermore / Moreover', 'In conclusion / To sum up'], ans: 0, exp: '"On the other hand", "However".' }, { q: '"That is a valid point." serve para:', ctx: '', opts: ['Reconhecer o argumento do outro', 'Concordar completamente', 'Mudar de assunto', 'Finalizar'], ans: 0, exp: '"That is a valid point" = reconheço o mérito.' }, { q: 'Como concluir um argumento:', ctx: '', opts: ['In conclusion / To sum up / All things considered', 'However / On the other hand', 'Furthermore / In addition', 'Initially / First of all'], ans: 0, exp: '"In conclusion", "To sum up".' }] },
    { title: 'Collocations naturais', sub: 'Make a decision, heavy rain...', icon: '🧩', done: false, explanation: 'Collocations são combinações naturais de palavras. Soar nativo é usar a combinação certa, não apenas a gramática correta.', tip: '"Make a decision" (não "do"). "Heavy rain" (não "strong"). "Strong coffee" (não "powerful").', examples: [{ en: 'We need to make a decision soon.', pt: 'Precisamos tomar uma decisão logo.' }, { en: 'There was heavy rain all night.', pt: 'Choveu forte a noite toda.' }, { en: 'She has a strong sense of duty.', pt: 'Ela tem um forte senso de dever.' }], q: [{ q: '"___ a decision" — qual verbo?', ctx: '', opts: ['Make', 'Do', 'Take', 'Have'], ans: 0, exp: '"Make a decision".' }, { q: 'Chuva forte em inglês natural:', ctx: '', opts: ['Heavy rain', 'Strong rain', 'Hard rain', 'Big rain'], ans: 0, exp: '"Heavy rain".' }, { q: 'Café forte:', ctx: '', opts: ['Strong coffee', 'Powerful coffee', 'Heavy coffee', 'Hard coffee'], ans: 0, exp: '"Strong coffee".' }, { q: '"___ an effort" — verbo certo:', ctx: '', opts: ['Make', 'Do', 'Take', 'Give'], ans: 0, exp: '"Make an effort".' }, { q: 'Combinação natural com "fast":', ctx: '', opts: ['Fast food', 'Quick food', 'Rapid food', 'Speedy food'], ans: 0, exp: '"Fast food" é collocation fixa.' }, { q: '"Pay attention" — por quê não "give attention"?', ctx: '', opts: ['É a collocation consagrada', 'Give está gramaticalmente errado', 'São sinônimos perfeitos', 'Depende do país'], ans: 0, exp: 'Collocation fixa: "pay attention".' }] },
    { title: 'Conotação e nuance', sub: 'Slim vs skinny, assertive vs bossy...', icon: '🎚️', done: false, explanation: 'Sinônimos raramente são iguais. A conotação (positiva, neutra ou negativa) muda toda a mensagem.', tip: '"Slim" (elogio) vs "skinny" (crítica). "Assertive" (positivo) vs "bossy" (negativo).', examples: [{ en: 'She is slim and elegant.', pt: 'Ela é magra e elegante.' }, { en: 'He is confident, not arrogant.', pt: 'Ele é confiante, não arrogante.' }, { en: 'That is a frugal, not cheap, approach.', pt: 'É uma abordagem econômica, não pão-dura.' }], q: [{ q: 'Qual tem conotação positiva?', ctx: '', opts: ['Slim', 'Skinny', 'Bony', 'Scrawny'], ans: 0, exp: '"Slim" elogia; os outros criticam.' }, { q: '"Childish" vs "childlike":', ctx: '', opts: ['Childish é negativo; childlike é positivo', 'São idênticos', 'Childlike é insulto', 'Childish é elogio'], ans: 0, exp: 'Conotações opostas.' }, { q: 'Conotação de "bossy":', ctx: '', opts: ['Negativa (mandão)', 'Positiva (líder)', 'Neutra', 'Formal'], ans: 0, exp: '"Bossy" critica; "assertive" elogia.' }, { q: 'Para elogiar economia de gastos use:', ctx: '', opts: ['Frugal / thrifty', 'Cheap / stingy', 'Mean', 'Tight-fisted'], ans: 0, exp: '"Frugal" é positivo; "stingy" é negativo.' }, { q: '"Curious" vs "nosy":', ctx: '', opts: ['Nosy é intrusivo (negativo)', 'São sinônimos neutros', 'Curious é negativo', 'Nosy é formal'], ans: 0, exp: '"Nosy" = enxerido.' }, { q: 'Por que a conotação importa em C2:', ctx: '', opts: ['Comunica julgamento sutil além do literal', 'Não importa', 'Só afeta a gramática', 'Só em textos formais'], ans: 0, exp: 'Nuance = mensagem implícita.' }] },
    { title: 'Metáforas e linguagem figurada', sub: 'Metaphors, similes, hyperbole...', icon: '🪞', done: false, explanation: 'Falantes avançados usam metáforas, símiles e hipérboles para dar cor e impacto ao discurso.', tip: 'Símile usa "like/as": "as busy as a bee". Metáfora é direta: "time is money".', examples: [{ en: 'Time is money.', pt: 'Tempo é dinheiro. (metáfora)' }, { en: 'She was as brave as a lion.', pt: 'Ela foi corajosa como um leão. (símile)' }, { en: 'I have told you a million times!', pt: 'Já te falei um milhão de vezes! (hipérbole)' }], q: [{ q: 'O que é um símile (simile)?', ctx: '', opts: ['Comparação com "like" ou "as"', 'Comparação direta sem conectivo', 'Exagero proposital', 'Repetição de sons'], ans: 0, exp: 'Símile usa like/as.' }, { q: '"Time is money" é:', ctx: '', opts: ['Metáfora', 'Símile', 'Hipérbole', 'Ironia'], ans: 0, exp: 'Metáfora = comparação direta.' }, { q: '"I could eat a horse" é:', ctx: '', opts: ['Hipérbole (exagero)', 'Símile', 'Metáfora literal', 'Eufemismo'], ans: 0, exp: 'Exagero = hipérbole.' }, { q: '"As cool as a cucumber" significa:', ctx: '', opts: ['Muito calmo', 'Muito frio', 'Muito estranho', 'Muito rápido'], ans: 0, exp: 'Símile = extremamente calmo.' }, { q: '"The world is your oyster" significa:', ctx: '', opts: ['Você pode conquistar o que quiser', 'O mundo é perigoso', 'Você gosta de frutos do mar', 'A vida é dura'], ans: 0, exp: 'Oportunidades ilimitadas.' }, { q: 'Personificação é:', ctx: '', opts: ['Dar qualidades humanas a algo não humano', 'Comparar com "as"', 'Exagerar', 'Repetir palavras'], ans: 0, exp: 'Ex.: "The wind whispered".' }] },
    { title: 'Eufemismos e diplomacia', sub: 'Pass away, let go, between jobs...', icon: '🤝', done: false, explanation: 'Eufemismos suavizam assuntos delicados. São essenciais para soar educado e diplomático em inglês.', tip: '"Pass away" (em vez de die). "Let go" (em vez de fire). "Between jobs" (em vez de unemployed).', examples: [{ en: 'He passed away last year.', pt: 'Ele faleceu ano passado.' }, { en: 'They had to let go several employees.', pt: 'Tiveram que demitir vários funcionários.' }, { en: 'I am between jobs at the moment.', pt: 'Estou entre empregos no momento.' }], q: [{ q: '"Pass away" é eufemismo para:', ctx: '', opts: ['Morrer (die)', 'Viajar', 'Mudar', 'Dormir'], ans: 0, exp: '"Pass away" suaviza "die".' }, { q: '"We had to let him go." significa:', ctx: '', opts: ['Foi demitido', 'Foi promovido', 'Pediu demissão', 'Saiu mais cedo'], ans: 0, exp: '"Let go" = demitir (suave).' }, { q: '"Between jobs" é forma educada de dizer:', ctx: '', opts: ['Desempregado', 'Aposentado', 'De férias', 'Freelancer'], ans: 0, exp: '"Between jobs" = unemployed.' }, { q: '"Could be better." como resposta significa:', ctx: '', opts: ['Não estou bem (suavizado)', 'Estou ótimo', 'Estou perfeito', 'Não quero falar'], ans: 0, exp: 'Understatement diplomático.' }, { q: 'Eufemismo respeitoso para "old people":', ctx: '', opts: ['Senior citizens', 'Ancient people', 'The aged ones', 'Olds'], ans: 0, exp: '"Senior citizens" é respeitoso.' }, { q: 'Por que usar eufemismos:', ctx: '', opts: ['Soar educado em temas sensíveis', 'Confundir o ouvinte', 'Parecer formal sempre', 'Evitar gramática'], ans: 0, exp: 'Diplomacia e tato.' }] },
    { title: 'Pronomes relativos', sub: 'who, which, that, whose...', icon: '🔗', done: false, explanation: 'Pronomes relativos ligam uma informação a um substantivo. "Who" para pessoas, "which" para coisas, "that" para ambos, "whose" para posse, "where" para lugar.', tip: 'A vírgula muda o sentido: "My brother who lives in NY" (tenho vários) vs "My brother, who lives in NY," (só um).', examples: [{ en: 'The man who called you is my boss.', pt: 'O homem que te ligou é meu chefe.' }, { en: 'This is the book which changed my life.', pt: 'Este é o livro que mudou minha vida.' }, { en: 'She is the woman whose car was stolen.', pt: 'Ela é a mulher cujo carro foi roubado.' }], q: [{ q: 'Pronome para PESSOAS:', ctx: '', opts: ['who', 'which', 'whose', 'where'], ans: 0, exp: '"Who" para pessoas.' }, { q: 'Pronome para COISAS:', ctx: '', opts: ['which', 'who', 'whom', 'whose'], ans: 0, exp: '"Which" para coisas.' }, { q: '"Whose" indica:', ctx: '', opts: ['Posse', 'Lugar', 'Tempo', 'Coisa'], ans: 0, exp: '"Whose" = de quem (posse).' }, { q: '"The city ___ I was born":', ctx: '', opts: ['where', 'which', 'who', 'whose'], ans: 0, exp: '"Where" para lugar.' }, { q: 'Em oração essencial (sem vírgula) pode-se usar:', ctx: '', opts: ['that', 'and', 'so', 'but'], ans: 0, exp: '"That" em orações restritivas.' }, { q: 'A vírgula em "My car, which is red, ..." indica:', ctx: '', opts: ['Informação extra (não essencial)', 'Informação essencial', 'Que há vários carros', 'Erro de gramática'], ans: 0, exp: 'Vírgula = informação adicional.' }] },
    { title: 'Causativo: have/get it done', sub: 'I had my hair cut...', icon: '🧰', done: false, explanation: 'Usado quando OUTRA pessoa faz algo por você. Estrutura: have/get + objeto + particípio (past participle).', tip: '"I cut my hair" = você cortou. "I had my hair cut" = o cabeleireiro cortou.', examples: [{ en: 'I had my car repaired yesterday.', pt: 'Mandei consertar meu carro ontem.' }, { en: 'She got her nails done for the party.', pt: 'Ela fez as unhas para a festa.' }, { en: 'We need to have the house painted.', pt: 'Precisamos mandar pintar a casa.' }], q: [{ q: '"I had my car ___" (consertar):', ctx: '', opts: ['repaired', 'repair', 'repairing', 'to repair'], ans: 0, exp: 'have + objeto + particípio.' }, { q: '"I had my hair cut" significa:', ctx: '', opts: ['Outra pessoa cortou', 'Você mesmo cortou', 'Ninguém cortou', 'Vai cortar'], ans: 0, exp: 'Causativo = outra pessoa faz.' }, { q: 'Estrutura do causativo:', ctx: '', opts: ['have/get + objeto + particípio', 'have + infinitivo', 'get + gerúndio', 'have + verbo base'], ans: 0, exp: 'have/get + objeto + past participle.' }, { q: '"She got her photo ___" (tirar):', ctx: '', opts: ['taken', 'take', 'taking', 'took'], ans: 0, exp: 'Particípio: taken.' }, { q: '"I need to have the documents ___" (assinar):', ctx: '', opts: ['signed', 'sign', 'signing', 'to sign'], ans: 0, exp: 'have + documents + signed.' }, { q: '"Get" no causativo é:', ctx: '', opts: ['Mais informal que "have"', 'Mais formal', 'Gramaticalmente errado', 'Só para coisas'], ans: 0, exp: '"Get" é mais coloquial.' }] },
    { title: 'Nominalização (estilo formal)', sub: 'decide → decision...', icon: '🏛️', done: false, explanation: 'Transformar verbos e adjetivos em substantivos deixa o texto mais formal e denso — típico do inglês acadêmico e de relatórios.', tip: '"They decided quickly" → "Their quick decision". "It is important" → "Its importance".', examples: [{ en: 'The introduction of the policy caused debate.', pt: 'A introdução da política causou debate.' }, { en: 'Our analysis of the data revealed errors.', pt: 'Nossa análise dos dados revelou erros.' }, { en: 'There was a significant improvement in sales.', pt: 'Houve uma melhora significativa nas vendas.' }], q: [{ q: 'Nominalização de "to decide":', ctx: '', opts: ['decision', 'deciding', 'decided', 'decisive'], ans: 0, exp: 'decide → decision.' }, { q: 'Nominalizar deixa o texto mais:', ctx: '', opts: ['Formal e denso', 'Informal', 'Curto', 'Falado'], ans: 0, exp: 'Estilo acadêmico/formal.' }, { q: 'Substantivo de "to analyze":', ctx: '', opts: ['analysis', 'analyzing', 'analyzed', 'analytic'], ans: 0, exp: 'analyze → analysis.' }, { q: 'Substantivo de "important":', ctx: '', opts: ['importance', 'importantly', 'importing', 'import'], ans: 0, exp: 'important → importance.' }, { q: '"They failed" nominalizado:', ctx: '', opts: ['Their failure', 'They failing', 'The failed', 'Fail them'], ans: 0, exp: 'fail → failure.' }, { q: 'Onde é mais usada:', ctx: '', opts: ['Textos acadêmicos e relatórios', 'Conversa casual', 'Mensagens de texto', 'Legendas'], ans: 0, exp: 'Registro formal escrito.' }] },
    { title: 'Hedging: cautela acadêmica', sub: 'tends to, may suggest...', icon: '🪶', done: false, explanation: 'Hedging é suavizar afirmações para soar cauteloso e profissional — essencial em inglês acadêmico e corporativo. Evita parecer arrogante ou categórico demais.', tip: 'Em vez de "This proves X", escreva "This suggests X" ou "This may indicate X".', examples: [{ en: 'The results suggest a possible link.', pt: 'Os resultados sugerem uma possível ligação.' }, { en: 'This tends to happen in cold climates.', pt: 'Isso tende a acontecer em climas frios.' }, { en: 'It could be argued that the policy failed.', pt: 'Pode-se argumentar que a política falhou.' }], q: [{ q: 'Hedging serve para:', ctx: '', opts: ['Soar cauteloso, não absoluto', 'Afirmar com 100% de certeza', 'Encurtar frases', 'Soar agressivo'], ans: 0, exp: 'Suaviza afirmações.' }, { q: 'Versão com hedging de "This proves it":', ctx: '', opts: ['This suggests it', 'This proves it fully', 'This is it', 'This shows 100%'], ans: 0, exp: '"Suggests" é cauteloso.' }, { q: '"Tends to" significa:', ctx: '', opts: ['Tem tendência a', 'Sempre', 'Nunca', 'Provou que'], ans: 0, exp: 'Tendência, não regra absoluta.' }, { q: 'Verbo de hedging comum:', ctx: '', opts: ['may / might', 'must', 'will definitely', 'always'], ans: 0, exp: '"May/might" = possibilidade.' }, { q: '"It could be argued that..." sinaliza:', ctx: '', opts: ['Posição apresentada com cautela', 'Certeza total', 'Uma ordem', 'Uma pergunta'], ans: 0, exp: 'Apresenta argumento sem afirmar como fato.' }, { q: 'Onde é essencial:', ctx: '', opts: ['Inglês acadêmico e profissional', 'Gírias', 'Placas de trânsito', 'Emojis'], ans: 0, exp: 'Registro formal.' }] },
    { title: 'Pronomes pessoais (sujeito)', sub: 'I, you, he, she, it, we, they', icon: '🧍', done: false, explanation: 'Pronomes pessoais substituem o nome e funcionam como sujeito: I, you, he, she, it, we, they. Vêm antes do verbo.', tip: '"It" é usado para coisas e animais. "They" serve para pessoas e coisas no plural.', examples: [{ en: 'I am a student.', pt: 'Eu sou estudante.' }, { en: 'They live in Brazil.', pt: 'Eles moram no Brasil.' }, { en: 'It is a nice day.', pt: 'É um dia bonito.' }], q: [{ q: 'Pronome para "eu":', ctx: '', opts: ['I', 'You', 'He', 'We'], ans: 0, exp: '"I" = eu.' }, { q: 'Pronome para uma coisa:', ctx: '', opts: ['He', 'She', 'It', 'They'], ans: 2, exp: '"It" para coisas/animais.' }, { q: '"___ are my friends." (eles):', ctx: '', opts: ['He', 'They', 'She', 'It'], ans: 1, exp: '"They" = eles/elas.' }, { q: 'Pronome para "nós":', ctx: '', opts: ['You', 'They', 'We', 'I'], ans: 2, exp: '"We" = nós.' }, { q: '"Maria is nice. ___ is my friend." :', ctx: '', opts: ['He', 'It', 'She', 'They'], ans: 2, exp: '"She" para mulher.' }, { q: 'Qual é um pronome pessoal (sujeito)?', ctx: '', opts: ['my', 'me', 'he', 'his'], ans: 2, exp: '"He" é sujeito.' }] },
    { title: 'Demonstrativos (this/that)', sub: 'this, that, these, those', icon: '📍', done: false, explanation: 'this (isto, perto, singular), that (aquilo, longe, singular), these (estes, perto, plural), those (aqueles, longe, plural).', tip: 'Perto de você: this/these. Longe: that/those.', examples: [{ en: 'This is my book.', pt: 'Este é meu livro.' }, { en: 'Those are her shoes.', pt: 'Aqueles são os sapatos dela.' }, { en: 'These apples are fresh.', pt: 'Estas maçãs estão frescas.' }], q: [{ q: '"___ book here is mine." :', ctx: '', opts: ['This', 'That', 'Those', 'Them'], ans: 0, exp: 'Perto e singular: this.' }, { q: 'Plural de "this":', ctx: '', opts: ['these', 'those', 'thats', 'this'], ans: 0, exp: 'this → these.' }, { q: '"___ mountains far away":', ctx: '', opts: ['These', 'This', 'Those', 'That'], ans: 2, exp: 'Longe e plural: those.' }, { q: 'Para algo longe e singular:', ctx: '', opts: ['this', 'that', 'these', 'those'], ans: 1, exp: 'that.' }, { q: '"___ are my keys." (aqui):', ctx: '', opts: ['These', 'That', 'This', 'Those'], ans: 0, exp: 'Perto e plural: these.' }, { q: '"those" indica:', ctx: '', opts: ['perto, plural', 'longe, plural', 'perto, singular', 'longe, singular'], ans: 1, exp: 'Longe e plural.' }] },
    { title: 'Verbo have got', sub: 'I have got, she has got...', icon: '🤲', done: false, explanation: 'Para posse usa-se "have got" (mais comum no inglês britânico) ou "have" (americano). "I have got a car." = "I have a car."', tip: 'Contração: I\'ve got, she\'s got. Pergunta: "Have you got...?"', examples: [{ en: 'I have got two sisters.', pt: 'Tenho duas irmãs.' }, { en: 'She has got a new phone.', pt: 'Ela tem um celular novo.' }, { en: 'Have you got a pen?', pt: 'Você tem uma caneta?' }], q: [{ q: '"She ___ got a car." :', ctx: '', opts: ['has', 'have', 'is', 'do'], ans: 0, exp: 'she/he/it → has got.' }, { q: '"I ___ got two dogs." :', ctx: '', opts: ['have', 'has', 'am', 'do'], ans: 0, exp: 'I → have got.' }, { q: 'Pergunta correta:', ctx: '', opts: ['Have you got a car?', 'You have car?', 'Got you a car?', 'Has you got?'], ans: 0, exp: '"Have you got...?"' }, { q: 'Contração de "I have got":', ctx: '', opts: ["I've got", 'I am got', "I's got", "I got've"], ans: 0, exp: "I've got." }, { q: '"have got" é mais comum no inglês:', ctx: '', opts: ['britânico', 'nenhum', 'antigo', 'técnico'], ans: 0, exp: 'Britânico.' }, { q: 'Negativa de "I have got a car":', ctx: '', opts: ["I haven't got a car", "I don't got", 'I not got', "I hasn't got"], ans: 0, exp: "haven't got." }] },
    { title: 'Advérbios de frequência (always/never)', sub: 'always, usually, never...', icon: '🔁', done: false, explanation: 'always, usually, often, sometimes, rarely, never indicam frequência. Vêm antes do verbo principal, mas depois do verbo to be.', tip: '"I always study" mas "I am always late".', examples: [{ en: 'I always brush my teeth.', pt: 'Eu sempre escovo os dentes.' }, { en: 'She is never late.', pt: 'Ela nunca se atrasa.' }, { en: 'We sometimes eat out.', pt: 'Às vezes comemos fora.' }], q: [{ q: 'Posição com verbo comum:', ctx: '', opts: ['antes do verbo', 'depois do objeto', 'sempre no fim', 'antes do sujeito'], ans: 0, exp: 'Antes do verbo principal.' }, { q: '"always" significa:', ctx: '', opts: ['sempre', 'nunca', 'às vezes', 'raramente'], ans: 0, exp: 'Sempre.' }, { q: '"She ___ late." (nunca, com to be):', ctx: '', opts: ['is never', 'never is', 'is not never', 'never'], ans: 0, exp: 'Depois do to be.' }, { q: 'Mais frequente:', ctx: '', opts: ['always', 'sometimes', 'rarely', 'never'], ans: 0, exp: 'Always = 100%.' }, { q: '"raramente" em inglês:', ctx: '', opts: ['rarely', 'often', 'usually', 'always'], ans: 0, exp: 'Rarely.' }, { q: '"I ___ go to the gym." (geralmente):', ctx: '', opts: ['usually', 'am usually', 'usually am', 'the usually'], ans: 0, exp: 'Antes do verbo.' }] },
    { title: 'Imperativo (ordens)', sub: 'Open the door. Don\'t worry.', icon: '🗣️', done: false, explanation: 'O imperativo dá ordens, instruções e conselhos. Use o verbo na forma base, sem sujeito.', tip: 'Negativo: "Don\'t" + verbo. Ex.: "Don\'t worry."', examples: [{ en: 'Open the window, please.', pt: 'Abra a janela, por favor.' }, { en: "Don't touch that.", pt: 'Não toque nisso.' }, { en: 'Turn left at the corner.', pt: 'Vire à esquerda na esquina.' }], q: [{ q: 'Imperativo de "to close":', ctx: '', opts: ['Close the door.', 'You close.', 'To close.', 'Closing.'], ans: 0, exp: 'Verbo base, sem sujeito.' }, { q: 'Negativo do imperativo:', ctx: '', opts: ["Don't run.", 'No run.', 'Not run.', 'Run not.'], ans: 0, exp: "Don't + verbo." }, { q: 'O imperativo usa o verbo:', ctx: '', opts: ['na forma base', 'no passado', 'com -ing', 'com to'], ans: 0, exp: 'Forma base.' }, { q: 'Para instruções de receita usamos:', ctx: '', opts: ['imperativo', 'futuro', 'present perfect', 'condicional'], ans: 0, exp: 'Imperativo.' }, { q: '"___ careful!" :', ctx: '', opts: ['Be', 'Are', 'Being', 'To be'], ans: 0, exp: 'Be careful!' }, { q: 'O imperativo geralmente:', ctx: '', opts: ['omite o sujeito', 'usa "I"', 'usa "he"', 'precisa de "will"'], ans: 0, exp: 'Sem sujeito.' }] },
    { title: 'Will ou Going to?', sub: 'Decisão na hora vs plano', icon: '🔀', done: false, explanation: '"going to" para planos já decididos; "will" para decisões tomadas na hora e previsões.', tip: '"I\'m going to study tonight" (plano) vs "I\'ll help you" (decisão agora).', examples: [{ en: 'I am going to visit my aunt.', pt: 'Vou visitar minha tia (plano).' }, { en: 'I think it will rain.', pt: 'Acho que vai chover (previsão).' }, { en: "The phone is ringing. I'll get it!", pt: 'O telefone está tocando. Eu atendo!' }], q: [{ q: 'Plano já decidido:', ctx: '', opts: ['going to', 'will', 'would', 'do'], ans: 0, exp: 'Plano → going to.' }, { q: 'Decisão tomada na hora:', ctx: '', opts: ['will', 'going to', 'used to', 'was'], ans: 0, exp: 'Decisão → will.' }, { q: '"Look at those clouds! It ___ rain." :', ctx: '', opts: ['is going to', 'will', 'would', 'goes'], ans: 0, exp: 'Evidência → going to.' }, { q: '"I ___ call you later, I promise." :', ctx: '', opts: ['will', 'am going', 'would', 'was'], ans: 0, exp: 'Promessa → will.' }, { q: '"going to" é seguido de:', ctx: '', opts: ['verbo base', 'verbo -ing', 'verbo passado', 'to + verbo'], ans: 0, exp: 'going to + verbo base.' }, { q: 'Previsão com evidência usa:', ctx: '', opts: ['going to', 'will', 'used to', 'have to'], ans: 0, exp: 'Evidência → going to.' }] },
    { title: 'Past Perfect (had done)', sub: 'had + particípio', icon: '⏪', done: false, explanation: 'had + particípio descreve uma ação que aconteceu ANTES de outra ação no passado.', tip: '"When I arrived, the train had already left."', examples: [{ en: 'She had finished before noon.', pt: 'Ela tinha terminado antes do meio-dia.' }, { en: 'They had never seen snow before.', pt: 'Eles nunca tinham visto neve antes.' }, { en: 'I had eaten when he called.', pt: 'Eu já tinha comido quando ele ligou.' }], q: [{ q: 'Estrutura do Past Perfect:', ctx: '', opts: ['had + particípio', 'have + particípio', 'was + -ing', 'will + verbo'], ans: 0, exp: 'had + past participle.' }, { q: 'O Past Perfect indica:', ctx: '', opts: ['ação anterior a outra no passado', 'futuro', 'presente', 'hábito'], ans: 0, exp: 'O passado do passado.' }, { q: '"When we arrived, the film ___ already ___." :', ctx: '', opts: ['had / started', 'has / started', 'was / start', 'had / start'], ans: 0, exp: 'had + started.' }, { q: '"I ___ never ___ sushi before." :', ctx: '', opts: ['had / eaten', 'have / eaten', 'was / eat', 'had / eat'], ans: 0, exp: 'had + eaten.' }, { q: 'Particípio de "go":', ctx: '', opts: ['gone', 'went', 'going', 'goed'], ans: 0, exp: 'go-went-gone.' }, { q: 'Past Perfect combina com:', ctx: '', opts: ['before / after / already', 'now', 'tomorrow', 'usually'], ans: 0, exp: 'Marcadores de anterioridade.' }] },
    { title: 'Pronomes reflexivos', sub: 'myself, yourself, herself...', icon: '🔄', done: false, explanation: 'myself, yourself, himself, herself, itself, ourselves, yourselves, themselves: usados quando sujeito e objeto são a mesma pessoa.', tip: '"by myself" = sozinho/por conta própria.', examples: [{ en: 'I taught myself English.', pt: 'Eu aprendi inglês sozinho.' }, { en: 'She hurt herself.', pt: 'Ela se machucou.' }, { en: 'They enjoyed themselves.', pt: 'Eles se divertiram.' }], q: [{ q: 'Reflexivo de "I":', ctx: '', opts: ['myself', 'meself', 'my', 'me'], ans: 0, exp: 'myself.' }, { q: 'Reflexivo de "she":', ctx: '', opts: ['herself', 'sheself', 'her', 'hers'], ans: 0, exp: 'herself.' }, { q: '"He cut ___ while cooking." :', ctx: '', opts: ['himself', 'hisself', 'him', 'he'], ans: 0, exp: 'himself.' }, { q: '"by myself" significa:', ctx: '', opts: ['sozinho', 'com ajuda', 'rápido', 'sempre'], ans: 0, exp: 'Sozinho.' }, { q: 'Reflexivo de "they":', ctx: '', opts: ['themselves', 'theirselves', 'them', 'themself'], ans: 0, exp: 'themselves.' }, { q: '"We organized ___." :', ctx: '', opts: ['ourselves', 'ourself', 'us', 'our'], ans: 0, exp: 'ourselves.' }] },
    { title: 'So, Such, Too e Enough', sub: 'Intensificadores', icon: '⚖️', done: false, explanation: 'so + adjetivo; such + (a) + adjetivo + substantivo; too = demais; enough = suficiente (vem depois do adjetivo).', tip: '"so beautiful", "such a nice day", "too hot", "good enough".', examples: [{ en: 'It was so cold.', pt: 'Estava tão frio.' }, { en: 'It was such a long film.', pt: 'Foi um filme tão longo.' }, { en: 'This coffee is too hot to drink.', pt: 'Este café está quente demais.' }], q: [{ q: '"It was ___ a great party." :', ctx: '', opts: ['such', 'so', 'too', 'enough'], ans: 0, exp: 'such + a + adj + subst.' }, { q: '"She is ___ kind." :', ctx: '', opts: ['so', 'such', 'enough', 'a'], ans: 0, exp: 'so + adjetivo.' }, { q: '"too" significa:', ctx: '', opts: ['demais', 'suficiente', 'pouco', 'muito bom'], ans: 0, exp: 'Demais (excesso).' }, { q: '"enough" vem ___ do adjetivo:', ctx: '', opts: ['depois', 'antes', 'no lugar', 'longe'], ans: 0, exp: 'good enough.' }, { q: '"I\'m not strong ___." :', ctx: '', opts: ['enough', 'too', 'so', 'such'], ans: 0, exp: 'strong enough.' }, { q: '"It\'s ___ expensive to buy." (demais):', ctx: '', opts: ['too', 'so', 'such', 'enough'], ans: 0, exp: 'too + adjetivo.' }] },
    { title: 'Future Perfect e Continuous', sub: 'will have done / will be doing', icon: '⏳', done: false, explanation: 'Future Perfect: will have + particípio (ação concluída antes de um momento futuro). Future Continuous: will be + -ing (ação em andamento no futuro).', tip: '"By 2030, I will have graduated." / "This time tomorrow, I\'ll be flying."', examples: [{ en: 'By Friday, I will have finished.', pt: 'Até sexta, terei terminado.' }, { en: 'This time next week, we will be relaxing.', pt: 'A esta hora na próxima semana, estaremos relaxando.' }, { en: 'She will have left by then.', pt: 'Ela já terá saído até lá.' }], q: [{ q: 'Future Perfect:', ctx: '', opts: ['will have + particípio', 'will be + -ing', 'will + verbo', 'have + particípio'], ans: 0, exp: 'will have done.' }, { q: 'Future Continuous:', ctx: '', opts: ['will be + -ing', 'will have + particípio', 'was + -ing', 'going to'], ans: 0, exp: 'will be doing.' }, { q: '"By 2030 I ___ ___ my course." :', ctx: '', opts: ['will have / completed', 'will / complete', 'am / completing', 'will be / complete'], ans: 0, exp: 'will have completed.' }, { q: '"This time tomorrow we ___ ___." (voando):', ctx: '', opts: ['will be / flying', 'will have / flown', 'are / fly', 'will / fly'], ans: 0, exp: 'will be flying.' }, { q: 'Future Perfect indica ação:', ctx: '', opts: ['concluída antes de um ponto futuro', 'em andamento', 'passada', 'habitual'], ans: 0, exp: 'Concluída até lá.' }, { q: '"will be working" descreve:', ctx: '', opts: ['ação em curso no futuro', 'ação concluída', 'hábito passado', 'ordem'], ans: 0, exp: 'Em andamento.' }] },
    { title: 'Modais perfeitos (should have)', sub: 'should/must/could have done', icon: '🌀', done: false, explanation: 'should have (deveria ter), must have (deve ter), could have (poderia ter), might have (talvez tenha) + particípio: especulação ou arrependimento sobre o passado.', tip: '"You should have called." (crítica) / "He must have forgotten." (dedução).', examples: [{ en: 'I should have studied more.', pt: 'Eu deveria ter estudado mais.' }, { en: 'She must have missed the bus.', pt: 'Ela deve ter perdido o ônibus.' }, { en: 'They could have won.', pt: 'Eles poderiam ter ganhado.' }], q: [{ q: '"should have + particípio" expressa:', ctx: '', opts: ['arrependimento/crítica', 'certeza', 'futuro', 'ordem'], ans: 0, exp: 'Algo que não foi feito.' }, { q: '"He ___ have forgotten." (dedução forte):', ctx: '', opts: ['must', 'should', 'could', 'would'], ans: 0, exp: 'must have = dedução.' }, { q: '"I ___ have gone." (arrependimento):', ctx: '', opts: ['should', 'must', 'can', 'will'], ans: 0, exp: 'should have.' }, { q: 'Todos são seguidos de:', ctx: '', opts: ['have + particípio', 'verbo base', '-ing', 'to + verbo'], ans: 0, exp: 'have + past participle.' }, { q: '"might have" indica:', ctx: '', opts: ['possibilidade no passado', 'certeza', 'obrigação', 'futuro'], ans: 0, exp: 'Talvez tenha.' }, { q: '"could have won" significa:', ctx: '', opts: ['poderiam ter ganhado (mas não)', 'ganharam', 'vão ganhar', 'sempre ganham'], ans: 0, exp: 'Possibilidade não realizada.' }] },
    { title: 'Conjunções de contraste', sub: 'although, despite, however', icon: '🔗', done: false, explanation: 'although/even though + frase (sujeito + verbo); despite/in spite of + substantivo ou -ing; however (porém, após ponto e vírgula).', tip: '"Although it was late, ..." = "Despite being late, ..."', examples: [{ en: 'Although he was tired, he kept working.', pt: 'Embora estivesse cansado, continuou trabalhando.' }, { en: 'Despite the rain, we went out.', pt: 'Apesar da chuva, saímos.' }, { en: 'It was hard. However, we succeeded.', pt: 'Foi difícil. Porém, conseguimos.' }], q: [{ q: '"___ it was raining, we played." :', ctx: '', opts: ['Although', 'Despite', 'However', 'Because'], ans: 0, exp: 'Although + frase.' }, { q: '"Despite" é seguido de:', ctx: '', opts: ['substantivo ou -ing', 'frase completa', 'to + verbo', 'só adjetivo'], ans: 0, exp: 'Despite the rain / despite being.' }, { q: '"Although" é seguido de:', ctx: '', opts: ['sujeito + verbo', 'só substantivo', 'só -ing', 'nada'], ans: 0, exp: 'Frase completa.' }, { q: '"However" geralmente vem:', ctx: '', opts: ['após ponto, com vírgula', 'no meio sem nada', 'no início sem vírgula', 'no fim'], ans: 0, exp: '..., however, ...' }, { q: 'Equivale a "Although he tried":', ctx: '', opts: ['Despite trying', 'Despite he tried', 'However trying', 'Because trying'], ans: 0, exp: 'despite + -ing.' }, { q: 'Conjunção de contraste:', ctx: '', opts: ['even though', 'because', 'so', 'therefore'], ans: 0, exp: 'even though = embora.' }] },
    { title: 'Inversão condicional', sub: 'Had I known...', icon: '⚙️', done: false, explanation: 'Em registro formal, omite-se "if" invertendo o verbo auxiliar: "Had I known...", "Were I you...", "Should you need...".', tip: '"If I had known" → "Had I known". "If you should need" → "Should you need".', examples: [{ en: 'Had I known, I would have helped.', pt: 'Se eu soubesse, teria ajudado.' }, { en: 'Were I you, I would accept.', pt: 'Se eu fosse você, aceitaria.' }, { en: 'Should you need anything, call me.', pt: 'Caso precise de algo, me ligue.' }], q: [{ q: '"If I had known" invertido:', ctx: '', opts: ['Had I known', 'Did I know', 'Have I known', 'Knew I'], ans: 0, exp: 'Had I known.' }, { q: '"If you should need" invertido:', ctx: '', opts: ['Should you need', 'Need you should', 'You should need', 'Should need you'], ans: 0, exp: 'Should you need.' }, { q: 'A inversão condicional soa:', ctx: '', opts: ['mais formal', 'mais informal', 'errada', 'antiga e incorreta'], ans: 0, exp: 'Registro formal.' }, { q: '"___ I you, I would rest." :', ctx: '', opts: ['Were', 'Was', 'If', 'Am'], ans: 0, exp: 'Were I you.' }, { q: 'A inversão remove qual palavra?', ctx: '', opts: ['if', 'the', 'to', 'have'], ans: 0, exp: 'Omite "if".' }, { q: '"Had she studied, she ___ passed." :', ctx: '', opts: ['would have', 'will have', 'has', 'had'], ans: 0, exp: 'would have passed.' }] },
    { title: 'Particípios -ing vs -ed', sub: 'boring vs bored', icon: '✍️', done: false, explanation: 'Adjetivos terminados em -ing descrevem a causa/coisa (boring); os terminados em -ed descrevem o sentimento da pessoa (bored).', tip: '"The movie was boring, so I was bored."', examples: [{ en: 'The lesson was interesting.', pt: 'A aula foi interessante.' }, { en: 'I was interested in it.', pt: 'Eu fiquei interessado nela.' }, { en: 'The news was shocking.', pt: 'A notícia foi chocante.' }], q: [{ q: '"The book is ___." (a causa):', ctx: '', opts: ['boring', 'bored', 'bore', 'to bore'], ans: 0, exp: '-ing = causa.' }, { q: '"I am ___." (sentimento):', ctx: '', opts: ['bored', 'boring', 'bore', 'bores'], ans: 0, exp: '-ed = sentimento.' }, { q: '-ed descreve:', ctx: '', opts: ['como a pessoa se sente', 'a causa', 'o futuro', 'um lugar'], ans: 0, exp: 'O sentimento.' }, { q: '"a ___ film" (que assusta):', ctx: '', opts: ['frightening', 'frightened', 'frighten', 'frights'], ans: 0, exp: '-ing = causa.' }, { q: '"She was ___ by the result." :', ctx: '', opts: ['surprised', 'surprising', 'surprise', 'surprises'], ans: 0, exp: '-ed = sentimento.' }, { q: '-ing descreve:', ctx: '', opts: ['a coisa/causa', 'o sentimento', 'o tempo', 'o lugar'], ans: 0, exp: 'A causa.' }] },
    { title: 'Expressões com get', sub: 'get up, get along, get over...', icon: '🔧', done: false, explanation: '"get" é muito versátil: get up (levantar), get along (se dar bem), get over (superar), get rid of (livrar-se), get used to (acostumar-se).', tip: '"I can\'t get over it." = não consigo superar.', examples: [{ en: 'We get along well.', pt: 'Nós nos damos bem.' }, { en: 'She got over the flu.', pt: 'Ela se recuperou da gripe.' }, { en: 'I need to get rid of these boxes.', pt: 'Preciso me livrar dessas caixas.' }], q: [{ q: '"get along" significa:', ctx: '', opts: ['se dar bem', 'desistir', 'chegar', 'levantar'], ans: 0, exp: 'Se dar bem.' }, { q: '"get over (something)" :', ctx: '', opts: ['superar', 'começar', 'adiar', 'vender'], ans: 0, exp: 'Superar.' }, { q: '"get rid of" :', ctx: '', opts: ['livrar-se de', 'guardar', 'comprar', 'consertar'], ans: 0, exp: 'Livrar-se.' }, { q: '"get used to" :', ctx: '', opts: ['acostumar-se', 'usar', 'emprestar', 'perder'], ans: 0, exp: 'Acostumar-se.' }, { q: '"get up" :', ctx: '', opts: ['levantar-se', 'sentar', 'deitar', 'correr'], ans: 0, exp: 'Levantar.' }, { q: '"I can\'t get over it." :', ctx: '', opts: ['não consigo superar', 'não entendo', 'não termino', 'não compro'], ans: 0, exp: 'Superar.' }] },
    { title: 'Provérbios e ditados', sub: 'Better late than never...', icon: '🌍', done: false, explanation: 'Provérbios condensam sabedoria popular. Falantes avançados os reconhecem e usam com naturalidade.', tip: '"The early bird catches the worm." = Deus ajuda quem cedo madruga.', examples: [{ en: 'Better late than never.', pt: 'Antes tarde do que nunca.' }, { en: 'Practice makes perfect.', pt: 'A prática leva à perfeição.' }, { en: "Don't judge a book by its cover.", pt: 'Não julgue pela aparência.' }], q: [{ q: '"Better late than never" =', ctx: '', opts: ['Antes tarde do que nunca', 'Nunca é tarde', 'Tarde demais', 'Melhor nunca'], ans: 0, exp: 'Ditado clássico.' }, { q: '"Practice makes perfect" =', ctx: '', opts: ['A prática leva à perfeição', 'Ninguém é perfeito', 'Pratique sempre', 'Erre menos'], ans: 0, exp: 'A prática aperfeiçoa.' }, { q: '"The early bird catches the worm" =', ctx: '', opts: ['Deus ajuda quem cedo madruga', 'Quem espera alcança', 'Devagar se vai longe', 'Mais vale um pássaro na mão'], ans: 0, exp: 'Quem cedo madruga.' }, { q: '"Don\'t judge a book by its cover" =', ctx: '', opts: ['Não julgue pela aparência', 'Leia mais', 'A capa importa', 'Compre o livro'], ans: 0, exp: 'Não julgue pela aparência.' }, { q: '"When in Rome..." sugere:', ctx: '', opts: ['adaptar-se aos costumes locais', 'viajar para Roma', 'evitar Roma', 'seguir só suas regras'], ans: 0, exp: 'Faça como os locais.' }, { q: 'Provérbios geralmente são:', ctx: '', opts: ['expressões fixas', 'frases literais', 'gírias novas', 'erros'], ans: 0, exp: 'Expressões fixas.' }] },
    { title: 'Phrasal verbs idiomáticos', sub: 'pull off, put up with...', icon: '🛠️', done: false, explanation: 'Phrasal verbs avançados de sentido totalmente figurado: pull off (conseguir), put up with (tolerar), come up with (bolar), get away with (sair impune).', tip: '"She pulled it off." = Ela conseguiu (algo difícil).', examples: [{ en: 'He came up with a great idea.', pt: 'Ele bolou uma ótima ideia.' }, { en: "I can't put up with the noise.", pt: 'Não suporto o barulho.' }, { en: 'They got away with it.', pt: 'Eles saíram impunes.' }], q: [{ q: '"come up with" =', ctx: '', opts: ['bolar/inventar', 'subir', 'encontrar por acaso', 'desistir'], ans: 0, exp: 'Bolar uma ideia.' }, { q: '"put up with" =', ctx: '', opts: ['tolerar', 'hospedar', 'construir', 'levantar'], ans: 0, exp: 'Tolerar.' }, { q: '"pull off" (algo difícil) =', ctx: '', opts: ['conseguir', 'puxar', 'cancelar', 'sair'], ans: 0, exp: 'Conseguir.' }, { q: '"get away with (something)" =', ctx: '', opts: ['sair impune', 'viajar', 'fugir a pé', 'guardar'], ans: 0, exp: 'Sair impune.' }, { q: '"back someone up" =', ctx: '', opts: ['apoiar alguém', 'recuar', 'copiar', 'assustar'], ans: 0, exp: 'Apoiar.' }, { q: 'Esses phrasal verbs têm sentido:', ctx: '', opts: ['figurado', 'literal', 'técnico', 'só formal'], ans: 0, exp: 'Figurado.' }] },
    { title: 'Linguagem jurídica e formal', sub: 'shall, hereby, pursuant to...', icon: '📝', done: false, explanation: 'Documentos formais usam termos próprios: hereby, herein, pursuant to, shall, the undersigned, terms and conditions.', tip: '"shall" em contratos indica obrigação. "pursuant to" = de acordo com.', examples: [{ en: 'The tenant shall pay rent monthly.', pt: 'O locatário deverá pagar o aluguel mensalmente.' }, { en: 'Pursuant to the agreement...', pt: 'De acordo com o contrato...' }, { en: 'The undersigned agrees to the terms.', pt: 'O abaixo-assinado concorda com os termos.' }], q: [{ q: 'Em contratos, "shall" indica:', ctx: '', opts: ['obrigação', 'sugestão', 'passado', 'dúvida'], ans: 0, exp: 'Obrigação legal.' }, { q: '"pursuant to" =', ctx: '', opts: ['de acordo com', 'apesar de', 'antes de', 'sem'], ans: 0, exp: 'De acordo com.' }, { q: '"the undersigned" =', ctx: '', opts: ['o abaixo-assinado', 'o advogado', 'a testemunha', 'o juiz'], ans: 0, exp: 'Quem assina.' }, { q: '"hereby" aparece em:', ctx: '', opts: ['textos formais/jurídicos', 'conversas casuais', 'gírias', 'legendas'], ans: 0, exp: 'Registro jurídico.' }, { q: '"terms and conditions" =', ctx: '', opts: ['termos e condições', 'prazos finais', 'preços', 'assinaturas'], ans: 0, exp: 'Termos e condições.' }, { q: 'O registro jurídico é:', ctx: '', opts: ['altamente formal', 'informal', 'coloquial', 'simples'], ans: 0, exp: 'Muito formal.' }] },
    { title: 'Used to: hábitos do passado', sub: 'I used to play soccer...', icon: '⏪', done: false, cefr: 'B1', explanation: '"Used to" descreve hábitos ou estados do passado que NÃO existem mais. Estrutura: used to + verbo base. Negativa: didn\'t use to (sem o "d").', tip: 'Não confunda: "I used to smoke" (fumava, parei) ≠ "I am used to waking up early" (estou acostumado).', examples: [{ en: 'I used to play soccer every weekend.', pt: 'Eu jogava futebol todo fim de semana.' }, { en: 'She used to live in Recife.', pt: 'Ela morava em Recife.' }, { en: 'We did not use to eat out.', pt: 'A gente não costumava comer fora.' }], q: [{ q: '"Eu costumava trabalhar à noite":', ctx: '', opts: ['I used to work at night', 'I use to work at night', 'I am used to work at night', 'I was used work night'], ans: 0, exp: 'Used to + verbo base.' }, { q: 'Negativa de "She used to dance":', ctx: '', opts: ["She didn't use to dance.", "She didn't used to dance.", 'She used not dance.', "She doesn't use to dance."], ans: 0, exp: 'Negativa: didn\'t use to (o "d" some).' }, { q: '"I am used to waking up early" significa:', ctx: '', opts: ['Estou acostumado a acordar cedo', 'Eu acordava cedo antigamente', 'Vou acordar cedo', 'Odeio acordar cedo'], ans: 0, exp: 'Be used to + -ing = estar acostumado.' }, { q: 'Pergunta correta:', ctx: '', opts: ['Did you use to live here?', 'Did you used to live here?', 'Used you to live here?', 'Do you used to live here?'], ans: 0, exp: 'Did + use to (sem "d").' }, { q: '"There used to be a park here" significa:', ctx: '', opts: ['Havia um parque aqui (não há mais)', 'Há um parque aqui', 'Haverá um parque aqui', 'O parque é muito usado'], ans: 0, exp: 'Used to = coisa do passado que acabou.' }, { q: 'Qual frase indica hábito que CONTINUA?', ctx: '', opts: ['I still play soccer.', 'I used to play soccer.', 'I no longer play soccer.', 'I gave up soccer.'], ans: 0, exp: '"Still" = ainda; "used to" = acabou.' }] },
    { title: 'Question tags', sub: "It's nice, isn't it?", icon: '🏷️', done: false, cefr: 'B1', explanation: 'Frase afirmativa → tag negativa; frase negativa → tag positiva. A tag repete o auxiliar da frase.', tip: 'Com "I am", a tag é "aren\'t I?": "I\'m late, aren\'t I?"', examples: [{ en: 'You are Brazilian, aren\'t you?', pt: 'Você é brasileiro, não é?' }, { en: 'She doesn\'t like coffee, does she?', pt: 'Ela não gosta de café, né?' }, { en: 'It\'s a beautiful day, isn\'t it?', pt: 'Está um dia lindo, não está?' }], q: [{ q: '"You live here, _____?"', ctx: '', opts: ["don't you", 'do you', "aren't you", "didn't you"], ans: 0, exp: 'Afirmativa com verbo comum → don\'t you.' }, { q: '"She can swim, _____?"', ctx: '', opts: ["can't she", 'can she', "doesn't she", "isn't she"], ans: 0, exp: 'Repete o modal: can → can\'t she.' }, { q: '"They didn\'t call, _____?"', ctx: '', opts: ['did they', "didn't they", 'do they', 'have they'], ans: 0, exp: 'Negativa → tag positiva.' }, { q: 'Tag de "I\'m right":', ctx: '', opts: ["aren't I?", "am not I?", "isn't I?", "don't I?"], ans: 0, exp: 'Exceção famosa: aren\'t I?' }, { q: 'Pra que serve a question tag?', ctx: '', opts: ['Confirmar ou puxar concordância', 'Dar ordem', 'Negar tudo', 'Formalizar a frase'], ans: 0, exp: 'É o nosso "né?".' }, { q: '"He was late, _____?"', ctx: '', opts: ["wasn't he", "isn't he", "didn't he", "hasn't he"], ans: 0, exp: 'Was → wasn\'t he.' }] },
    { title: 'Gerúndio ou infinitivo?', sub: 'stop doing vs stop to do', icon: '⚖️', done: false, cefr: 'B1', explanation: 'Enjoy, finish, avoid, mind pedem -ING. Want, decide, hope, plan pedem TO. Alguns mudam de sentido: stop doing (parar de fazer) vs stop to do (parar PARA fazer).', tip: 'Depois de preposição é sempre -ing: "good at cooking", "before leaving".', examples: [{ en: 'I enjoy learning English.', pt: 'Eu gosto de aprender inglês.' }, { en: 'She decided to move abroad.', pt: 'Ela decidiu se mudar pro exterior.' }, { en: 'He stopped smoking last year.', pt: 'Ele parou de fumar ano passado.' }], q: [{ q: '"I enjoy _____ music."', ctx: '', opts: ['listening to', 'to listen to', 'listen', 'listened'], ans: 0, exp: 'Enjoy + -ing.' }, { q: '"We decided _____ a house."', ctx: '', opts: ['to buy', 'buying', 'buy', 'bought'], ans: 0, exp: 'Decide + to.' }, { q: '"He stopped to smoke" significa:', ctx: '', opts: ['Parou (o que fazia) para fumar', 'Parou de fumar', 'Nunca fumou', 'Vai parar de fumar'], ans: 0, exp: 'Stop to do = parar PARA fazer.' }, { q: '"Avoid _____ sugar."', ctx: '', opts: ['eating', 'to eat', 'eat', 'ate'], ans: 0, exp: 'Avoid + -ing.' }, { q: '"She is good at _____."', ctx: '', opts: ['drawing', 'to draw', 'draw', 'drew'], ans: 0, exp: 'Preposição + -ing.' }, { q: '"I hope _____ you soon."', ctx: '', opts: ['to see', 'seeing', 'see', 'saw'], ans: 0, exp: 'Hope + to.' }] },
    { title: 'Modais de dedução', sub: "must be, might be, can't be", icon: '🕵️', done: false, cefr: 'B1', explanation: 'Deduzir no presente: certeza = must be; possibilidade = might/may/could be; impossibilidade = can\'t be.', tip: 'O oposto de "must be" (deve ser) é "can\'t be" (não pode ser) — não "mustn\'t be".', examples: [{ en: 'He must be tired after the trip.', pt: 'Ele deve estar cansado da viagem.' }, { en: 'She might be at the gym.', pt: 'Ela pode estar na academia.' }, { en: 'That can\'t be true!', pt: 'Isso não pode ser verdade!' }], q: [{ q: 'Luz acesa, carro na garagem: "He _____ home."', ctx: '', opts: ['must be', "can't be", 'mustn\'t be', 'shouldn\'t be'], ans: 0, exp: 'Evidência forte → must be.' }, { q: '"She _____ be at work, I\'m not sure."', ctx: '', opts: ['might', 'must', "can't", 'should'], ans: 0, exp: 'Incerteza → might.' }, { q: 'Oposto de "It must be Ana":', ctx: '', opts: ["It can't be Ana", "It mustn't be Ana", "It shouldn't be Ana", 'It may be Ana'], ans: 0, exp: 'Dedução negativa = can\'t be.' }, { q: '"You\'ve worked 12 hours. You _____ exhausted."', ctx: '', opts: ['must be', 'might be', "can't be", 'would be'], ans: 0, exp: 'Dedução óbvia → must.' }, { q: '"It might rain" indica:', ctx: '', opts: ['Possibilidade', 'Certeza total', 'Impossibilidade', 'Obrigação'], ans: 0, exp: 'Might = talvez.' }, { q: '"He can\'t be 40, he looks 25!" — a pessoa está:', ctx: '', opts: ['Dizendo que é impossível', 'Confirmando a idade', 'Perguntando a idade', 'Elogiando'], ans: 0, exp: 'Can\'t be = não é possível.' }] },
    { title: 'Third Conditional', sub: 'If I had known...', icon: '⏳', done: false, cefr: 'B2', explanation: 'Passado que NÃO aconteceu (arrependimento): If + had + particípio, would have + particípio.', tip: 'Na fala vira "If I\'d known, I would\'ve gone".', examples: [{ en: 'If I had studied, I would have passed.', pt: 'Se eu tivesse estudado, teria passado.' }, { en: 'She would have come if you had called.', pt: 'Ela teria vindo se você tivesse ligado.' }, { en: 'If we had left earlier, we would have arrived on time.', pt: 'Se tivéssemos saído antes, teríamos chegado a tempo.' }], q: [{ q: '"If I _____ known, I would have helped."', ctx: '', opts: ['had', 'have', 'would have', 'was'], ans: 0, exp: 'If + had + particípio.' }, { q: '"If you had called, I _____ answered."', ctx: '', opts: ['would have', 'would', 'will have', 'had'], ans: 0, exp: 'Resultado: would have + particípio.' }, { q: 'O 3º condicional fala de:', ctx: '', opts: ['Passado que não aconteceu', 'Futuro possível', 'Presente hipotético', 'Hábito'], ans: 0, exp: 'Passado irreal/arrependimento.' }, { q: '"I would have gone if I hadn\'t been sick" — ele foi?', ctx: '', opts: ['Não foi (estava doente)', 'Foi', 'Vai amanhã', 'Foi, mas doente'], ans: 0, exp: 'Não foi — o passado não mudou.' }, { q: 'Qual está correta?', ctx: '', opts: ['If she had seen it, she would have told me.', 'If she would have seen, she had told me.', 'If she saw it, she would have tell me.', 'If she had see, she would told me.'], ans: 0, exp: 'If + had + particípio / would have + particípio.' }, { q: '"If I hadn\'t missed the bus..." expressa:', ctx: '', opts: ['Arrependimento', 'Plano futuro', 'Ordem', 'Rotina'], ans: 0, exp: 'Clássico do arrependimento.' }] },
    { title: 'Relative clauses com vírgula', sub: 'defining vs non-defining', icon: '📎', done: false, cefr: 'B2', explanation: 'SEM vírgula = define quem/o quê (pode usar that). COM vírgula = só acrescenta informação extra (which/who — nunca that).', tip: 'Se dá pra tirar a oração sem mudar o sentido principal, ela vai entre vírgulas.', examples: [{ en: 'My brother, who lives in Miami, is visiting.', pt: 'Meu irmão, que mora em Miami, está de visita.' }, { en: 'The car that I bought is red.', pt: 'O carro que eu comprei é vermelho.' }, { en: 'São Paulo, which is huge, never sleeps.', pt: 'São Paulo, que é enorme, nunca dorme.' }], q: [{ q: 'Com vírgulas, qual pronome é PROIBIDO?', ctx: '', opts: ['that', 'which', 'who', 'whose'], ans: 0, exp: 'Non-defining nunca usa that.' }, { q: '"The book _____ you lent me is great." (sem vírgula)', ctx: '', opts: ['that', 'what', 'whom', 'whose'], ans: 0, exp: 'Defining: that/which.' }, { q: '"Maria, _____ is my boss, called."', ctx: '', opts: ['who', 'that', 'what', 'which'], ans: 0, exp: 'Pessoa + vírgula → who.' }, { q: 'A oração entre vírgulas serve pra:', ctx: '', opts: ['Acrescentar info extra', 'Definir qual coisa é', 'Negar', 'Perguntar'], ans: 0, exp: 'Extra: dá pra remover sem perder o sentido.' }, { q: '"The house _____ roof is red is mine."', ctx: '', opts: ['whose', 'that', 'which', 'who'], ans: 0, exp: 'Posse → whose.' }, { q: 'Qual está correta?', ctx: '', opts: ['Rio, which I love, is beautiful.', 'Rio, that I love, is beautiful.', 'Rio which I love is beautiful.', 'Rio, who I love, is beautiful.'], ans: 0, exp: 'Cidade + vírgula → which.' }] },
    { title: 'Conectivos de causa e efeito', sub: 'therefore, due to, as a result', icon: '🔗', done: false, cefr: 'B2', explanation: 'Causa: because of / due to + substantivo. Efeito: therefore, as a result, consequently. "Because" pede oração completa.', tip: '"Due to" + substantivo: "due to the rain". Nunca "due to it rained".', examples: [{ en: 'The flight was delayed due to the storm.', pt: 'O voo atrasou por causa da tempestade.' }, { en: 'He forgot the map, so we got lost.', pt: 'Ele esqueceu o mapa, então nos perdemos.' }, { en: 'Sales dropped; as a result, prices fell.', pt: 'As vendas caíram; como resultado, os preços caíram.' }], q: [{ q: '"_____ the traffic, we missed the show."', ctx: '', opts: ['Due to', 'Because', 'Therefore', 'Although'], ans: 0, exp: 'Due to + substantivo.' }, { q: '"It rained a lot; _____, the game was cancelled."', ctx: '', opts: ['therefore', 'because', 'due to', 'despite'], ans: 0, exp: 'Therefore = por isso.' }, { q: '"Because" precisa de:', ctx: '', opts: ['Oração completa (sujeito + verbo)', 'Só substantivo', 'Gerúndio', 'Vírgula sempre'], ans: 0, exp: 'Because it rained ✓ / due to the rain ✓.' }, { q: 'Sinônimo de "as a result":', ctx: '', opts: ['consequently', 'meanwhile', 'moreover', 'otherwise'], ans: 0, exp: 'Consequently = consequentemente.' }, { q: '"Thanks to your help, we finished." — o tom é:', ctx: '', opts: ['Positivo (graças a)', 'Negativo (por culpa de)', 'Neutro', 'Irônico sempre'], ans: 0, exp: 'Thanks to = causa boa.' }, { q: 'Qual está ERRADA?', ctx: '', opts: ['Due to it rained, we stayed home.', 'Because it rained, we stayed home.', 'Due to the rain, we stayed home.', 'It rained, so we stayed home.'], ans: 0, exp: 'Due to não aceita oração.' }] },
    { title: 'Verbos com preposição fixa', sub: 'depend on, good at, afraid of', icon: '🧲', done: false, cefr: 'B2', explanation: 'Muitos verbos e adjetivos têm preposição FIXA: depend ON, listen TO, good AT, afraid OF, interested IN. Não traduza a preposição do português.', tip: 'Pegadinha BR: "depender DE" = depend ON (não "of"); "sonhar COM" = dream ABOUT/OF (não "with").', examples: [{ en: 'It depends on the weather.', pt: 'Depende do tempo.' }, { en: 'She is good at math.', pt: 'Ela é boa em matemática.' }, { en: 'I am interested in photography.', pt: 'Tenho interesse em fotografia.' }], q: [{ q: '"Depende de você":', ctx: '', opts: ['It depends on you', 'It depends of you', 'It depends from you', 'It depends to you'], ans: 0, exp: 'Depend ON, sempre.' }, { q: '"I dreamed _____ you last night."', ctx: '', opts: ['about', 'with', 'on', 'in'], ans: 0, exp: 'Dream about/of — nunca "with".' }, { q: '"She is married _____ a doctor."', ctx: '', opts: ['to', 'with', 'at', 'on'], ans: 0, exp: 'Married TO.' }, { q: '"Listen _____ me!"', ctx: '', opts: ['to', 'at', 'on', '—'], ans: 0, exp: 'Listen TO.' }, { q: '"Afraid _____ spiders."', ctx: '', opts: ['of', 'from', 'with', 'about'], ans: 0, exp: 'Afraid OF.' }, { q: '"Ela é boa em inglês":', ctx: '', opts: ['She is good at English', 'She is good in English', 'She is good on English', 'She is good with English language'], ans: 0, exp: 'Good AT.' }] },
    { title: 'Few, a few, little, a little', sub: 'Quantificadores que confundem', icon: '🧮', done: false, cefr: 'B2', explanation: 'A few / a little = alguns / um pouco (tom positivo). Few / little (sem "a") = quase nenhum (tom negativo). Few com contáveis, little com incontáveis.', tip: '"Plenty of" = de sobra. "I have plenty of time" = tenho tempo de sobra.', examples: [{ en: 'I have a few friends in London.', pt: 'Tenho alguns amigos em Londres.' }, { en: 'There is little time left.', pt: 'Resta pouco tempo.' }, { en: 'We need a little more patience.', pt: 'Precisamos de um pouco mais de paciência.' }], q: [{ q: '"Tenho alguns livros" (tom positivo):', ctx: '', opts: ['I have a few books', 'I have few books', 'I have little books', 'I have a little books'], ans: 0, exp: 'A few = alguns.' }, { q: '"Few people came" significa:', ctx: '', opts: ['Quase ninguém veio', 'Algumas pessoas vieram', 'Muita gente veio', 'Ninguém veio'], ans: 0, exp: 'Few (sem "a") = tom negativo.' }, { q: 'Com "money" (incontável), use:', ctx: '', opts: ['a little', 'a few', 'many', 'few'], ans: 0, exp: 'Incontável → little/a little.' }, { q: '"_____ of my friends smoke — almost none."', ctx: '', opts: ['Few', 'A few', 'A little', 'Plenty'], ans: 0, exp: 'Quase nenhum → few.' }, { q: '"Plenty of time" significa:', ctx: '', opts: ['Tempo de sobra', 'Pouco tempo', 'Sem tempo', 'Tempo exato'], ans: 0, exp: 'Plenty of = de sobra.' }, { q: 'Qual está correta?', ctx: '', opts: ['She has a little experience.', 'She has a few experience.', 'She has few experience.', 'She has many experience.'], ans: 0, exp: 'Experience é incontável → a little.' }] },
    { title: 'Cleft sentences (ênfase)', sub: 'What I need is coffee...', icon: '🎯', done: false, cefr: 'C1', explanation: 'Reorganize a frase pra enfatizar uma parte: "What I need is..." / "It was John who called." Muito comum na fala nativa.', tip: '"All I want is..." = tudo o que eu quero é... (ênfase total).', examples: [{ en: 'What I need is a vacation.', pt: 'O que eu preciso é de férias.' }, { en: 'It was Maria who solved the problem.', pt: 'Foi a Maria que resolveu o problema.' }, { en: 'All I want is some peace.', pt: 'Tudo que eu quero é um pouco de paz.' }], q: [{ q: 'Enfatizando "coffee" em "I need coffee":', ctx: '', opts: ['What I need is coffee.', 'Coffee I need what.', 'I need what coffee.', 'It is I who coffee.'], ans: 0, exp: 'What + sujeito + verbo + is...' }, { q: '"_____ was Ana who paid the bill."', ctx: '', opts: ['It', 'What', 'That', 'There'], ans: 0, exp: 'It was X who...' }, { q: 'Cleft sentences servem pra:', ctx: '', opts: ['Enfatizar uma informação', 'Encurtar a frase', 'Negar', 'Formalizar apenas'], ans: 0, exp: 'Foco/ênfase.' }, { q: '"All she does is complain" — o tom é:', ctx: '', opts: ['Crítica (só faz reclamar)', 'Elogio', 'Dúvida', 'Pedido'], ans: 0, exp: 'All X does is... = crítica clássica.' }, { q: '"It was in 2020 _____ we met."', ctx: '', opts: ['that', 'who', 'where', 'what'], ans: 0, exp: 'It was + tempo + that.' }, { q: 'Versão enfática de "I love the beach":', ctx: '', opts: ['What I love is the beach.', 'The beach what I love.', 'Is the beach I love what.', 'I what love the beach.'], ans: 0, exp: 'What I love is...' }] },
    { title: 'Inglês de reuniões e negociação', sub: "Let's circle back...", icon: '🤝', done: false, cefr: 'C1', explanation: 'O inglês corporativo tem fórmulas próprias: get down to business (ir ao ponto), circle back (retomar depois), on the same page (alinhados), touch base (dar um alô).', tip: '"Let\'s take this offline" = falamos disso em separado (fora da reunião).', examples: [{ en: 'Let\'s get down to business.', pt: 'Vamos direto ao assunto.' }, { en: 'Could we circle back to that later?', pt: 'Podemos retomar isso mais tarde?' }, { en: 'We are on the same page.', pt: 'Estamos alinhados.' }], q: [{ q: '"Circle back" significa:', ctx: '', opts: ['Retomar o assunto depois', 'Andar em círculos', 'Encerrar a reunião', 'Discordar'], ans: 0, exp: 'Voltar ao ponto mais tarde.' }, { q: '"We\'re on the same page" =', ctx: '', opts: ['Estamos alinhados', 'Lemos o mesmo livro', 'Estamos na mesma sala', 'Discordamos'], ans: 0, exp: 'Mesmo entendimento.' }, { q: '"Touch base" significa:', ctx: '', opts: ['Dar um alô / se falar rapidinho', 'Tocar na mesa', 'Fechar contrato', 'Demitir'], ans: 0, exp: 'Contato rápido.' }, { q: 'Adiar decisão com elegância:', ctx: '', opts: ["Let's sleep on it.", "Let's die on it.", "Let's throw it.", "Let's kill the idea now."], ans: 0, exp: 'Sleep on it = pensar até amanhã.' }, { q: '"The ball is in your court" =', ctx: '', opts: ['A decisão agora é sua', 'Você perdeu', 'É hora do esporte', 'O prazo acabou'], ans: 0, exp: 'A próxima jogada é sua.' }, { q: '"Deadline" é:', ctx: '', opts: ['Prazo final', 'Linha do tempo', 'Reunião longa', 'Contrato'], ans: 0, exp: 'Prazo-limite.' }] },
    { title: 'Verbos de reporte', sub: 'admit, deny, suggest, warn...', icon: '🗣️', done: false, cefr: 'C1', explanation: 'Muito além de say/tell: admit + -ing (admitir), deny + -ing (negar), suggest + -ing (sugerir), warn someone not to (avisar pra não), refuse to (recusar-se).', tip: 'Suggest NUNCA leva "to + pessoa + verbo": "She suggested going" ✓, "She suggested me to go" ✗.', examples: [{ en: 'He admitted breaking the vase.', pt: 'Ele admitiu ter quebrado o vaso.' }, { en: 'She suggested taking a break.', pt: 'Ela sugeriu fazer uma pausa.' }, { en: 'They warned us not to be late.', pt: 'Eles nos avisaram pra não atrasar.' }], q: [{ q: '"She denied _____ the money."', ctx: '', opts: ['stealing', 'to steal', 'steal', 'stole'], ans: 0, exp: 'Deny + -ing.' }, { q: '"He refused _____ the document."', ctx: '', opts: ['to sign', 'signing', 'sign', 'signed'], ans: 0, exp: 'Refuse + to.' }, { q: 'Qual está correta?', ctx: '', opts: ['She suggested going home.', 'She suggested me to go home.', 'She suggested to me go.', 'She suggested that go.'], ans: 0, exp: 'Suggest + -ing.' }, { q: '"They accused him _____ lying."', ctx: '', opts: ['of', 'to', 'for', 'about'], ans: 0, exp: 'Accuse someone OF + -ing.' }, { q: '"Warn" carrega ideia de:', ctx: '', opts: ['Aviso/alerta', 'Elogio', 'Convite', 'Promessa'], ans: 0, exp: 'Warn = avisar de perigo/risco.' }, { q: '"He promised _____ me back."', ctx: '', opts: ['to pay', 'paying', 'pay', 'paid'], ans: 0, exp: 'Promise + to.' }] },
    { title: 'So do I, Neither do I', sub: 'Concordando como nativo', icon: '🪞', done: false, cefr: 'C1', explanation: 'Concordar com afirmativa: So + auxiliar + eu ("So do I"). Concordar com negativa: Neither + auxiliar + eu ("Neither can I"). O auxiliar espelha o da frase original.', tip: 'Informal: "Me too" (afirmativa) e "Me neither" (negativa) funcionam sempre.', examples: [{ en: 'I love coffee. So do I!', pt: 'Eu amo café. Eu também!' }, { en: 'She can\'t swim. Neither can I.', pt: 'Ela não sabe nadar. Nem eu.' }, { en: 'They went home, and so did we.', pt: 'Eles foram pra casa, e nós também.' }], q: [{ q: '"I love pizza." — concordando:', ctx: '', opts: ['So do I', 'So am I', 'Neither do I', 'So I do'], ans: 0, exp: 'Love (verbo comum, presente) → do.' }, { q: '"I\'m tired." — concordando:', ctx: '', opts: ['So am I', 'So do I', 'So did I', 'Neither am I'], ans: 0, exp: 'Am → So am I.' }, { q: '"I don\'t eat meat." — concordando:', ctx: '', opts: ['Neither do I', 'So do I', 'Neither am I', 'Either do I'], ans: 0, exp: 'Negativa → neither + do.' }, { q: '"She has finished. _____ have I."', ctx: '', opts: ['So', 'Neither', 'Too', 'Either'], ans: 0, exp: 'Afirmativa → so.' }, { q: '"Me neither" responde a:', ctx: '', opts: ['Uma frase negativa', 'Uma frase afirmativa', 'Uma pergunta', 'Um pedido'], ans: 0, exp: '"I don\'t like it." "Me neither."' }, { q: '"I can drive. _____"', ctx: '', opts: ['So can I.', 'So do I.', 'So am I.', 'Neither can I.'], ans: 0, exp: 'Can → so can I.' }] },
    { title: 'Intensificadores nativos', sub: 'utterly, barely, downright...', icon: '🌡️', done: false, cefr: 'C1', explanation: 'Suba do "very": utterly (completamente), barely (mal/quase não), downright (francamente), highly (altamente), deeply (profundamente).', tip: 'Combinações fixas: highly recommended, deeply sorry, utterly ridiculous, bitterly cold.', examples: [{ en: 'I was utterly exhausted.', pt: 'Eu estava completamente exausto.' }, { en: 'She barely slept last night.', pt: 'Ela mal dormiu ontem à noite.' }, { en: 'That movie was downright terrible.', pt: 'Aquele filme foi francamente terrível.' }], q: [{ q: '"Barely" significa:', ctx: '', opts: ['Mal / quase não', 'Muito', 'Sempre', 'Nunca'], ans: 0, exp: '"I barely know him" = mal o conheço.' }, { q: '"_____ recommended" (colocação natural):', ctx: '', opts: ['Highly', 'Strongly big', 'Very much', 'Deeply'], ans: 0, exp: 'Highly recommended.' }, { q: '"Utterly ridiculous" =', ctx: '', opts: ['Completamente ridículo', 'Um pouco estranho', 'Quase aceitável', 'Levemente engraçado'], ans: 0, exp: 'Utterly = totalmente.' }, { q: '"Bitterly cold" descreve:', ctx: '', opts: ['Frio cortante', 'Frio agradável', 'Calor', 'Gosto amargo'], ans: 0, exp: 'Colocação fixa: frio intenso.' }, { q: '"I\'m deeply sorry" é:', ctx: '', opts: ['Desculpa sincera e forte', 'Desculpa irônica', 'Desculpa casual', 'Recusa'], ans: 0, exp: 'Deeply sorry = profundamente.' }, { q: 'Substituto forte de "very tired":', ctx: '', opts: ['exhausted', 'a bit tired', 'sleepy little', 'much tired'], ans: 0, exp: 'Very tired → exhausted.' }] },
    { title: 'Inversão para ênfase', sub: 'Never have I seen...', icon: '🔄', done: false, cefr: 'C2', explanation: 'Advérbio negativo no início inverte sujeito e auxiliar: "Never have I seen...", "Rarely does she...", "Not only did he win, ...". Tom dramático/formal.', tip: 'Not only... but also: "Not only did he win, but he also broke the record."', examples: [{ en: 'Never have I seen such talent.', pt: 'Nunca vi tanto talento.' }, { en: 'Rarely does she make mistakes.', pt: 'Raramente ela erra.' }, { en: 'Not only did he win, he broke the record.', pt: 'Ele não só venceu, como quebrou o recorde.' }], q: [{ q: '"Never _____ such a beautiful place."', ctx: '', opts: ['have I seen', 'I have seen', 'I saw have', 'have seen I'], ans: 0, exp: 'Never + auxiliar + sujeito.' }, { q: '"_____ does he complain." (raramente)', ctx: '', opts: ['Rarely', 'Always', 'Rare', 'Never do'], ans: 0, exp: 'Rarely does he...' }, { q: 'A inversão dá à frase um tom:', ctx: '', opts: ['Enfático/dramático', 'Infantil', 'Neutro', 'Errado'], ans: 0, exp: 'Ênfase e formalidade.' }, { q: '"Not only _____ late, he forgot the gift."', ctx: '', opts: ['was he', 'he was', 'is he was', 'he is'], ans: 0, exp: 'Not only + auxiliar + sujeito.' }, { q: '"Under no circumstances _____ open this door."', ctx: '', opts: ['should you', 'you should', 'should', 'you'], ans: 0, exp: 'Negativa no início → inversão.' }, { q: 'Sem inversão, "Never have I seen it" vira:', ctx: '', opts: ['I have never seen it.', 'I never have seen it is.', 'Never I seen it have.', 'It never has seen me.'], ans: 0, exp: 'Ordem normal: I have never seen it.' }] },
    { title: 'Inglês de manchetes', sub: 'PM quits. Markets soar.', icon: '📰', done: false, cefr: 'C2', explanation: 'Manchetes cortam artigos e auxiliares. Presente simples = passado ("PM quits" = renunciou). Infinitivo = futuro ("PM to visit Brazil" = vai visitar).', tip: 'Verbos curtos de manchete: soar (disparar), plunge (despencar), slam (criticar duro), back (apoiar), vow (prometer).', examples: [{ en: 'President to visit Japan next week.', pt: 'Presidente visitará o Japão semana que vem.' }, { en: 'Markets soar after election results.', pt: 'Mercados disparam após resultado das eleições.' }, { en: 'Scientists discover new species in Amazon.', pt: 'Cientistas descobrem nova espécie na Amazônia.' }], q: [{ q: '"PM to resign" significa:', ctx: '', opts: ['O premiê VAI renunciar', 'O premiê renunciou', 'O premiê recusou', 'O premiê voltou'], ans: 0, exp: 'To + verbo = futuro em manchete.' }, { q: '"Stocks plunge" =', ctx: '', opts: ['Ações despencam', 'Ações sobem', 'Ações estáveis', 'Ações novas'], ans: 0, exp: 'Plunge = despencar.' }, { q: '"Minister slams new law" — o ministro:', ctx: '', opts: ['Criticou duramente', 'Aprovou', 'Assinou', 'Ignorou'], ans: 0, exp: 'Slam = criticar com força.' }, { q: 'Por que "Man bites dog" sem "a/the"?', ctx: '', opts: ['Manchetes cortam artigos', 'Erro de digitação', 'É plural', 'É pergunta'], ans: 0, exp: 'Economia de espaço.' }, { q: '"Mayor vows to cut taxes" — vow =', ctx: '', opts: ['Prometer solenemente', 'Recusar', 'Estudar', 'Aumentar'], ans: 0, exp: 'Vow = jurar/prometer.' }, { q: '"Team backs coach" =', ctx: '', opts: ['O time apoia o técnico', 'O time demite o técnico', 'O técnico volta', 'O time perde'], ans: 0, exp: 'Back = apoiar.' }] },
    { title: 'Orações participiais', sub: 'Having finished, she left...', icon: '🧬', done: false, cefr: 'C2', explanation: 'Encurte frases com particípio: "Having finished the report, she went home" (= depois que terminou). "Built in 1920, the house..." (= que foi construída).', tip: 'O sujeito das duas partes precisa ser o MESMO, senão vira "dangling participle" (erro clássico).', examples: [{ en: 'Having finished the report, she went home.', pt: 'Tendo terminado o relatório, ela foi pra casa.' }, { en: 'Built in 1920, the house needs repairs.', pt: 'Construída em 1920, a casa precisa de reformas.' }, { en: 'Feeling tired, he cancelled the meeting.', pt: 'Sentindo-se cansado, ele cancelou a reunião.' }], q: [{ q: '"_____ the movie, we discussed it."', ctx: '', opts: ['Having watched', 'To watch', 'Watch', 'Watched we'], ans: 0, exp: 'Having + particípio = depois de.' }, { q: '"Written in 1600, the play..." — a peça:', ctx: '', opts: ['Foi escrita em 1600', 'Escreveu em 1600', 'Será escrita', 'Está sendo escrita'], ans: 0, exp: 'Particípio passado = voz passiva.' }, { q: 'Nas participiais, o sujeito deve ser:', ctx: '', opts: ['O mesmo nas duas partes', 'Sempre diferente', 'Sempre "it"', 'Omitido nas duas'], ans: 0, exp: 'Senão vira dangling participle.' }, { q: '"Not knowing the answer, he stayed quiet." =', ctx: '', opts: ['Como não sabia, ficou quieto', 'Ele sabia e calou', 'Ninguém sabia', 'Ele perguntou'], ans: 0, exp: 'Not + -ing = como não...' }, { q: 'Encurte: "Because she was hungry, she ordered pizza."', ctx: '', opts: ['Feeling hungry, she ordered pizza.', 'Hungry to be, she ordered.', 'Being ordered, pizza hungry.', 'She hungry ordered pizza being.'], ans: 0, exp: 'Particípio no lugar de "because".' }, { q: '"Having been warned, they left early." — eles:', ctx: '', opts: ['Foram avisados antes de sair', 'Avisaram alguém', 'Não sabiam de nada', 'Chegaram tarde'], ans: 0, exp: 'Having been + particípio = passiva anterior.' }] },
    { title: 'Estilo conciso', sub: 'Corte o que não serve', icon: '✂️', done: false, cefr: 'C2', explanation: 'Inglês profissional valoriza concisão: "due to the fact that" → because; "at this point in time" → now; "in the event that" → if. Menos palavras, mais força.', tip: 'Prefira verbos fortes: "make a decision" → decide; "give assistance" → help.', examples: [{ en: 'We cancelled the event because of rain.', pt: 'Cancelamos o evento por causa da chuva.' }, { en: 'Contact me if you need help.', pt: 'Fale comigo se precisar de ajuda.' }, { en: 'The report is ready now.', pt: 'O relatório está pronto agora.' }], q: [{ q: '"Due to the fact that" → versão concisa:', ctx: '', opts: ['because', 'moreover', 'meanwhile', 'although'], ans: 0, exp: 'Corte 5 palavras, use 1.' }, { q: '"At this point in time" →', ctx: '', opts: ['now', 'then', 'sometimes', 'lately'], ans: 0, exp: 'Now.' }, { q: '"Make a decision" → verbo forte:', ctx: '', opts: ['decide', 'do decision', 'take decide', 'choose making'], ans: 0, exp: 'Decide.' }, { q: '"In the event that it rains" →', ctx: '', opts: ['if it rains', 'when raining event', 'because it rains', 'raining if'], ans: 0, exp: 'If.' }, { q: 'Por que cortar palavras inúteis?', ctx: '', opts: ['Clareza e força', 'Parecer robótico', 'Encher página', 'Regra gramatical'], ans: 0, exp: 'Concisão = profissionalismo.' }, { q: '"Give assistance to" →', ctx: '', opts: ['help', 'assist help', 'do assistance', 'make help'], ans: 0, exp: 'Help.' }] },
    { title: 'Trocadilhos e duplo sentido', sub: 'I lost interest...', icon: '🃏', done: false, cefr: 'C2', explanation: 'Humor nativo vive de palavras com dois sentidos: "interest" (interesse/juros), "flies" (voa/moscas). Entender piada é o último nível de fluência.', tip: 'Se um nativo rir de uma frase "normal", procure a segunda leitura de alguma palavra.', examples: [{ en: 'I used to be a banker, but I lost interest.', pt: 'Eu era bancário, mas perdi o interesse.' }, { en: 'Time flies like an arrow.', pt: 'O tempo voa como uma flecha.' }, { en: 'I am reading a book about anti-gravity.', pt: 'Estou lendo um livro sobre antigravidade.' }], q: [{ q: 'A graça de "banker... lost interest":', ctx: '', opts: ['Interest = interesse E juros', 'Banker rima', 'Lost = achou', 'Não tem graça'], ans: 0, exp: 'Duplo sentido de interest.' }, { q: '"...anti-gravity. I can\'t put it down!" — a piada:', ctx: '', opts: ['Put down = largar (e o livro "flutua")', 'O livro é pesado', 'Ele odeia o livro', 'Gravity é nome próprio'], ans: 0, exp: 'Can\'t put it down = não consigo largar + antigravidade.' }, { q: '"Pun" significa:', ctx: '', opts: ['Trocadilho', 'Piada longa', 'Insulto', 'Provérbio'], ans: 0, exp: 'Pun = trocadilho.' }, { q: '"Seven days without water makes one weak." O jogo:', ctx: '', opts: ['weak (fraco) soa como week (semana)', 'Seven rima com heaven', 'Water é incontável', 'Days está errado'], ans: 0, exp: 'Weak/week: homófonas.' }, { q: 'Homófonas são palavras que:', ctx: '', opts: ['Soam igual, sentido diferente', 'Se escrevem igual sempre', 'Vêm do grego', 'São sinônimos'], ans: 0, exp: 'Ex.: weak/week, flour/flower.' }, { q: 'Entender piadas exige:', ctx: '', opts: ['Vocabulário + cultura', 'Só gramática', 'Só pronúncia', 'Tradução literal'], ans: 0, exp: 'O nível mais alto de fluência.' }] },
    { title: 'Ritmo e entonação nativa', sub: 'I wanna go, gotta run...', icon: '🎵', done: false, cefr: 'C2', explanation: 'Inglês é stress-timed: palavras de conteúdo (verbos, substantivos) soam fortes; o resto encolhe. "Want to" vira "wanna", "going to" vira "gonna", "have to" vira "hafta".', tip: 'Na escrita formal, nada de wanna/gonna — isso é só fala.', examples: [{ en: 'I have been waiting for an hour.', pt: 'Estou esperando há uma hora.' }, { en: 'What do you want to do today?', pt: 'O que você quer fazer hoje?' }, { en: 'She should have told me earlier.', pt: 'Ela devia ter me contado antes.' }], q: [{ q: '"Wanna" é a fala rápida de:', ctx: '', opts: ['want to', 'when a', 'one at', 'will not'], ans: 0, exp: 'Want to → wanna.' }, { q: '"Gonna" =', ctx: '', opts: ['going to', 'gone to', 'got no', 'can go'], ans: 0, exp: 'Going to → gonna.' }, { q: 'Em "I SHOULD have TOLD you", soam fortes:', ctx: '', opts: ['should e told', 'I e you', 'have', 'todas iguais'], ans: 0, exp: 'Conteúdo forte, resto encolhe.' }, { q: '"Shoulda" na fala =', ctx: '', opts: ['should have', 'should do', 'shoulder', 'she would'], ans: 0, exp: 'Should have → shoulda.' }, { q: 'Onde NÃO usar gonna/wanna:', ctx: '', opts: ['E-mail formal', 'Conversa com amigos', 'Música', 'Série de TV'], ans: 0, exp: 'Escrita formal pede a forma completa.' }, { q: 'Inglês "stress-timed" significa:', ctx: '', opts: ['O ritmo vem das sílabas fortes', 'Falar estressado', 'Todas as sílabas iguais', 'Falar devagar sempre'], ans: 0, exp: 'Ritmo por acento, não por sílaba.' }] },
    { title: 'Artigos: a, an, the', sub: 'a car, an apple, the sun', icon: '🅰️', done: false, cefr: 'A1', explanation: '"A" antes de som de consoante, "an" antes de som de vogal. "The" quando a coisa é específica ou única.', tip: 'É o SOM que manda: "an hour" (h mudo), "a university" (som de "iu").', examples: [{ en: 'I have a car and an old bike.', pt: 'Tenho um carro e uma bicicleta velha.' }, { en: 'The sun is very hot today.', pt: 'O sol está muito quente hoje.' }, { en: 'She is a doctor in the city.', pt: 'Ela é médica na cidade.' }], q: [{ q: '"_____ apple a day..."', ctx: '', opts: ['An', 'A', 'The', 'Two'], ans: 0, exp: 'Som de vogal → an.' }, { q: '"I saw _____ dog. _____ dog was big."', ctx: '', opts: ['a / The', 'the / A', 'an / An', 'a / A'], ans: 0, exp: '1ª vez: a. Já conhecido: the.' }, { q: '"_____ hour" — qual artigo?', ctx: '', opts: ['an', 'a', 'the always', 'nenhum'], ans: 0, exp: 'O "h" é mudo: som de vogal.' }, { q: 'Coisas únicas (sol, lua) usam:', ctx: '', opts: ['the', 'a', 'an', 'nada'], ans: 0, exp: 'The sun, the moon.' }, { q: '"She is _____ engineer."', ctx: '', opts: ['an', 'a', 'the', '—'], ans: 0, exp: 'Engineer começa com vogal.' }, { q: '"A university" usa "a" porque:', ctx: '', opts: ['O som é de consoante ("iu")', 'É exceção sem regra', 'U é consoante', 'Erro comum aceito'], ans: 0, exp: 'Vale o som: /ju/.' }] },
    { title: 'Plural dos substantivos', sub: 'cat → cats, box → boxes', icon: '👥', done: false, cefr: 'A1', explanation: 'Regra geral: +s. Termina em s, x, ch, sh: +es. Consoante + y: -ies. Irregulares: man→men, child→children, foot→feet.', tip: 'Sem plural: information, money, advice, furniture.', examples: [{ en: 'I have two cats and three dogs.', pt: 'Tenho dois gatos e três cachorros.' }, { en: 'The children are playing outside.', pt: 'As crianças estão brincando lá fora.' }, { en: 'She bought new shoes yesterday.', pt: 'Ela comprou sapatos novos ontem.' }], q: [{ q: 'Plural de "box":', ctx: '', opts: ['boxes', 'boxs', 'boxies', 'box'], ans: 0, exp: 'Termina em x → +es.' }, { q: 'Plural de "child":', ctx: '', opts: ['children', 'childs', 'childes', 'childrens'], ans: 0, exp: 'Irregular: children.' }, { q: 'Plural de "city":', ctx: '', opts: ['cities', 'citys', 'cityes', 'city'], ans: 0, exp: 'Consoante + y → -ies.' }, { q: 'Plural de "man":', ctx: '', opts: ['men', 'mans', 'manes', 'mens'], ans: 0, exp: 'Irregular: men.' }, { q: 'Qual NÃO tem plural?', ctx: '', opts: ['information', 'book', 'car', 'house'], ans: 0, exp: 'Information é incontável.' }, { q: 'Plural de "foot":', ctx: '', opts: ['feet', 'foots', 'footes', 'feets'], ans: 0, exp: 'Foot → feet.' }] },
    { title: 'Present Continuous (agora)', sub: 'I am studying now...', icon: '🏃', done: false, cefr: 'A1', explanation: 'Ação acontecendo AGORA: am/is/are + verbo-ing. "I am studying" = estou estudando (neste momento).', tip: 'Palavras-chave: now, right now, at the moment, currently.', examples: [{ en: 'I am studying English now.', pt: 'Estou estudando inglês agora.' }, { en: 'She is cooking dinner.', pt: 'Ela está fazendo o jantar.' }, { en: 'They are watching a movie.', pt: 'Eles estão assistindo a um filme.' }], q: [{ q: '"Estou trabalhando agora":', ctx: '', opts: ['I am working now.', 'I work now.', 'I working now.', 'I works now.'], ans: 0, exp: 'Am + verbo-ing.' }, { q: '"She _____ sleeping."', ctx: '', opts: ['is', 'are', 'am', 'be'], ans: 0, exp: 'She → is.' }, { q: 'Negativa de "They are playing":', ctx: '', opts: ['They are not playing.', 'They not are playing.', "They don't playing.", 'They no playing.'], ans: 0, exp: 'are + not + -ing.' }, { q: '"What are you doing?" significa:', ctx: '', opts: ['O que você está fazendo?', 'O que você faz da vida?', 'O que você fez?', 'O que você fará?'], ans: 0, exp: 'Ação de agora.' }, { q: '-ing de "run":', ctx: '', opts: ['running', 'runing', 'runnying', 'runs'], ans: 0, exp: 'Dobra o N: running.' }, { q: 'Present Continuous usa-se para:', ctx: '', opts: ['Ação acontecendo agora', 'Hábito de sempre', 'Passado distante', 'Conselho'], ans: 0, exp: 'Agora/neste momento.' }] },
    { title: 'There is / There are', sub: 'There is a cat on the sofa', icon: '📍', done: false, cefr: 'A1', explanation: '"There is" (singular) e "There are" (plural) = há/tem. Negativa: there isn\'t / there aren\'t. Pergunta: Is there...? / Are there...?', tip: 'Não confunda com "have": "There is a problem" ✓, "Have a problem" ✗ (nesse sentido).', examples: [{ en: 'There is a cat on the sofa.', pt: 'Tem um gato no sofá.' }, { en: 'There are two banks near here.', pt: 'Há dois bancos perto daqui.' }, { en: 'Is there a pharmacy nearby?', pt: 'Tem uma farmácia por perto?' }], q: [{ q: '"Tem um problema":', ctx: '', opts: ['There is a problem.', 'There are a problem.', 'Have a problem.', 'It has problem.'], ans: 0, exp: 'Singular → there is.' }, { q: '"_____ many people at the party."', ctx: '', opts: ['There are', 'There is', 'There be', 'There have'], ans: 0, exp: 'Plural → there are.' }, { q: 'Pergunta correta:', ctx: '', opts: ['Is there a bank near here?', 'There is a bank near here?', 'Has a bank near here?', 'There a bank is?'], ans: 0, exp: 'Inverte: Is there...?' }, { q: '"There isn\'t any milk" significa:', ctx: '', opts: ['Não tem leite', 'Tem pouco leite', 'Tem leite', 'O leite venceu'], ans: 0, exp: 'Negativa: não há.' }, { q: 'Erro clássico do brasileiro para "tem":', ctx: '', opts: ['Usar "have" em vez de "there is"', 'Usar "there is"', 'Usar "is"', 'Usar "get"'], ans: 0, exp: '"Have a party today" ✗ → "There is a party".' }, { q: '"There were three cars" fala do:', ctx: '', opts: ['Passado', 'Presente', 'Futuro', 'Agora'], ans: 0, exp: 'Were = passado de are.' }] },
    { title: 'Possessivos (my, your, his...)', sub: 'my book, her car, our house', icon: '🔑', done: false, cefr: 'A1', explanation: 'my, your, his, her, its, our, their + substantivo. Não variam com a coisa possuída: "my books" (não "mys").', tip: 'HIS = dele, HER = dela. O gênero segue o DONO, não a coisa: "her car" = o carro dela.', examples: [{ en: 'This is my English book.', pt: 'Este é meu livro de inglês.' }, { en: 'Her brother lives in Salvador.', pt: 'O irmão dela mora em Salvador.' }, { en: 'Our house has a small garden.', pt: 'Nossa casa tem um jardim pequeno.' }], q: [{ q: '"O carro DELA":', ctx: '', opts: ['her car', 'his car', 'she car', 'hers car'], ans: 0, exp: 'Her = dela.' }, { q: '"_____ name is Pedro." (dele)', ctx: '', opts: ['His', 'Her', 'He', 'Him'], ans: 0, exp: 'His = dele.' }, { q: '"Nosso professor":', ctx: '', opts: ['our teacher', 'us teacher', 'we teacher', 'ours the teacher'], ans: 0, exp: 'Our + substantivo.' }, { q: '"The dog is licking _____ paw."', ctx: '', opts: ['its', "it's", 'his always', 'their'], ans: 0, exp: 'Its = dele (animal/coisa), sem apóstrofo.' }, { q: '"It\'s" (com apóstrofo) =', ctx: '', opts: ['it is', 'possessivo de it', 'plural de it', 'passado de it'], ans: 0, exp: "It's = it is. Its = possessivo." }, { q: '"A casa DELES":', ctx: '', opts: ['their house', 'theirs house', 'them house', 'they house'], ans: 0, exp: 'Their + substantivo.' }] },
    { title: 'As horas em inglês', sub: 'What time is it?', icon: '🕐', done: false, cefr: 'A1', explanation: '"It\'s three o\'clock" (3h em ponto). "Half past three" (3h30). "Quarter past/to" (e 15 / 15 pras). Ou o jeito fácil: "three fifteen", "three thirty".', tip: 'AM = madrugada/manhã. PM = tarde/noite. 7 PM = 19h.', examples: [{ en: 'What time is it?', pt: 'Que horas são?' }, { en: 'It is half past seven.', pt: 'São sete e meia.' }, { en: 'The meeting starts at nine thirty.', pt: 'A reunião começa às nove e meia.' }], q: [{ q: '"Que horas são?":', ctx: '', opts: ['What time is it?', 'How many hours?', 'What hour has?', 'How is the time?'], ans: 0, exp: 'Frase fixa.' }, { q: '"Half past two" =', ctx: '', opts: ['2h30', '2h15', '1h30', '2h45'], ans: 0, exp: 'Half past = e meia.' }, { q: '"Quarter to five" =', ctx: '', opts: ['4h45', '5h15', '5h45', '4h15'], ans: 0, exp: '15 minutos PARA as 5.' }, { q: '"7 PM" é:', ctx: '', opts: ['19h', '7h da manhã', 'meia-noite', '17h'], ans: 0, exp: 'PM = tarde/noite.' }, { q: '"São 10 em ponto":', ctx: '', opts: ["It's ten o'clock.", "It's ten hours.", 'Is ten.', "They're ten."], ans: 0, exp: "It's + hora + o'clock." }, { q: '"At noon" significa:', ctx: '', opts: ['Ao meio-dia', 'À meia-noite', 'De manhã', 'À tarde'], ans: 0, exp: 'Noon = 12h. Midnight = 0h.' }] },
    { title: 'Simple Past: regulares e irregulares', sub: 'worked, went, saw...', icon: '📜', done: false, cefr: 'A2', explanation: 'Passado concluído. Regulares: +ed (worked). Irregulares: mudam tudo (go→went, see→saw, eat→ate). Negativa e pergunta usam DID + verbo base.', tip: 'Depois de "did", o verbo volta pro normal: "Did you go?" (nunca "Did you went?").', examples: [{ en: 'I worked late last night.', pt: 'Trabalhei até tarde ontem à noite.' }, { en: 'She went to the beach yesterday.', pt: 'Ela foi à praia ontem.' }, { en: 'We saw a great movie on Sunday.', pt: 'Vimos um filme ótimo no domingo.' }], q: [{ q: 'Passado de "go":', ctx: '', opts: ['went', 'goed', 'gone', 'goes'], ans: 0, exp: 'Irregular: went.' }, { q: '"Did you _____ the game?"', ctx: '', opts: ['watch', 'watched', 'watching', 'watches'], ans: 0, exp: 'Did + verbo base.' }, { q: '"Eu não fui à festa":', ctx: '', opts: ["I didn't go to the party.", "I didn't went to the party.", 'I no go to the party.', "I don't went."], ans: 0, exp: "Didn't + verbo base." }, { q: 'Passado de "see":', ctx: '', opts: ['saw', 'seed', 'seen', 'sees'], ans: 0, exp: 'See → saw.' }, { q: 'Passado de "study":', ctx: '', opts: ['studied', 'studyed', 'studed', 'study'], ans: 0, exp: 'Consoante + y → -ied.' }, { q: '"Yesterday" pede qual tempo?', ctx: '', opts: ['Simple Past', 'Present Perfect', 'Futuro', 'Present Continuous'], ans: 0, exp: 'Tempo definido no passado → Simple Past.' }] },
    { title: 'Can e Could', sub: 'habilidade e permissão', icon: '💪', done: false, cefr: 'A2', explanation: 'CAN = consigo/posso (presente). COULD = conseguia (passado) OU pedido educado. Negativa: can\'t / couldn\'t.', tip: '"Could you...?" é mais educado que "Can you...?". Em pedidos, could não é passado!', examples: [{ en: 'I can swim very well.', pt: 'Eu sei nadar muito bem.' }, { en: 'Could you help me, please?', pt: 'Você poderia me ajudar, por favor?' }, { en: 'She could read at age four.', pt: 'Ela sabia ler aos quatro anos.' }], q: [{ q: '"Eu sei dirigir":', ctx: '', opts: ['I can drive.', 'I can to drive.', 'I know drive.', 'I can driving.'], ans: 0, exp: 'Can + verbo base (sem to).' }, { q: 'Pedido mais educado:', ctx: '', opts: ['Could you open the window?', 'Open the window!', 'You open window?', 'Can opening the window?'], ans: 0, exp: 'Could = mais gentil.' }, { q: '"When I was young, I _____ run fast."', ctx: '', opts: ['could', 'can', 'canned', 'am able'], ans: 0, exp: 'Passado de can = could.' }, { q: 'Negativa de "She can cook":', ctx: '', opts: ["She can't cook.", "She doesn't can cook.", 'She no can cook.', "She can not to cook."], ans: 0, exp: "Can't = cannot." }, { q: '"Can I use your phone?" pede:', ctx: '', opts: ['Permissão', 'Habilidade', 'Passado', 'Conselho'], ans: 0, exp: 'Can também pede permissão.' }, { q: 'Depois de can/could, o verbo vai:', ctx: '', opts: ['Na forma base, sem "to"', 'Com "to"', 'No gerúndio', 'No passado'], ans: 0, exp: 'Can swim ✓, can to swim ✗.' }] },
    { title: 'Much, Many, A lot of', sub: 'contável ou incontável?', icon: '⚖️', done: false, cefr: 'A2', explanation: 'MANY + contáveis (many books). MUCH + incontáveis (much water). A LOT OF funciona com os dois. Much/many brilham em negativas e perguntas.', tip: 'Na afirmativa do dia a dia, nativo prefere "a lot of": "I have a lot of work".', examples: [{ en: 'How many brothers do you have?', pt: 'Quantos irmãos você tem?' }, { en: 'There is not much time.', pt: 'Não tem muito tempo.' }, { en: 'She has a lot of friends.', pt: 'Ela tem muitos amigos.' }], q: [{ q: '"How _____ money do you need?"', ctx: '', opts: ['much', 'many', 'lot', 'few'], ans: 0, exp: 'Money é incontável → much.' }, { q: '"How _____ people came?"', ctx: '', opts: ['many', 'much', 'a lot', 'little'], ans: 0, exp: 'People é contável → many.' }, { q: '"Muito trabalho" (afirmativa natural):', ctx: '', opts: ['a lot of work', 'many work', 'much works', 'lot work'], ans: 0, exp: 'A lot of + qualquer coisa.' }, { q: 'Qual é incontável?', ctx: '', opts: ['water', 'book', 'car', 'apple'], ans: 0, exp: 'Água não se conta em unidades.' }, { q: '"I don\'t have _____ time."', ctx: '', opts: ['much', 'many', 'a lot', 'few'], ans: 0, exp: 'Time incontável + negativa → much.' }, { q: '"Too many mistakes" =', ctx: '', opts: ['Erros demais', 'Poucos erros', 'Erros pequenos', 'Sem erros'], ans: 0, exp: 'Too many = demais (contável).' }] },
    { title: 'A casa: cômodos e objetos', sub: 'kitchen, bedroom, fridge...', icon: '🏠', done: false, cefr: 'A2', explanation: 'Cômodos: kitchen, bedroom, bathroom, living room. Objetos: fridge (geladeira), stove (fogão), sink (pia), closet (armário), stairs (escada).', tip: '"Do the dishes" = lavar a louça. "Make the bed" = arrumar a cama.', examples: [{ en: 'The kitchen is next to the living room.', pt: 'A cozinha fica ao lado da sala.' }, { en: 'There are two bedrooms upstairs.', pt: 'Há dois quartos no andar de cima.' }, { en: 'The keys are on the kitchen table.', pt: 'As chaves estão na mesa da cozinha.' }], q: [{ q: '"Cozinha" em inglês:', ctx: '', opts: ['Kitchen', 'Chicken', 'Bathroom', 'Bedroom'], ans: 0, exp: 'Kitchen (cuidado com chicken = frango! 😄).' }, { q: '"Geladeira":', ctx: '', opts: ['Fridge', 'Stove', 'Sink', 'Oven'], ans: 0, exp: 'Fridge/refrigerator.' }, { q: '"Living room" é:', ctx: '', opts: ['Sala de estar', 'Quarto', 'Banheiro', 'Varanda'], ans: 0, exp: 'Sala.' }, { q: '"Upstairs" significa:', ctx: '', opts: ['No andar de cima', 'No porão', 'Na garagem', 'No quintal'], ans: 0, exp: 'Up = cima.' }, { q: '"Arrumar a cama":', ctx: '', opts: ['Make the bed', 'Do the bed', 'Clean the bed', 'Fix the bed'], ans: 0, exp: 'Make the bed (fixo).' }, { q: '"Lavar a louça":', ctx: '', opts: ['Do the dishes', 'Make the dishes', 'Wash plates always', 'Clean dish'], ans: 0, exp: 'Do the dishes (fixo).' }] },
    { title: 'Roupas e aparência', sub: 'shirt, dress, try on...', icon: '👕', done: false, cefr: 'A2', explanation: 'Roupas: shirt, T-shirt, dress, pants (calça), skirt, shoes. Verbos: wear (usar/vestir), try on (provar), fit (servir), suit (cair bem).', tip: '"Pants" já é plural: "my pants ARE blue". Tamanhos: S, M, L, XL.', examples: [{ en: 'She is wearing a red dress.', pt: 'Ela está usando um vestido vermelho.' }, { en: 'Can I try on these shoes?', pt: 'Posso provar esses sapatos?' }, { en: 'This shirt fits you perfectly.', pt: 'Essa camisa serviu perfeitamente em você.' }], q: [{ q: '"Calça" em inglês (EUA):', ctx: '', opts: ['Pants', 'Shirt', 'Skirt', 'Socks'], ans: 0, exp: 'Pants (e é plural!).' }, { q: '"Provar uma roupa":', ctx: '', opts: ['Try on', 'Prove', 'Test in', 'Taste'], ans: 0, exp: 'Try on = provar.' }, { q: '"Wear" significa:', ctx: '', opts: ['Usar/vestir', 'Lavar', 'Comprar', 'Dobrar'], ans: 0, exp: 'Wear clothes = vestir.' }, { q: '"It doesn\'t fit" =', ctx: '', opts: ['Não serviu (tamanho)', 'Não gostei', 'É caro', 'É feio'], ans: 0, exp: 'Fit = servir no corpo.' }, { q: '"Meias":', ctx: '', opts: ['Socks', 'Shoes', 'Gloves', 'Boots'], ans: 0, exp: 'Socks = meias.' }, { q: '"That color suits you" =', ctx: '', opts: ['Essa cor cai bem em você', 'Essa cor é cara', 'Vista essa cor', 'Essa cor mancha'], ans: 0, exp: 'Suit = combinar/cair bem.' }] },
    { title: 'Esportes e hobbies', sub: 'play, go, do + atividade', icon: '⚽', done: false, cefr: 'A2', explanation: 'PLAY + jogos com bola/competição (play soccer). GO + atividades em -ing (go swimming). DO + exercícios individuais (do yoga).', tip: 'Play soccer, go running, do karate — decore o trio play/go/do.', examples: [{ en: 'I play soccer on Saturdays.', pt: 'Jogo futebol aos sábados.' }, { en: 'She goes swimming twice a week.', pt: 'Ela nada duas vezes por semana.' }, { en: 'They do yoga in the morning.', pt: 'Eles fazem ioga de manhã.' }], q: [{ q: '"Jogar vôlei":', ctx: '', opts: ['play volleyball', 'do volleyball', 'go volleyball', 'make volleyball'], ans: 0, exp: 'Bola/competição → play.' }, { q: '"_____ swimming"', ctx: '', opts: ['go', 'play', 'do', 'make'], ans: 0, exp: 'Atividade -ing → go.' }, { q: '"Fazer ioga":', ctx: '', opts: ['do yoga', 'play yoga', 'go yoga', 'make yoga'], ans: 0, exp: 'Exercício individual → do.' }, { q: '"Hobby" é:', ctx: '', opts: ['Passatempo', 'Trabalho', 'Esporte radical', 'Dever'], ans: 0, exp: 'O que você faz por prazer.' }, { q: '"I go hiking" significa:', ctx: '', opts: ['Faço trilha', 'Jogo hóquei', 'Corro na rua', 'Ando a cavalo'], ans: 0, exp: 'Hiking = trilha/caminhada.' }, { q: '"Torcer para um time":', ctx: '', opts: ['support a team', 'twist a team', 'push a team', 'force a team'], ans: 0, exp: 'Support = torcer (não "twist"! 😄).' }] },
    { title: 'Present Perfect Continuous', sub: 'I have been studying...', icon: '⏱️', done: false, cefr: 'B1', explanation: 'Ação que começou no passado e CONTINUA (ou acabou de parar): have/has been + verbo-ing. Foco na duração.', tip: 'Com "how long", é o tempo perfeito: "How long have you been waiting?"', examples: [{ en: 'I have been studying English for two years.', pt: 'Estudo inglês há dois anos.' }, { en: 'She has been working here since March.', pt: 'Ela trabalha aqui desde março.' }, { en: 'It has been raining all day.', pt: 'Está chovendo o dia inteiro.' }], q: [{ q: '"Estudo inglês há 3 anos" (e continuo):', ctx: '', opts: ['I have been studying English for three years.', 'I study English three years.', 'I am studying since three years.', 'I studied for three years now.'], ans: 0, exp: 'Duração até agora → have been + -ing.' }, { q: '"How long _____ you been waiting?"', ctx: '', opts: ['have', 'are', 'do', 'did'], ans: 0, exp: 'Have + been + -ing.' }, { q: '"She has been crying" sugere:', ctx: '', opts: ['Os olhos ainda mostram (acabou de chorar)', 'Ela vai chorar', 'Ela nunca chorou', 'Ela chora todo dia'], ans: 0, exp: 'Resultado visível de ação recente.' }, { q: '"_____ been living here since 2019."', ctx: '', opts: ["I've", "I'm", 'I', 'I was'], ans: 0, exp: "I've been living..." }, { q: 'O foco desse tempo é:', ctx: '', opts: ['A duração da ação', 'O resultado final', 'O futuro', 'A ordem dos fatos'], ans: 0, exp: 'Quanto tempo dura/durou.' }, { q: '"For" vs "since":', ctx: '"___ two hours" / "___ 8 AM"', opts: ['for / since', 'since / for', 'for / for', 'since / since'], ans: 0, exp: 'For + duração; since + ponto de início.' }] },
    { title: 'Conselhos: should e had better', sub: 'You should see a doctor', icon: '💡', done: false, cefr: 'B1', explanation: 'SHOULD = deveria (conselho geral). HAD BETTER = é melhor... (aviso mais forte, com consequência implícita). Ambos + verbo base.', tip: '"You\'d better hurry" tem tom de urgência: "é bom você se apressar (senão...)".', examples: [{ en: 'You should see a doctor.', pt: 'Você deveria ir ao médico.' }, { en: 'We had better leave now.', pt: 'É melhor a gente sair agora.' }, { en: 'You should not eat so much sugar.', pt: 'Você não deveria comer tanto açúcar.' }], q: [{ q: '"Você deveria descansar":', ctx: '', opts: ['You should rest.', 'You should to rest.', 'You should resting.', 'You ought rest to.'], ans: 0, exp: 'Should + verbo base.' }, { q: '"Had better" soa:', ctx: '', opts: ['Mais forte/urgente que should', 'Mais fraco que should', 'Igual a can', 'Como passado'], ans: 0, exp: 'Aviso com consequência.' }, { q: '"You\'d better..." — o \'d é:', ctx: '', opts: ['had', 'would', 'did', 'should'], ans: 0, exp: "You'd better = you had better." }, { q: 'Negativa de had better:', ctx: '', opts: ["had better not + verbo", "hadn't better + verbo", "had not better to", "don't had better"], ans: 0, exp: '"You\'d better not be late."' }, { q: 'Pedir conselho:', ctx: '', opts: ['What should I do?', 'What I should do?', 'What do I should?', 'Should what I do?'], ans: 0, exp: 'What should I do?' }, { q: '"You\'d better call your mom" implica:', ctx: '', opts: ['Vai dar problema se não ligar', 'Tanto faz ligar', 'Ela ligou já', 'Proibido ligar'], ans: 0, exp: 'Had better = ou senão...' }] },
    { title: 'Emoções e sentimentos', sub: 'excited, worried, proud...', icon: '💭', done: false, cefr: 'B1', explanation: 'Além de happy/sad: excited (animado), worried (preocupado), proud (orgulhoso), embarrassed (constrangido), jealous (com ciúmes), relieved (aliviado).', tip: 'Pegadinha BR: "embarrassed" = constrangido (NÃO grávida — grávida é pregnant!).', examples: [{ en: 'I am so excited about the trip!', pt: 'Estou muito animado com a viagem!' }, { en: 'She was proud of her daughter.', pt: 'Ela estava orgulhosa da filha.' }, { en: 'He felt embarrassed after the mistake.', pt: 'Ele ficou constrangido depois do erro.' }], q: [{ q: '"Animado/empolgado":', ctx: '', opts: ['excited', 'exciting', 'excite', 'excitement'], ans: 0, exp: 'Pessoa sente: -ed.' }, { q: '"Embarrassed" significa:', ctx: '', opts: ['Constrangido', 'Grávida', 'Abraçado', 'Animado'], ans: 0, exp: 'Falso cognato clássico!' }, { q: '"Preocupado com":', ctx: '', opts: ['worried about', 'worried with', 'worried for', 'worried in'], ans: 0, exp: 'Worried ABOUT.' }, { q: '"Proud of you" =', ctx: '', opts: ['Orgulhoso de você', 'Bravo com você', 'Com pena de você', 'Com saudade'], ans: 0, exp: 'Proud of = orgulho.' }, { q: '"Relieved" é o que você sente quando:', ctx: '', opts: ['O perigo/susto passa', 'Ganha um presente', 'Fica com raiva', 'Sente sono'], ans: 0, exp: 'Alívio.' }, { q: '"Com ciúmes":', ctx: '', opts: ['jealous', 'zealous', 'jelly', 'generous'], ans: 0, exp: 'Jealous = ciumento.' }] },
    { title: 'Inglês de escritório', sub: 'schedule, attach, forward...', icon: '💼', done: false, cefr: 'B1', explanation: 'Rotina de trabalho: schedule a meeting (marcar reunião), attach a file (anexar), forward an email (encaminhar), be in charge of (ser responsável por), day off (folga).', tip: '"ASAP" = as soon as possible (o quanto antes). "FYI" = for your information.', examples: [{ en: 'Please find the report attached.', pt: 'Segue o relatório em anexo.' }, { en: 'Can we schedule a meeting for Monday?', pt: 'Podemos marcar uma reunião pra segunda?' }, { en: 'She is in charge of the project.', pt: 'Ela é a responsável pelo projeto.' }], q: [{ q: '"Marcar uma reunião":', ctx: '', opts: ['schedule a meeting', 'mark a meeting', 'combine a meeting', 'sign a meeting'], ans: 0, exp: 'Schedule (não "mark"!).' }, { q: '"Anexar um arquivo":', ctx: '', opts: ['attach a file', 'annex a file', 'glue a file', 'join a file'], ans: 0, exp: 'Attach.' }, { q: '"ASAP" =', ctx: '', opts: ['O quanto antes', 'Talvez depois', 'Sem pressa', 'Arquivado'], ans: 0, exp: 'As soon as possible.' }, { q: '"Encaminhar um e-mail":', ctx: '', opts: ['forward', 'send back', 'push', 'walk'], ans: 0, exp: 'Forward = encaminhar.' }, { q: '"Day off" é:', ctx: '', opts: ['Folga', 'Demissão', 'Hora extra', 'Feriado nacional'], ans: 0, exp: 'Dia de folga.' }, { q: '"Ser responsável por":', ctx: '', opts: ['be in charge of', 'be the charge', 'take care for', 'respond of'], ans: 0, exp: 'In charge of.' }] },
    { title: 'Mixed Conditionals', sub: 'If I had studied, I would be...', icon: '🧪', done: false, cefr: 'B2', explanation: 'Mistura tempos: passado irreal + resultado no PRESENTE: "If I had studied medicine, I would BE a doctor now." (não teria sido — SERIA, hoje).', tip: 'A palavra "now" no final denuncia o mixed conditional.', examples: [{ en: 'If I had saved money, I would be rich now.', pt: 'Se eu tivesse economizado, estaria rico agora.' }, { en: 'If she had taken the job, she would live in London today.', pt: 'Se ela tivesse aceitado o emprego, moraria em Londres hoje.' }, { en: 'If we had left earlier, we would be home by now.', pt: 'Se tivéssemos saído antes, já estaríamos em casa.' }], q: [{ q: '"If I had studied medicine, I _____ a doctor now."', ctx: '', opts: ['would be', 'would have been', 'will be', 'am'], ans: 0, exp: 'Resultado no presente → would be.' }, { q: 'O mixed conditional mistura:', ctx: '', opts: ['Passado irreal + presente', 'Dois futuros', 'Dois presentes', 'Presente + ordem'], ans: 0, exp: 'Condição no passado, efeito agora.' }, { q: '"If he hadn\'t missed the flight, he _____ here."', ctx: '', opts: ['would be', 'would have be', 'will been', 'is'], ans: 0, exp: 'Ele estaria aqui AGORA.' }, { q: 'Que palavra denuncia o mixed?', ctx: '', opts: ['now', 'yesterday', 'ever', 'yet'], ans: 0, exp: '"...would be X now."' }, { q: '"If I were taller, I would have joined the team." — a condição é:', ctx: '', opts: ['Permanente (ser alto)', 'Passada', 'Futura', 'Impossível de entender'], ans: 0, exp: 'Condição presente/permanente + resultado passado.' }, { q: 'Qual está correta?', ctx: '', opts: ['If I had slept well, I would feel great now.', 'If I sleep well, I would felt great.', 'If I had sleep, I feel great now.', 'If I would sleep, I feel now great.'], ans: 0, exp: 'Had + particípio → would + base + now.' }] },
    { title: 'Meio ambiente e sustentabilidade', sub: 'pollution, renewable, waste...', icon: '🌱', done: false, cefr: 'B2', explanation: 'Tema quente em provas e conversas: pollution (poluição), waste (desperdício/lixo), renewable energy (energia renovável), global warming (aquecimento global), recycle (reciclar).', tip: '"Carbon footprint" = pegada de carbono. "Endangered species" = espécies ameaçadas.', examples: [{ en: 'We need to reduce plastic waste.', pt: 'Precisamos reduzir o lixo plástico.' }, { en: 'Solar power is a renewable energy source.', pt: 'A energia solar é uma fonte renovável.' }, { en: 'Air pollution is getting worse in big cities.', pt: 'A poluição do ar está piorando nas grandes cidades.' }], q: [{ q: '"Poluição":', ctx: '', opts: ['pollution', 'polution', 'poluttion', 'pollutant always'], ans: 0, exp: 'Pollution (2 L, 1 T).' }, { q: '"Renewable" significa:', ctx: '', opts: ['Renovável', 'Reciclado', 'Poluente', 'Descartável'], ans: 0, exp: 'Renew = renovar.' }, { q: '"Waste" pode ser:', ctx: '', opts: ['Desperdício e lixo', 'Só água', 'Só comida', 'Cintura'], ans: 0, exp: 'Waste = desperdício/resíduo (waist = cintura!).' }, { q: '"Aquecimento global":', ctx: '', opts: ['global warming', 'global heating up', 'world hot', 'earth warming up only'], ans: 0, exp: 'Global warming.' }, { q: '"Endangered species" =', ctx: '', opts: ['Espécies ameaçadas', 'Espécies perigosas', 'Espécies novas', 'Espécies extintas'], ans: 0, exp: 'Ameaçadas de extinção (≠ dangerous!).' }, { q: '"Carbon footprint" =', ctx: '', opts: ['Pegada de carbono', 'Pé de carvão', 'Mina de carvão', 'Sapato ecológico'], ans: 0, exp: 'O impacto de CO2 que você gera.' }] },
    { title: 'Phrasal verbs separáveis', sub: 'turn it on vs turn on it', icon: '🧩', done: false, cefr: 'B2', explanation: 'Separáveis aceitam o objeto no meio: "turn the TV on" = "turn on the TV". MAS com pronome, é obrigatório separar: "turn IT on" (nunca "turn on it").', tip: 'Inseparáveis (look after, run into) nunca separam: "look after HER" ✓.', examples: [{ en: 'Can you turn the music down?', pt: 'Pode abaixar a música?' }, { en: 'She picked her kids up at school.', pt: 'Ela pegou os filhos na escola.' }, { en: 'Fill this form out, please.', pt: 'Preencha este formulário, por favor.' }], q: [{ q: 'Com pronome, o correto é:', ctx: '', opts: ['turn it on', 'turn on it', 'turn on him it', 'it turn on'], ans: 0, exp: 'Pronome SEMPRE no meio.' }, { q: '"Pick up the kids" também pode ser:', ctx: '', opts: ['Pick the kids up', 'Pick up they', 'Up pick the kids', 'Pick kids the up'], ans: 0, exp: 'Substantivo pode ir no meio ou depois.' }, { q: '"Fill out" significa:', ctx: '', opts: ['Preencher', 'Esvaziar', 'Desistir', 'Encher o saco'], ans: 0, exp: 'Fill out a form.' }, { q: '"Look after" (inseparável) =', ctx: '', opts: ['Cuidar de', 'Procurar', 'Olhar depois', 'Admirar'], ans: 0, exp: 'Look after the baby = cuidar.' }, { q: 'Qual está ERRADA?', ctx: '', opts: ['Turn on it.', 'Turn it on.', 'Turn on the TV.', 'Turn the TV on.'], ans: 0, exp: 'Pronome depois é proibido.' }, { q: '"Throw it away" =', ctx: '', opts: ['Jogue isso fora', 'Jogue longe', 'Guarde isso', 'Devolva isso'], ans: 0, exp: 'Throw away = descartar.' }] },
    { title: 'The ou nada? Artigos avançados', sub: 'I love Ø music vs the music', icon: '🚫', done: false, cefr: 'B2', explanation: 'Generalizações NÃO levam "the": "I love music" (música em geral). "The music was great" (aquela música específica). Países, refeições e idiomas: sem the (exceto the USA, the UK).', tip: '"Life is beautiful" ✓ (vida em geral). "The life"... só se for uma vida específica.', examples: [{ en: 'I love Brazilian music.', pt: 'Eu amo música brasileira.' }, { en: 'Breakfast is my favorite meal.', pt: 'O café da manhã é minha refeição favorita.' }, { en: 'The coffee you made was perfect.', pt: 'O café que você fez estava perfeito.' }], q: [{ q: '"Eu amo música" (em geral):', ctx: '', opts: ['I love music.', 'I love the music.', 'I love a music.', 'I love musics.'], ans: 0, exp: 'Generalização = sem artigo.' }, { q: '"A vida é curta":', ctx: '', opts: ['Life is short.', 'The life is short.', 'A life is short.', 'Lifes are short.'], ans: 0, exp: 'Life em geral = sem the.' }, { q: 'Qual leva "the"?', ctx: '', opts: ['USA', 'Brazil', 'France', 'Japan'], ans: 0, exp: 'The USA, the UK (siglas/plurais).' }, { q: '"Vou pra cama" (dormir):', ctx: '', opts: ['I am going to bed.', 'I am going to the bed.', 'I go to a bed.', 'I going bed.'], ans: 0, exp: 'Bed como função = sem the.' }, { q: '"Almoçamos ao meio-dia":', ctx: '', opts: ['We have lunch at noon.', 'We have the lunch at noon.', 'We have a lunch at noon.', 'We have lunches noon.'], ans: 0, exp: 'Refeições: sem artigo.' }, { q: 'Quando "the music" está certo?', ctx: '', opts: ['Falando de uma música específica', 'Sempre', 'Nunca', 'Só no plural'], ans: 0, exp: '"The music at the party was great."' }] },
    { title: 'E-mails profissionais', sub: 'I hope this email finds you well', icon: '📧', done: false, cefr: 'C1', explanation: 'Abertura: "I hope this email finds you well." Pedido: "I would appreciate it if...". Anexo: "Please find attached...". Fecho: "Best regards" (neutro), "Kind regards" (cordial).', tip: 'Urgência educada: "At your earliest convenience" = assim que puder.', examples: [{ en: 'I hope this email finds you well.', pt: 'Espero que este e-mail o encontre bem.' }, { en: 'I am writing to follow up on our meeting.', pt: 'Escrevo para dar seguimento à nossa reunião.' }, { en: 'Please let me know if you have any questions.', pt: 'Me avise se tiver qualquer dúvida.' }], q: [{ q: 'Abertura formal clássica:', ctx: '', opts: ['I hope this email finds you well.', 'What is up, friend?', 'Hey, listen!', 'Yo! Quick thing.'], ans: 0, exp: 'Fórmula padrão de cortesia.' }, { q: '"Follow up on" significa:', ctx: '', opts: ['Dar seguimento a', 'Desistir de', 'Seguir no Instagram', 'Arquivar'], ans: 0, exp: 'Retomar um assunto.' }, { q: 'Fecho neutro e seguro:', ctx: '', opts: ['Best regards,', 'Kisses,', 'Bye bye,', 'See ya,'], ans: 0, exp: 'Best regards nunca erra.' }, { q: '"At your earliest convenience" =', ctx: '', opts: ['Assim que lhe for possível', 'Imediatamente, é ordem', 'Quando eu quiser', 'Na loja mais próxima'], ans: 0, exp: 'Urgência com elegância.' }, { q: '"I would appreciate it if you could..." é:', ctx: '', opts: ['Pedido formal educado', 'Reclamação', 'Ordem direta', 'Despedida'], ans: 0, exp: 'Jeito polido de pedir.' }, { q: '"To whom it may concern" usa-se quando:', ctx: '', opts: ['Não se sabe quem vai ler', 'É pro chefe', 'É pra um amigo', 'É spam'], ans: 0, exp: '"A quem possa interessar."' }] },
    { title: 'Understatement britânico', sub: 'not bad = excelente', icon: '🇬🇧', done: false, cefr: 'C1', explanation: 'O britânico minimiza de propósito: "not bad" = muito bom; "a bit disappointing" = péssimo; "quite good" pode ser morno. Entender o que NÃO foi dito é o jogo.', tip: 'Se um britânico diz "interesting..." arrastado, provavelmente ele odiou.', examples: [{ en: 'The food was not bad at all.', pt: 'A comida estava ótima, na real.' }, { en: 'It is a bit cold today, isn\'t it?', pt: 'Está um pouquinho frio hoje, né? (= congelando)' }, { en: 'I was slightly surprised by the news.', pt: 'Fiquei levemente surpreso com a notícia. (= chocado)' }], q: [{ q: '"Not bad!" de um britânico costuma significar:', ctx: '', opts: ['Muito bom', 'Ruim', 'Mediano', 'Péssimo'], ans: 0, exp: 'Understatement: elogio disfarçado.' }, { q: '"A bit disappointing" pode significar:', ctx: '', opts: ['Foi um desastre', 'Levemente chato', 'Quase perfeito', 'Indiferente'], ans: 0, exp: 'Minimizar a crítica = crítica forte.' }, { q: '"It\'s a bit chilly" com -5°C é:', ctx: '', opts: ['Understatement clássico', 'Mentira', 'Erro de inglês', 'Exagero'], ans: 0, exp: 'Frio absurdo dito de leve.' }, { q: 'Understatement serve pra:', ctx: '', opts: ['Suavizar/ironizar com classe', 'Confundir turistas', 'Falar rápido', 'Economizar palavras'], ans: 0, exp: 'Polidez e humor britânicos.' }, { q: '"I know a little about wine" (de um sommelier) é:', ctx: '', opts: ['Modéstia proposital', 'Confissão de ignorância', 'Arrogância', 'Erro'], ans: 0, exp: 'Ele sabe TUDO de vinho.' }, { q: 'O oposto de understatement:', ctx: '', opts: ['Exagero (overstatement)', 'Silêncio', 'Pergunta', 'Formalidade'], ans: 0, exp: 'Minimizar vs inflar.' }] },
    { title: 'Finanças e economia', sub: 'income, loan, interest rate...', icon: '💰', done: false, cefr: 'C1', explanation: 'Vocabulário de dinheiro adulto: income (renda), loan (empréstimo), interest rate (taxa de juros), savings (poupança), debt (dívida), budget (orçamento), invest (investir).', tip: '"Make ends meet" = fechar as contas do mês. "Broke" = duro/sem dinheiro.', examples: [{ en: 'The interest rates went up again.', pt: 'As taxas de juros subiram de novo.' }, { en: 'She took out a loan to buy a house.', pt: 'Ela fez um empréstimo pra comprar uma casa.' }, { en: 'We need to stick to our budget.', pt: 'Precisamos seguir nosso orçamento.' }], q: [{ q: '"Empréstimo":', ctx: '', opts: ['loan', 'lend', 'debt', 'rent'], ans: 0, exp: 'Loan = empréstimo (substantivo).' }, { q: '"Interest rate" =', ctx: '', opts: ['Taxa de juros', 'Nível de interesse', 'Imposto', 'Salário'], ans: 0, exp: 'Interest = juros (em finanças).' }, { q: '"Renda":', ctx: '', opts: ['income', 'outcome', 'salary tax', 'invoice'], ans: 0, exp: 'Income = o que entra.' }, { q: '"I\'m broke" significa:', ctx: '', opts: ['Estou sem dinheiro', 'Estou quebrado (osso)', 'Estou rico', 'Estou devendo o banco'], ans: 0, exp: 'Broke = duro.' }, { q: '"Make ends meet" =', ctx: '', opts: ['Conseguir fechar as contas', 'Fazer reuniões', 'Juntar as pontas do fio', 'Investir na bolsa'], ans: 0, exp: 'Sobreviver com o orçamento.' }, { q: '"Dívida":', ctx: '', opts: ['debt', 'doubt', 'debit only', 'due'], ans: 0, exp: 'Debt (o "b" é mudo: /det/).' }] },
    { title: 'Latinismos: per se, ad hoc...', sub: 'et cetera, vice versa, de facto', icon: '🏛️', done: false, cefr: 'C2', explanation: 'O inglês culto adora latim: per se (por si só), ad hoc (improvisado/para o caso), de facto (na prática), vice versa (o contrário também), status quo (estado atual), per capita (por pessoa).', tip: '"E.g." = por exemplo (exempli gratia). "I.e." = isto é (id est). Não confunda!', examples: [{ en: 'The idea is not bad per se.', pt: 'A ideia não é ruim por si só.' }, { en: 'They formed an ad hoc committee.', pt: 'Formaram um comitê improvisado pro caso.' }, { en: 'He is the de facto leader of the group.', pt: 'Ele é o líder do grupo na prática.' }], q: [{ q: '"Per se" significa:', ctx: '', opts: ['Por si só', 'Para sempre', 'Por acaso', 'Pelo visto'], ans: 0, exp: 'Em si mesmo.' }, { q: '"E.g." introduz:', ctx: '', opts: ['Um exemplo', 'Uma definição', 'Uma conclusão', 'Uma citação'], ans: 0, exp: 'E.g. = por exemplo.' }, { q: '"I.e." significa:', ctx: '', opts: ['Isto é / ou seja', 'Por exemplo', 'Entre outros', 'Ao contrário'], ans: 0, exp: 'I.e. = id est = isto é.' }, { q: '"Status quo" =', ctx: '', opts: ['O estado atual das coisas', 'Status social', 'Uma banda', 'Processo judicial'], ans: 0, exp: 'Como as coisas estão.' }, { q: '"Vice versa" =', ctx: '', opts: ['E o contrário também', 'Vice-presidente', 'Verso de poema', 'Duas vezes'], ans: 0, exp: 'A recíproca é verdadeira.' }, { q: '"De facto leader" é o líder:', ctx: '', opts: ['Na prática (mesmo sem título)', 'Eleito oficialmente', 'Demitido', 'Substituto'], ans: 0, exp: 'De facto = de fato, na prática.' }] },
    { title: 'Inglês literário: narrando histórias', sub: 'Once upon a time...', icon: '📖', done: false, cefr: 'C2', explanation: 'Narrativa rica: once upon a time (era uma vez), all of a sudden (de repente), little did she know (mal sabia ela), as fate would have it (o destino quis que), happily ever after (felizes para sempre).', tip: '"Little did she know..." inverte o verbo — e cria suspense instantâneo.', examples: [{ en: 'Little did she know her life was about to change.', pt: 'Mal sabia ela que sua vida estava prestes a mudar.' }, { en: 'All of a sudden, the lights went out.', pt: 'De repente, as luzes se apagaram.' }, { en: 'As fate would have it, they met again.', pt: 'O destino quis que eles se encontrassem de novo.' }], q: [{ q: '"Era uma vez":', ctx: '', opts: ['Once upon a time', 'One time ago', 'Once a time', 'Upon one time'], ans: 0, exp: 'Abertura clássica de conto.' }, { q: '"Little did she know" cria:', ctx: '', opts: ['Suspense (algo vem aí)', 'Final feliz', 'Confusão gramatical', 'Diálogo'], ans: 0, exp: 'O leitor sabe mais que a personagem.' }, { q: '"All of a sudden" =', ctx: '', opts: ['De repente', 'Aos poucos', 'Finalmente', 'No começo'], ans: 0, exp: 'Suddenly, com mais drama.' }, { q: '"Happily ever after" fecha:', ctx: '', opts: ['Contos de fadas', 'Relatórios', 'E-mails', 'Notícias'], ans: 0, exp: '"...felizes para sempre."' }, { q: '"As fate would have it" atribui o evento:', ctx: '', opts: ['Ao destino', 'À sorte ruim', 'Ao esforço', 'Ao acaso científico'], ans: 0, exp: 'O destino quis assim.' }, { q: '"Plot twist" é:', ctx: '', opts: ['Virada inesperada na história', 'Erro de roteiro', 'Final previsível', 'Personagem novo'], ans: 0, exp: 'A reviravolta.' }] },
  ]
}

const vocab = [
  { en: 'Hello', pt: 'Olá', ex: 'Hello, how are you?', cat: 'basic' },
  { en: 'Thank you', pt: 'Obrigado(a)', ex: 'Thank you very much!', cat: 'basic' },
  { en: 'Please', pt: 'Por favor', ex: 'Can you help me, please?', cat: 'basic' },
  { en: 'Sorry', pt: 'Desculpe', ex: "Sorry, I don't understand.", cat: 'basic' },
  { en: 'Excuse me', pt: 'Com licença', ex: 'Excuse me, where is the bathroom?', cat: 'basic' },
  { en: 'Yes / No', pt: 'Sim / Não', ex: 'Yes, I understand. No, I do not.', cat: 'basic' },
  { en: 'Good morning', pt: 'Bom dia', ex: 'Good morning, everyone!', cat: 'basic' },
  { en: 'Good night', pt: 'Boa noite', ex: 'Good night, sleep well.', cat: 'basic' },
  { en: 'How are you?', pt: 'Como vai?', ex: 'Hi! How are you?', cat: 'basic' },
  { en: 'Nice to meet you', pt: 'Prazer em conhecer', ex: 'Nice to meet you, John.', cat: 'basic' },
  { en: 'Goodbye', pt: 'Adeus / Tchau', ex: 'Goodbye, see you soon.', cat: 'basic' },
  { en: 'See you later', pt: 'Até mais', ex: 'See you later, take care.', cat: 'basic' },
  { en: 'Welcome', pt: 'Bem-vindo(a)', ex: 'Welcome to our home!', cat: 'basic' },
  { en: 'Of course', pt: 'Claro', ex: 'Of course, I can help.', cat: 'basic' },
  { en: 'No problem', pt: 'Sem problema', ex: 'No problem, you are welcome.', cat: 'basic' },
  { en: "You're welcome", pt: 'De nada', ex: "You're welcome, anytime.", cat: 'basic' },
  { en: 'Airport', pt: 'Aeroporto', ex: 'Where is the airport?', cat: 'travel' },
  { en: 'Hotel', pt: 'Hotel', ex: 'I need a hotel room.', cat: 'travel' },
  { en: 'Passport', pt: 'Passaporte', ex: 'Show me your passport.', cat: 'travel' },
  { en: 'Breakfast', pt: 'Café da manhã', ex: 'Breakfast is included.', cat: 'travel' },
  { en: 'Ticket', pt: 'Passagem / Ingresso', ex: 'I need two tickets, please.', cat: 'travel' },
  { en: 'Map', pt: 'Mapa', ex: 'Can I have a map of the city?', cat: 'travel' },
  { en: 'Flight', pt: 'Voo', ex: 'My flight is delayed.', cat: 'travel' },
  { en: 'Luggage', pt: 'Bagagem', ex: 'Where is my luggage?', cat: 'travel' },
  { en: 'Boarding pass', pt: 'Cartão de embarque', ex: 'Here is my boarding pass.', cat: 'travel' },
  { en: 'Gate', pt: 'Portão de embarque', ex: 'The gate is number 12.', cat: 'travel' },
  { en: 'Taxi', pt: 'Táxi', ex: 'I need a taxi to the hotel.', cat: 'travel' },
  { en: 'Train', pt: 'Trem', ex: 'The train leaves at noon.', cat: 'travel' },
  { en: 'Station', pt: 'Estação', ex: 'Where is the train station?', cat: 'travel' },
  { en: 'Reservation', pt: 'Reserva', ex: 'I have a reservation.', cat: 'travel' },
  { en: 'Tourist', pt: 'Turista', ex: 'I am a tourist here.', cat: 'travel' },
  { en: 'Suitcase', pt: 'Mala', ex: 'My suitcase is heavy.', cat: 'travel' },
  { en: 'Meeting', pt: 'Reunião', ex: 'We have a meeting at 3pm.', cat: 'work' },
  { en: 'Deadline', pt: 'Prazo final', ex: 'The deadline is Friday.', cat: 'work' },
  { en: 'Report', pt: 'Relatório', ex: 'Send me the report.', cat: 'work' },
  { en: 'Schedule', pt: 'Agenda / Horário', ex: 'Check your schedule.', cat: 'work' },
  { en: 'Presentation', pt: 'Apresentação', ex: 'I will give a presentation.', cat: 'work' },
  { en: 'Contract', pt: 'Contrato', ex: 'Please sign the contract.', cat: 'work' },
  { en: 'Office', pt: 'Escritório', ex: 'I work at the office.', cat: 'work' },
  { en: 'Boss', pt: 'Chefe', ex: 'My boss is in a meeting.', cat: 'work' },
  { en: 'Colleague', pt: 'Colega de trabalho', ex: 'She is my colleague.', cat: 'work' },
  { en: 'Salary', pt: 'Salário', ex: 'I got a higher salary.', cat: 'work' },
  { en: 'Project', pt: 'Projeto', ex: 'The project is done.', cat: 'work' },
  { en: 'Email', pt: 'E-mail', ex: 'I sent you an email.', cat: 'work' },
  { en: 'Customer', pt: 'Cliente', ex: 'The customer is happy.', cat: 'work' },
  { en: 'Team', pt: 'Equipe', ex: 'We are a great team.', cat: 'work' },
  { en: 'Task', pt: 'Tarefa', ex: 'I finished the task.', cat: 'work' },
  { en: 'Interview', pt: 'Entrevista', ex: 'I have a job interview.', cat: 'work' },
  { en: 'Water', pt: 'Água', ex: "Can I have some water?", cat: 'food' },
  { en: 'Coffee', pt: 'Café', ex: "I drink coffee every morning.", cat: 'food' },
  { en: 'Bread', pt: 'Pão', ex: "I would like some bread.", cat: 'food' },
  { en: 'Meat', pt: 'Carne', ex: "I do not eat meat.", cat: 'food' },
  { en: 'Fruit', pt: 'Fruta', ex: "Fruit is good for you.", cat: 'food' },
  { en: 'Rice', pt: 'Arroz', ex: "We eat rice and beans.", cat: 'food' },
  { en: 'Chicken', pt: 'Frango', ex: "The chicken is delicious.", cat: 'food' },
  { en: 'Cheese', pt: 'Queijo', ex: "I love cheese on bread.", cat: 'food' },
  { en: 'Vegetable', pt: 'Legume / Verdura', ex: "Eat your vegetables.", cat: 'food' },
  { en: 'Dessert', pt: 'Sobremesa', ex: "What is for dessert?", cat: 'food' },
  { en: 'Lunch', pt: 'Almoço', ex: 'Let us have lunch.', cat: 'food' },
  { en: 'Dinner', pt: 'Jantar', ex: 'Dinner is ready.', cat: 'food' },
  { en: 'Menu', pt: 'Cardápio', ex: 'Can I see the menu?', cat: 'food' },
  { en: 'Sugar', pt: 'Açúcar', ex: 'No sugar in my coffee.', cat: 'food' },
  { en: 'Salt', pt: 'Sal', ex: 'Pass the salt, please.', cat: 'food' },
  { en: 'Egg', pt: 'Ovo', ex: 'I want two eggs.', cat: 'food' },
  { en: 'House', pt: 'Casa', ex: "This is my house.", cat: 'home' },
  { en: 'Kitchen', pt: 'Cozinha', ex: "She is in the kitchen.", cat: 'home' },
  { en: 'Bedroom', pt: 'Quarto', ex: "My bedroom is upstairs.", cat: 'home' },
  { en: 'Bathroom', pt: 'Banheiro', ex: "Where is the bathroom?", cat: 'home' },
  { en: 'Door', pt: 'Porta', ex: "Please close the door.", cat: 'home' },
  { en: 'Window', pt: 'Janela', ex: "Open the window, please.", cat: 'home' },
  { en: 'Table', pt: 'Mesa', ex: "The food is on the table.", cat: 'home' },
  { en: 'Chair', pt: 'Cadeira', ex: "Have a seat on the chair.", cat: 'home' },
  { en: 'Bed', pt: 'Cama', ex: "I go to bed at ten.", cat: 'home' },
  { en: 'Key', pt: 'Chave', ex: "I lost my keys.", cat: 'home' },
  { en: 'Floor', pt: 'Chão / Andar', ex: 'The keys are on the floor.', cat: 'home' },
  { en: 'Wall', pt: 'Parede', ex: 'There is a picture on the wall.', cat: 'home' },
  { en: 'Light', pt: 'Luz', ex: 'Turn on the light.', cat: 'home' },
  { en: 'Sofa', pt: 'Sofá', ex: 'Sit on the sofa.', cat: 'home' },
  { en: 'Garden', pt: 'Jardim', ex: 'We have a small garden.', cat: 'home' },
  { en: 'Roof', pt: 'Telhado', ex: 'The roof is red.', cat: 'home' },
  { en: 'To go', pt: 'Ir', ex: "I want to go home.", cat: 'verbs' },
  { en: 'To eat', pt: 'Comer', ex: "Let us eat together.", cat: 'verbs' },
  { en: 'To sleep', pt: 'Dormir', ex: "I need to sleep now.", cat: 'verbs' },
  { en: 'To buy', pt: 'Comprar', ex: "I want to buy a gift.", cat: 'verbs' },
  { en: 'To speak', pt: 'Falar', ex: "I speak a little English.", cat: 'verbs' },
  { en: 'To understand', pt: 'Entender', ex: "I do not understand.", cat: 'verbs' },
  { en: 'To need', pt: 'Precisar', ex: "I need your help.", cat: 'verbs' },
  { en: 'To want', pt: 'Querer', ex: "What do you want?", cat: 'verbs' },
  { en: 'To make', pt: 'Fazer', ex: "I will make dinner.", cat: 'verbs' },
  { en: 'To find', pt: 'Encontrar', ex: "I cannot find my phone.", cat: 'verbs' },
  { en: 'To help', pt: 'Ajudar', ex: "Can you help me?", cat: 'verbs' },
  { en: 'To learn', pt: 'Aprender', ex: "I want to learn English.", cat: 'verbs' },
  { en: 'To work', pt: 'Trabalhar', ex: "I work every day.", cat: 'verbs' },
  { en: 'To live', pt: 'Morar / Viver', ex: "I live in Brazil.", cat: 'verbs' },
  { en: 'To give', pt: 'Dar', ex: "Give me a minute.", cat: 'verbs' },
  { en: 'To know', pt: 'Saber / Conhecer', ex: "I know the answer.", cat: 'verbs' },
  { en: 'Happy', pt: 'Feliz', ex: "I am very happy today.", cat: 'feelings' },
  { en: 'Sad', pt: 'Triste', ex: "Why are you sad?", cat: 'feelings' },
  { en: 'Tired', pt: 'Cansado(a)', ex: "I am so tired.", cat: 'feelings' },
  { en: 'Angry', pt: 'Bravo(a)', ex: "Do not be angry.", cat: 'feelings' },
  { en: 'Worried', pt: 'Preocupado(a)', ex: "She is worried about the test.", cat: 'feelings' },
  { en: 'Excited', pt: 'Animado(a)', ex: "I am excited for the trip.", cat: 'feelings' },
  { en: 'Bored', pt: 'Entediado(a)', ex: "The kids are bored.", cat: 'feelings' },
  { en: 'Scared', pt: 'Com medo', ex: "Do not be scared.", cat: 'feelings' },
  { en: 'Nervous', pt: 'Nervoso(a)', ex: "I am nervous about the exam.", cat: 'feelings' },
  { en: 'Calm', pt: 'Calmo(a)', ex: "Stay calm, please.", cat: 'feelings' },
  { en: 'Surprised', pt: 'Surpreso(a)', ex: "She was surprised.", cat: 'feelings' },
  { en: 'Confused', pt: 'Confuso(a)', ex: "I am a little confused.", cat: 'feelings' },
  { en: 'Proud', pt: 'Orgulhoso(a)', ex: "I am proud of you.", cat: 'feelings' },
  { en: 'Lonely', pt: 'Solitário(a)', ex: "He feels lonely.", cat: 'feelings' },
  { en: 'Grateful', pt: 'Grato(a)', ex: "I am grateful for your help.", cat: 'feelings' },
  { en: 'Confident', pt: 'Confiante', ex: "She is very confident.", cat: 'feelings' },
  { en: 'Today', pt: 'Hoje', ex: "What are you doing today?", cat: 'daily' },
  { en: 'Tomorrow', pt: 'Amanhã', ex: "See you tomorrow.", cat: 'daily' },
  { en: 'Yesterday', pt: 'Ontem', ex: "I saw him yesterday.", cat: 'daily' },
  { en: 'Now', pt: 'Agora', ex: "We have to go now.", cat: 'daily' },
  { en: 'Always', pt: 'Sempre', ex: "She is always late.", cat: 'daily' },
  { en: 'Never', pt: 'Nunca', ex: "I never give up.", cat: 'daily' },
  { en: 'Sometimes', pt: 'Às vezes', ex: "Sometimes I cook.", cat: 'daily' },
  { en: 'Early', pt: 'Cedo', ex: "I wake up early.", cat: 'daily' },
  { en: 'Late', pt: 'Tarde / Atrasado', ex: "Do not be late.", cat: 'daily' },
  { en: 'Soon', pt: 'Em breve', ex: "I will call you soon.", cat: 'daily' },
  { en: 'Morning', pt: 'Manhã', ex: "I run in the morning.", cat: 'daily' },
  { en: 'Afternoon', pt: 'Tarde', ex: "See you this afternoon.", cat: 'daily' },
  { en: 'Evening', pt: 'Fim de tarde / Noite', ex: "Good evening!", cat: 'daily' },
  { en: 'Week', pt: 'Semana', ex: "I work five days a week.", cat: 'daily' },
  { en: 'Weekend', pt: 'Fim de semana', ex: "Have a nice weekend!", cat: 'daily' },
  { en: 'Every day', pt: 'Todo dia', ex: "I study every day.", cat: 'daily' },
  { en: 'Doctor', pt: 'Médico(a)', ex: "I need to see a doctor.", cat: 'health' },
  { en: 'Hospital', pt: 'Hospital', ex: "Take me to the hospital.", cat: 'health' },
  { en: 'Medicine', pt: 'Remédio', ex: "Take this medicine.", cat: 'health' },
  { en: 'Pain', pt: 'Dor', ex: "I have a pain in my back.", cat: 'health' },
  { en: 'Fever', pt: 'Febre', ex: "She has a fever.", cat: 'health' },
  { en: 'Headache', pt: 'Dor de cabeça', ex: "I have a headache.", cat: 'health' },
  { en: 'Sick', pt: 'Doente', ex: "I feel sick today.", cat: 'health' },
  { en: 'Pharmacy', pt: 'Farmácia', ex: "Where is the pharmacy?", cat: 'health' },
  { en: 'Nurse', pt: 'Enfermeiro(a)', ex: "The nurse will help you.", cat: 'health' },
  { en: 'Health', pt: 'Saúde', ex: "Your health is important.", cat: 'health' },
  { en: 'Appointment', pt: 'Consulta', ex: "I have a doctor appointment.", cat: 'health' },
  { en: 'Emergency', pt: 'Emergência', ex: "This is an emergency!", cat: 'health' },
  { en: 'Computer', pt: 'Computador', ex: "My computer is slow.", cat: 'tech' },
  { en: 'Phone', pt: 'Telefone / Celular', ex: "My phone is dead.", cat: 'tech' },
  { en: 'Internet', pt: 'Internet', ex: "The internet is down.", cat: 'tech' },
  { en: 'Password', pt: 'Senha', ex: "I forgot my password.", cat: 'tech' },
  { en: 'Screen', pt: 'Tela', ex: "The screen is broken.", cat: 'tech' },
  { en: 'File', pt: 'Arquivo', ex: "Send me the file.", cat: 'tech' },
  { en: 'App', pt: 'Aplicativo', ex: "Download the app.", cat: 'tech' },
  { en: 'Battery', pt: 'Bateria', ex: "My battery is low.", cat: 'tech' },
  { en: 'Charger', pt: 'Carregador', ex: "Do you have a charger?", cat: 'tech' },
  { en: 'Wi-Fi', pt: 'Wi-Fi', ex: "What is the Wi-Fi password?", cat: 'tech' },
  { en: 'Message', pt: 'Mensagem', ex: "I got your message.", cat: 'tech' },
  { en: 'Website', pt: 'Site', ex: "Visit our website.", cat: 'tech' },
  { en: 'Money', pt: 'Dinheiro', ex: "I do not have money.", cat: 'shopping' },
  { en: 'Price', pt: 'Preço', ex: "What is the price?", cat: 'shopping' },
  { en: 'Cheap', pt: 'Barato', ex: "This shirt is cheap.", cat: 'shopping' },
  { en: 'Expensive', pt: 'Caro', ex: "That is too expensive.", cat: 'shopping' },
  { en: 'Store', pt: 'Loja', ex: "The store is open.", cat: 'shopping' },
  { en: 'Cash', pt: 'Dinheiro (em espécie)', ex: "I will pay in cash.", cat: 'shopping' },
  { en: 'Credit card', pt: 'Cartão de crédito', ex: "Can I use a credit card?", cat: 'shopping' },
  { en: 'Discount', pt: 'Desconto', ex: "Is there a discount?", cat: 'shopping' },
  { en: 'Receipt', pt: 'Recibo / Nota', ex: "Can I have the receipt?", cat: 'shopping' },
  { en: 'Size', pt: 'Tamanho', ex: "Do you have my size?", cat: 'shopping' },
  { en: 'Change', pt: 'Troco', ex: "Here is your change.", cat: 'shopping' },
  { en: 'Sale', pt: 'Promoção', ex: "The shoes are on sale.", cat: 'shopping' },
  { en: 'Weather', pt: 'Tempo / Clima', ex: "How is the weather?", cat: 'weather' },
  { en: 'Sun', pt: 'Sol', ex: "The sun is shining.", cat: 'weather' },
  { en: 'Rain', pt: 'Chuva', ex: "I do not like the rain.", cat: 'weather' },
  { en: 'Wind', pt: 'Vento', ex: "The wind is strong.", cat: 'weather' },
  { en: 'Snow', pt: 'Neve', ex: "I have never seen snow.", cat: 'weather' },
  { en: 'Hot', pt: 'Quente', ex: "It is very hot today.", cat: 'weather' },
  { en: 'Cold', pt: 'Frio', ex: "It is cold outside.", cat: 'weather' },
  { en: 'Cloud', pt: 'Nuvem', ex: "There are many clouds.", cat: 'weather' },
  { en: 'Storm', pt: 'Tempestade', ex: "A storm is coming.", cat: 'weather' },
  { en: 'Warm', pt: 'Morno / Ameno', ex: "The water is warm.", cat: 'weather' },
  { en: 'Temperature', pt: 'Temperatura', ex: "What is the temperature?", cat: 'weather' },
  { en: 'Umbrella', pt: 'Guarda-chuva', ex: "Take an umbrella.", cat: 'weather' },
  { en: 'Maybe', pt: 'Talvez', ex: 'Maybe tomorrow.', cat: 'basic' },
  { en: 'Here', pt: 'Aqui', ex: 'Come here, please.', cat: 'basic' },
  { en: 'There', pt: 'Lá / Ali', ex: 'It is over there.', cat: 'basic' },
  { en: 'This', pt: 'Este / Isto', ex: 'I like this.', cat: 'basic' },
  { en: 'That', pt: 'Aquele / Isso', ex: 'What is that?', cat: 'basic' },
  { en: 'Who', pt: 'Quem', ex: 'Who is she?', cat: 'basic' },
  { en: 'What', pt: 'O que / Qual', ex: 'What is this?', cat: 'basic' },
  { en: 'Where', pt: 'Onde', ex: 'Where are you?', cat: 'basic' },
  { en: 'When', pt: 'Quando', ex: 'When is the party?', cat: 'basic' },
  { en: 'Why', pt: 'Por quê', ex: 'Why not?', cat: 'basic' },
  { en: 'How', pt: 'Como', ex: 'How does it work?', cat: 'basic' },
  { en: 'Because', pt: 'Porque', ex: 'Because I like it.', cat: 'basic' },
  { en: 'Beach', pt: 'Praia', ex: 'We went to the beach.', cat: 'travel' },
  { en: 'Trip', pt: 'Viagem', ex: 'Have a nice trip!', cat: 'travel' },
  { en: 'Tour', pt: 'Passeio / Tour', ex: 'We booked a city tour.', cat: 'travel' },
  { en: 'Guide', pt: 'Guia', ex: 'The guide was friendly.', cat: 'travel' },
  { en: 'Currency', pt: 'Moeda (do país)', ex: 'What is the local currency?', cat: 'travel' },
  { en: 'Border', pt: 'Fronteira', ex: 'We crossed the border.', cat: 'travel' },
  { en: 'Visa', pt: 'Visto', ex: 'I need a tourist visa.', cat: 'travel' },
  { en: 'Backpack', pt: 'Mochila', ex: 'My backpack is heavy.', cat: 'travel' },
  { en: 'Departure', pt: 'Partida / Embarque', ex: 'Departure is at noon.', cat: 'travel' },
  { en: 'Arrival', pt: 'Chegada', ex: 'Check the arrival time.', cat: 'travel' },
  { en: 'Delay', pt: 'Atraso', ex: 'There is a long delay.', cat: 'travel' },
  { en: 'Souvenir', pt: 'Lembrança', ex: 'I bought a souvenir.', cat: 'travel' },
  { en: 'Job', pt: 'Emprego', ex: 'I love my job.', cat: 'work' },
  { en: 'Career', pt: 'Carreira', ex: 'She has a great career.', cat: 'work' },
  { en: 'Manager', pt: 'Gerente', ex: 'Ask the manager.', cat: 'work' },
  { en: 'Goal', pt: 'Meta / Objetivo', ex: 'We reached our goal.', cat: 'work' },
  { en: 'Budget', pt: 'Orçamento', ex: 'The budget is tight.', cat: 'work' },
  { en: 'Invoice', pt: 'Fatura', ex: 'Send the invoice today.', cat: 'work' },
  { en: 'Resume', pt: 'Currículo', ex: 'Update your resume.', cat: 'work' },
  { en: 'Skill', pt: 'Habilidade', ex: 'Communication is a key skill.', cat: 'work' },
  { en: 'Promotion', pt: 'Promoção (cargo)', ex: 'She got a promotion.', cat: 'work' },
  { en: 'Staff', pt: 'Equipe / Funcionários', ex: 'The staff is helpful.', cat: 'work' },
  { en: 'Workload', pt: 'Carga de trabalho', ex: 'My workload is heavy.', cat: 'work' },
  { en: 'Feedback', pt: 'Retorno / Feedback', ex: 'Thanks for the feedback.', cat: 'work' },
  { en: 'Soup', pt: 'Sopa', ex: 'The soup is hot.', cat: 'food' },
  { en: 'Salad', pt: 'Salada', ex: 'I want a green salad.', cat: 'food' },
  { en: 'Fish', pt: 'Peixe', ex: 'I like grilled fish.', cat: 'food' },
  { en: 'Apple', pt: 'Maçã', ex: 'An apple a day.', cat: 'food' },
  { en: 'Banana', pt: 'Banana', ex: 'I eat a banana every day.', cat: 'food' },
  { en: 'Milk', pt: 'Leite', ex: 'A glass of milk.', cat: 'food' },
  { en: 'Juice', pt: 'Suco', ex: 'Orange juice, please.', cat: 'food' },
  { en: 'Butter', pt: 'Manteiga', ex: 'Bread with butter.', cat: 'food' },
  { en: 'Pepper', pt: 'Pimenta', ex: 'Add some pepper.', cat: 'food' },
  { en: 'Spicy', pt: 'Apimentado', ex: 'This food is spicy.', cat: 'food' },
  { en: 'Sweet', pt: 'Doce', ex: 'The cake is too sweet.', cat: 'food' },
  { en: 'Snack', pt: 'Lanche', ex: "Let's have a snack.", cat: 'food' },
  { en: 'Garage', pt: 'Garagem', ex: 'The car is in the garage.', cat: 'home' },
  { en: 'Stairs', pt: 'Escada', ex: 'Use the stairs.', cat: 'home' },
  { en: 'Mirror', pt: 'Espelho', ex: 'Look in the mirror.', cat: 'home' },
  { en: 'Towel', pt: 'Toalha', ex: 'I need a clean towel.', cat: 'home' },
  { en: 'Pillow', pt: 'Travesseiro', ex: 'This pillow is soft.', cat: 'home' },
  { en: 'Blanket', pt: 'Cobertor', ex: 'I need a warm blanket.', cat: 'home' },
  { en: 'Fridge', pt: 'Geladeira', ex: 'Put it in the fridge.', cat: 'home' },
  { en: 'Stove', pt: 'Fogão', ex: 'The stove is hot.', cat: 'home' },
  { en: 'Sink', pt: 'Pia', ex: 'The dishes are in the sink.', cat: 'home' },
  { en: 'Closet', pt: 'Armário / Closet', ex: 'My clothes are in the closet.', cat: 'home' },
  { en: 'Lamp', pt: 'Luminária', ex: 'Turn on the lamp.', cat: 'home' },
  { en: 'Curtain', pt: 'Cortina', ex: 'Open the curtains.', cat: 'home' },
  { en: 'To come', pt: 'Vir', ex: 'Come with me.', cat: 'verbs' },
  { en: 'To see', pt: 'Ver', ex: 'I can see you.', cat: 'verbs' },
  { en: 'To say', pt: 'Dizer', ex: 'What did you say?', cat: 'verbs' },
  { en: 'To think', pt: 'Pensar / Achar', ex: 'I think so.', cat: 'verbs' },
  { en: 'To feel', pt: 'Sentir', ex: 'I feel great.', cat: 'verbs' },
  { en: 'To put', pt: 'Colocar', ex: 'Put it on the table.', cat: 'verbs' },
  { en: 'To take', pt: 'Pegar / Levar', ex: 'Take this with you.', cat: 'verbs' },
  { en: 'To bring', pt: 'Trazer', ex: 'Bring your books.', cat: 'verbs' },
  { en: 'To start', pt: 'Começar', ex: "Let's start now.", cat: 'verbs' },
  { en: 'To stop', pt: 'Parar', ex: 'Please stop.', cat: 'verbs' },
  { en: 'To open', pt: 'Abrir', ex: 'Open the door.', cat: 'verbs' },
  { en: 'To close', pt: 'Fechar', ex: 'Close the window.', cat: 'verbs' },
  { en: 'Glad', pt: 'Contente', ex: 'I am glad to see you.', cat: 'feelings' },
  { en: 'Afraid', pt: 'Com medo', ex: 'I am afraid of dogs.', cat: 'feelings' },
  { en: 'Jealous', pt: 'Com ciúmes', ex: 'He is a little jealous.', cat: 'feelings' },
  { en: 'Embarrassed', pt: 'Envergonhado(a)', ex: 'I felt embarrassed.', cat: 'feelings' },
  { en: 'Relaxed', pt: 'Relaxado(a)', ex: 'I feel relaxed now.', cat: 'feelings' },
  { en: 'Stressed', pt: 'Estressado(a)', ex: 'I am stressed at work.', cat: 'feelings' },
  { en: 'Hopeful', pt: 'Esperançoso(a)', ex: 'I am hopeful about it.', cat: 'feelings' },
  { en: 'Disappointed', pt: 'Decepcionado(a)', ex: 'She was disappointed.', cat: 'feelings' },
  { en: 'Curious', pt: 'Curioso(a)', ex: 'I am curious about it.', cat: 'feelings' },
  { en: 'Comfortable', pt: 'Confortável', ex: 'I feel comfortable here.', cat: 'feelings' },
  { en: 'Anxious', pt: 'Ansioso(a)', ex: 'I feel a bit anxious.', cat: 'feelings' },
  { en: 'Thankful', pt: 'Agradecido(a)', ex: 'I am thankful for you.', cat: 'feelings' },
  { en: 'Hour', pt: 'Hora', ex: 'I waited an hour.', cat: 'daily' },
  { en: 'Minute', pt: 'Minuto', ex: 'Wait a minute.', cat: 'daily' },
  { en: 'Month', pt: 'Mês', ex: 'See you next month.', cat: 'daily' },
  { en: 'Year', pt: 'Ano', ex: 'Happy New Year!', cat: 'daily' },
  { en: 'Night', pt: 'Noite', ex: 'Good night!', cat: 'daily' },
  { en: 'Noon', pt: 'Meio-dia', ex: 'Lunch at noon.', cat: 'daily' },
  { en: 'Midnight', pt: 'Meia-noite', ex: 'The party ends at midnight.', cat: 'daily' },
  { en: 'Birthday', pt: 'Aniversário', ex: 'Happy birthday!', cat: 'daily' },
  { en: 'Holiday', pt: 'Feriado / Férias', ex: 'Monday is a holiday.', cat: 'daily' },
  { en: 'Often', pt: 'Frequentemente', ex: 'I often read at night.', cat: 'daily' },
  { en: 'Rarely', pt: 'Raramente', ex: 'I rarely eat fast food.', cat: 'daily' },
  { en: 'Usually', pt: 'Geralmente', ex: 'I usually wake up early.', cat: 'daily' },
  { en: 'Cough', pt: 'Tosse', ex: 'I have a bad cough.', cat: 'health' },
  { en: 'Cold (illness)', pt: 'Resfriado', ex: 'I caught a cold.', cat: 'health' },
  { en: 'Allergy', pt: 'Alergia', ex: 'I have a food allergy.', cat: 'health' },
  { en: 'Dentist', pt: 'Dentista', ex: 'I go to the dentist.', cat: 'health' },
  { en: 'Tooth', pt: 'Dente', ex: 'My tooth hurts.', cat: 'health' },
  { en: 'Blood', pt: 'Sangue', ex: 'I need a blood test.', cat: 'health' },
  { en: 'Bandage', pt: 'Curativo', ex: 'Put a bandage on it.', cat: 'health' },
  { en: 'Injury', pt: 'Lesão / Ferimento', ex: 'It is a minor injury.', cat: 'health' },
  { en: 'Surgery', pt: 'Cirurgia', ex: 'She needs surgery.', cat: 'health' },
  { en: 'Treatment', pt: 'Tratamento', ex: 'The treatment is working.', cat: 'health' },
  { en: 'Symptom', pt: 'Sintoma', ex: 'Describe your symptoms.', cat: 'health' },
  { en: 'Rest', pt: 'Descanso', ex: 'You need some rest.', cat: 'health' },
  { en: 'Keyboard', pt: 'Teclado', ex: 'My keyboard is broken.', cat: 'tech' },
  { en: 'Mouse', pt: 'Mouse', ex: 'The mouse is wireless.', cat: 'tech' },
  { en: 'Download', pt: 'Baixar', ex: 'Download the file.', cat: 'tech' },
  { en: 'Upload', pt: 'Enviar / Subir', ex: 'Upload your photo.', cat: 'tech' },
  { en: 'Update', pt: 'Atualização', ex: 'Install the update.', cat: 'tech' },
  { en: 'Link', pt: 'Link', ex: 'Click the link.', cat: 'tech' },
  { en: 'Folder', pt: 'Pasta', ex: 'Save it in this folder.', cat: 'tech' },
  { en: 'Software', pt: 'Programa / Software', ex: 'Install the software.', cat: 'tech' },
  { en: 'Camera', pt: 'Câmera', ex: 'The camera is great.', cat: 'tech' },
  { en: 'Headphones', pt: 'Fones de ouvido', ex: 'Where are my headphones?', cat: 'tech' },
  { en: 'Search', pt: 'Buscar / Pesquisa', ex: 'Search it online.', cat: 'tech' },
  { en: 'Click', pt: 'Clicar', ex: 'Click here to start.', cat: 'tech' },
  { en: 'Wallet', pt: 'Carteira', ex: 'I lost my wallet.', cat: 'shopping' },
  { en: 'Coin', pt: 'Moeda', ex: 'I need a coin.', cat: 'shopping' },
  { en: 'Tax', pt: 'Imposto', ex: 'The price includes tax.', cat: 'shopping' },
  { en: 'Refund', pt: 'Reembolso', ex: 'I would like a refund.', cat: 'shopping' },
  { en: 'Order', pt: 'Pedido', ex: 'My order is late.', cat: 'shopping' },
  { en: 'Delivery', pt: 'Entrega', ex: 'Free delivery today.', cat: 'shopping' },
  { en: 'Brand', pt: 'Marca', ex: 'I like this brand.', cat: 'shopping' },
  { en: 'Bargain', pt: 'Pechincha', ex: 'What a bargain!', cat: 'shopping' },
  { en: 'Mall', pt: 'Shopping', ex: "Let's go to the mall.", cat: 'shopping' },
  { en: 'Cart', pt: 'Carrinho', ex: 'Add it to the cart.', cat: 'shopping' },
  { en: 'Checkout', pt: 'Caixa / Finalizar', ex: 'Go to the checkout.', cat: 'shopping' },
  { en: 'Voucher', pt: 'Vale / Cupom', ex: 'I have a voucher.', cat: 'shopping' },
  { en: 'Fog', pt: 'Neblina', ex: 'There is thick fog.', cat: 'weather' },
  { en: 'Ice', pt: 'Gelo', ex: 'The road has ice.', cat: 'weather' },
  { en: 'Lightning', pt: 'Relâmpago', ex: 'I saw lightning.', cat: 'weather' },
  { en: 'Thunder', pt: 'Trovão', ex: 'The thunder was loud.', cat: 'weather' },
  { en: 'Humid', pt: 'Úmido', ex: 'It is very humid today.', cat: 'weather' },
  { en: 'Dry', pt: 'Seco', ex: 'The weather is dry.', cat: 'weather' },
  { en: 'Season', pt: 'Estação do ano', ex: 'Summer is my favorite season.', cat: 'weather' },
  { en: 'Spring', pt: 'Primavera', ex: 'Flowers bloom in spring.', cat: 'weather' },
  { en: 'Summer', pt: 'Verão', ex: 'I love summer.', cat: 'weather' },
  { en: 'Autumn', pt: 'Outono', ex: 'Leaves fall in autumn.', cat: 'weather' },
  { en: 'Winter', pt: 'Inverno', ex: 'Winter is very cold.', cat: 'weather' },
  { en: 'Forecast', pt: 'Previsão do tempo', ex: 'Check the forecast.', cat: 'weather' },
  // Família
  { en: 'Family', pt: 'Família', ex: 'I love my family.', cat: 'family' },
  { en: 'Mother', pt: 'Mãe', ex: 'My mother is a teacher.', cat: 'family' },
  { en: 'Father', pt: 'Pai', ex: 'His father works downtown.', cat: 'family' },
  { en: 'Brother', pt: 'Irmão', ex: 'My brother is older than me.', cat: 'family' },
  { en: 'Sister', pt: 'Irmã', ex: 'Her sister lives abroad.', cat: 'family' },
  { en: 'Son', pt: 'Filho', ex: 'Their son is five years old.', cat: 'family' },
  { en: 'Daughter', pt: 'Filha', ex: 'My daughter loves to read.', cat: 'family' },
  { en: 'Husband', pt: 'Marido', ex: 'Her husband cooks dinner.', cat: 'family' },
  { en: 'Wife', pt: 'Esposa', ex: 'His wife is a doctor.', cat: 'family' },
  { en: 'Grandparents', pt: 'Avós', ex: 'We visit our grandparents on Sundays.', cat: 'family' },
  { en: 'Cousin', pt: 'Primo(a)', ex: 'My cousin is coming to visit.', cat: 'family' },
  { en: 'Child / Children', pt: 'Criança / Crianças', ex: 'The children are playing.', cat: 'family' },
  // Natureza
  { en: 'Tree', pt: 'Árvore', ex: 'The tree is very tall.', cat: 'nature' },
  { en: 'Flower', pt: 'Flor', ex: 'She picked a red flower.', cat: 'nature' },
  { en: 'River', pt: 'Rio', ex: 'We swam in the river.', cat: 'nature' },
  { en: 'Mountain', pt: 'Montanha', ex: 'They climbed the mountain.', cat: 'nature' },
  { en: 'Sea', pt: 'Mar', ex: 'The sea is calm today.', cat: 'nature' },
  { en: 'Beach', pt: 'Praia', ex: 'Let us go to the beach.', cat: 'nature' },
  { en: 'Forest', pt: 'Floresta', ex: 'The forest is full of birds.', cat: 'nature' },
  { en: 'Animal', pt: 'Animal', ex: 'A dog is a friendly animal.', cat: 'nature' },
  { en: 'Bird', pt: 'Pássaro', ex: 'A bird is singing outside.', cat: 'nature' },
  { en: 'Sky', pt: 'Céu', ex: 'The sky is clear and blue.', cat: 'nature' },
  { en: 'Ground', pt: 'Chão / Solo', ex: 'The leaves fell on the ground.', cat: 'nature' },
  { en: 'Island', pt: 'Ilha', ex: 'They live on a small island.', cat: 'nature' },
  // Cidade e lugares
  { en: 'City', pt: 'Cidade', ex: 'This city is very busy.', cat: 'city' },
  { en: 'Street', pt: 'Rua', ex: 'My house is on this street.', cat: 'city' },
  { en: 'Building', pt: 'Prédio', ex: 'That building is very tall.', cat: 'city' },
  { en: 'Bank', pt: 'Banco', ex: 'I need to go to the bank.', cat: 'city' },
  { en: 'Hospital', pt: 'Hospital', ex: 'The hospital is near here.', cat: 'city' },
  { en: 'School', pt: 'Escola', ex: 'The children walk to school.', cat: 'city' },
  { en: 'Market', pt: 'Mercado', ex: 'She buys fruit at the market.', cat: 'city' },
  { en: 'Restaurant', pt: 'Restaurante', ex: 'We ate at a nice restaurant.', cat: 'city' },
  { en: 'Station', pt: 'Estação', ex: 'The train station is crowded.', cat: 'city' },
  { en: 'Airport', pt: 'Aeroporto', ex: 'The airport is far from downtown.', cat: 'city' },
  { en: 'Corner', pt: 'Esquina', ex: 'Turn left at the corner.', cat: 'city' },
  { en: 'Neighborhood', pt: 'Bairro / Vizinhança', ex: 'It is a quiet neighborhood.', cat: 'city' },
]

const catEmoji: { [k: string]: string } = { basic: '👋', travel: '✈️', work: '💼', food: '🍽️', home: '🏠', verbs: '⚡', feelings: '😊', daily: '📅', health: '🏥', tech: '💻', shopping: '🛒', weather: '🌤️', family: '👨‍👩‍👧', nature: '🌳', city: '🏙️' }
const catNome: { [k: string]: string } = { basic: 'Essencial', travel: 'Viagem', work: 'Trabalho', food: 'Comida', home: 'Casa', verbs: 'Verbo', feelings: 'Sentimento', daily: 'Dia a dia', health: 'Saúde', tech: 'Tecnologia', shopping: 'Compras', weather: 'Clima', family: 'Família', nature: 'Natureza', city: 'Cidade' }
// Uma cor viva por categoria (dá identidade visual a cada card do vocabulário).
const catColor: { [k: string]: string } = { basic: '#2E72D6', travel: '#0EA5A5', work: '#4B3FBF', food: '#E8590C', home: '#B45309', verbs: '#7C3AED', feelings: '#DB2777', daily: '#0D9488', health: '#DC2626', tech: '#4F46E5', shopping: '#C026D3', weather: '#0284C7', family: '#EA580C', nature: '#16A34A', city: '#475569' }

interface Msg { role: string; text: string }
type ViewType = 'levels' | 'list' | 'explanation' | 'quiz' | 'build' | 'traduzir' | 'ditado' | 'finish'
const nPal = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length
// Quebra um exemplo em pares (en,pt) limpos e alinhados. Se a frase for composta
// ("Já comi. Não estou com fome."), separa em orações — mas só aproveita quando EN e PT
// têm o MESMO número de orações (garante que a tradução casa). Recupera muitos exemplos
// que antes eram descartados inteiros, fazendo a produção aparecer em quase toda lição.
function paresLimpos(examples: {en:string;pt:string}[]): {en:string;pt:string}[] {
  const out: {en:string;pt:string}[] = []
  for (const e of examples || []) {
    const en = (e.en || '').trim(), pt = (e.pt || '').trim()
    if (!en || !pt) continue
    const partesEn = en.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
    const partesPt = pt.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
    if (partesEn.length === 1) { out.push({ en, pt }); continue }
    if (partesEn.length === partesPt.length) {
      for (let i = 0; i < partesEn.length; i++) out.push({ en: partesEn[i], pt: partesPt[i] })
    }
    // orações desalinhadas: descarta o exemplo (não arrisca tradução errada)
  }
  // sem pontuação interna nas orações finais (vírgula é permitida)
  return out.filter(p => !/[.!?]/.test(p.en.replace(/[.!?]+$/, '')))
}
// Ditado (ouvir e escrever): treina listening + escrita. Frases de 3 a 10 palavras.
function frasesDitado(examples: {en:string;pt:string}[]): {en:string;pt:string}[] {
  return paresLimpos(examples).filter(p => { const n = nPal(p.en); return n >= 3 && n <= 10 && p.en.length <= 72 }).slice(0, 2)
}
// "Montar a frase" (tocar nas palavras): metade das frases produzíveis (3 a 12 palavras).
function frasesProduziveis(examples: {en:string;pt:string}[]): {en:string;pt:string}[] {
  return paresLimpos(examples).filter(p => { const n = nPal(p.en); return n >= 3 && n <= 12 }).slice(0, 4)
}
function frasesMontaveis(examples: {en:string;pt:string}[]): {en:string;pt:string}[] {
  const p = frasesProduziveis(examples); return p.slice(0, Math.ceil(p.length / 2)).slice(0, 2)
}
// "Traduza" (digitar em inglês a partir do PT, sem áudio): a outra metade — o exercício
// mais produtivo. Só aparece quando há 2+ frases, com frases diferentes das do "montar".
function frasesTraduzir(examples: {en:string;pt:string}[]): {en:string;pt:string}[] {
  const p = frasesProduziveis(examples); return p.slice(Math.ceil(p.length / 2)).slice(0, 2)
}

const KIWIFY_MENSAL = 'https://pay.kiwify.com.br/JUkXkbf'
const KIWIFY_ANUAL = 'https://pay.kiwify.com.br/zirnO0x'
// ⭐ INTERRUPTOR DA MONETIZAÇÃO:
// true  = beta grátis (todos Premium, sem paywall)
// false = cobrança ligada (free tem limites, quem paga vira Premium via Kiwify) — estado atual
const BETA_GRATIS = false

const dictCatList = [
  {id:'casa',label:'🏠 Casa'},{id:'comida',label:'🍎 Comida'},{id:'corpo',label:'🧍 Corpo'},
  {id:'animais',label:'🐾 Animais'},{id:'transporte',label:'🚗 Transporte'},
  {id:'roupas',label:'👕 Roupas'},{id:'escola',label:'📚 Escola'},
  {id:'natureza',label:'🌿 Natureza'},{id:'esportes',label:'⚽ Esportes'},{id:'profissoes',label:'👔 Profissões'},
  {id:'emocoes',label:'😊 Emoções'},
  {id:'cores',label:'🎨 Cores'},
  {id:'tempo',label:'📅 Dias/Meses'},
  {id:'tecnologia',label:'💻 Tecnologia'},
  {id:'saude',label:'🏥 Saúde'},
  {id:'financas',label:'💰 Finanças'},
  {id:'arte',label:'🎭 Arte'},
  {id:'cidade',label:'🏙️ Cidade'},
  {id:'culinaria',label:'👨‍🍳 Culinária'},
  {id:'selva',label:'🦁 Selva'},
  {id:'negocios',label:'💼 Negócios'},
  {id:'viagem',label:'✈️ Viagem'},
  {id:'lugares',label:'🗺️ Lugares'},
  {id:'estacoes',label:'🌤️ Clima'},
]
// Uma cor por categoria do dicionário (deixa a tela colorida, não só roxa).
const dictColor: { [k: string]: string } = { casa:'#B45309', comida:'#E8590C', corpo:'#DC2626', animais:'#A16207', transporte:'#2563EB', roupas:'#DB2777', escola:'#4F46E5', natureza:'#16A34A', esportes:'#EA580C', profissoes:'#4B3FBF', emocoes:'#E11D48', cores:'#7C3AED', tempo:'#0284C7', tecnologia:'#6366F1', saude:'#DC2626', financas:'#CA8A04', arte:'#C026D3', cidade:'#475569', culinaria:'#B45309', selva:'#15803D', negocios:'#1E40AF', viagem:'#0EA5A5', lugares:'#0891B2', estacoes:'#0284C7' }
// Emoji ilustrativo por palavra (renderizado nativo/colorido, carrega na hora — substitui as fotos lentas).
const wordEmoji: Record<string, string> = {
  door:'🚪', window:'🪟', roof:'🏠', floor:'🧱', wall:'🧱', kitchen:'🍳', bedroom:'🛏️', bathroom:'🛁',
  bread:'🍞', cheese:'🧀', rice:'🍚', meat:'🥩', egg:'🥚', fruit:'🍎', coffee:'☕', water:'💧',
  head:'👤', hand:'✋', arm:'💪', leg:'🦵', foot:'🦶', eye:'👁️', nose:'👃', mouth:'👄',
  dog:'🐶', cat:'🐱', bird:'🐦', horse:'🐴', cow:'🐮', pig:'🐷', fish:'🐟', rabbit:'🐰',
  car:'🚗', bus:'🚌', train:'🚆', plane:'✈️', bike:'🚲', boat:'⛵', taxi:'🚕', subway:'🚇',
  shirt:'👕', pants:'👖', shoes:'👟', dress:'👗', hat:'🎩', coat:'🧥', socks:'🧦', jacket:'🧥',
  book:'📖', pen:'🖊️', pencil:'✏️', teacher:'👩‍🏫', student:'🧑‍🎓', desk:'🪑', notebook:'📓', test:'📝',
  tree:'🌳', flower:'🌸', river:'🏞️', mountain:'⛰️', sea:'🌊', sky:'☁️', sun:'☀️', moon:'🌙',
  soccer:'⚽', ball:'🏀', game:'🎮', team:'👥', run:'🏃', swim:'🏊', tennis:'🎾', goal:'🥅',
  doctor:'👨‍⚕️', nurse:'👩‍⚕️', driver:'🚕', cook:'👨‍🍳', lawyer:'⚖️', engineer:'👷', farmer:'🧑‍🌾', 'police officer':'👮',
  medicine:'💊', hospital:'🏥', pain:'🤕', fever:'🤒', health:'❤️', pill:'💊',
  happy:'😄', sad:'😢', angry:'😠', tired:'😴', scared:'😨', excited:'🤩', calm:'😌', proud:'😎',
  red:'🔴', blue:'🔵', green:'🟢', yellow:'🟡', black:'⚫', white:'⚪', orange:'🟠', purple:'🟣',
  monday:'📅', friday:'📅', sunday:'📅', january:'🗓️', july:'🗓️', december:'🗓️', week:'📆', month:'📆',
  computer:'💻', phone:'📱', internet:'🌐', screen:'🖥️', keyboard:'⌨️', app:'📲', password:'🔒', 'wi-fi':'📶',
  money:'💰', bank:'🏦', card:'💳', cash:'💵', price:'🏷️', salary:'💸', loan:'🏦', coin:'🪙',
  music:'🎵', song:'🎶', painting:'🖼️', dance:'💃', movie:'🎬', art:'🎨', theater:'🎭', stage:'🎤',
  street:'🛣️', building:'🏢', park:'🌳', store:'🏪', market:'🛒', square:'🏛️', bridge:'🌉', corner:'📐',
  recipe:'📜', oven:'🔥', pan:'🍳', knife:'🔪', spoon:'🥄', fork:'🍴', plate:'🍽️', salt:'🧂',
  lion:'🦁', tiger:'🐯', monkey:'🐵', snake:'🐍', elephant:'🐘', jaguar:'🐆', parrot:'🦜', frog:'🐸',
  meeting:'🤝', deal:'🤝', client:'🧑‍💼', profit:'📈', company:'🏢', boss:'👔', report:'📊',
  trip:'🧳', hotel:'🏨', flight:'✈️', map:'🗺️', beach:'🏖️', luggage:'🧳', passport:'🛂', ticket:'🎫',
  home:'🏠', school:'🏫', office:'🏢', airport:'🛫', station:'🚉', library:'📚', church:'⛪', museum:'🏛️',
  summer:'☀️', winter:'❄️', spring:'🌷', autumn:'🍂', rain:'🌧️', snow:'❄️', wind:'💨', hot:'🥵',
}
const catDictEmoji: Record<string, string> = { casa:'🏠', comida:'🍽️', corpo:'🧍', animais:'🐾', transporte:'🚗', roupas:'👕', escola:'📚', natureza:'🌿', esportes:'⚽', profissoes:'💼', emocoes:'😊', cores:'🎨', tempo:'📅', tecnologia:'💻', saude:'🏥', financas:'💰', arte:'🎭', cidade:'🏙️', culinaria:'👨‍🍳', selva:'🦁', negocios:'💼', viagem:'✈️', lugares:'🗺️', estacoes:'🌤️' }
// Pool de emojis por categoria: palavras sem emoji exato pegam um do pool (varia por palavra, evita repetição).
const catEmojiPool: Record<string, string[]> = {
  casa:['🚪','🪟','🛏️','🛁','🍳','🛋️','🚿','🪑','🔑','🧹'], comida:['🍞','🧀','🍚','🥩','🥚','🍎','🥦','🍗','🍅','🥕','🍫','🍰'],
  corpo:['👤','✋','🦵','👁️','👂','👃','👄','🦶','💪','🦷'], animais:['🐶','🐱','🐦','🐴','🐮','🐷','🐟','🐰','🐭','🐔','🐑','🦆'],
  transporte:['🚗','🚌','🚆','✈️','🚲','⛵','🚕','🚇','🛵','🚚','🚓','🛺'], roupas:['👕','👖','👟','👗','🎩','🧥','🧦','🧤','👔','🩳','👞','🧣'],
  escola:['📖','🖊️','✏️','📓','📝','🎒','📐','🧮','📚','🖍️'], natureza:['🌳','🌸','🏞️','⛰️','🌊','☀️','🌙','⭐','🍃','🌵','🌻','🌴'],
  esportes:['⚽','🏀','🎾','🏊','🏃','🥅','🏈','⚾','🏐','🥊','🚴','🏆'], profissoes:['👨‍⚕️','👩‍⚕️','👨‍🍳','👷','🧑‍🌾','👮','🧑‍🏫','🧑‍🔧','🧑‍💼','🧑‍🚒'],
  emocoes:['😄','😢','😠','😴','😨','🤩','😌','😎','😲','🥰','😳','😭'], cores:['🔴','🔵','🟢','🟡','⚫','⚪','🟠','🟣','🟤','🩷'],
  tempo:['📅','🗓️','📆','⏰','🕐','🌅','🌇','🌃'], tecnologia:['💻','📱','🌐','🖥️','⌨️','📲','🔒','🖱️','💾','🔌'],
  saude:['🏥','💊','🩺','🤕','🤒','❤️','🩹','💉','🦷','🧬'], financas:['💰','🏦','💳','💵','🏷️','💸','🪙','📈','🧾','💲'],
  arte:['🎵','🎶','🖼️','💃','🎬','🎨','🎭','🎤','🎸','🎻'], cidade:['🏢','🏙️','🌉','🏪','🛒','🚦','🏛️','⛲','🚏','🏬'],
  culinaria:['🍳','🔪','🥄','🍴','🍽️','🧂','🥘','🍲','🥣','🧑‍🍳'], selva:['🦁','🐯','🐵','🐍','🐘','🐆','🦜','🐸','🦍','🦥','🦩','🐊'],
  negocios:['🤝','🧑‍💼','📈','🏢','👔','📊','💼','📉','🗂️','📌'], viagem:['🧳','🏨','✈️','🗺️','🏖️','🛂','🎫','🧭','🏝️','📸'],
  lugares:['🏠','🏫','🏢','🛫','🚉','📚','⛪','🏛️','🏥','🏟️'], estacoes:['☀️','❄️','🌷','🍂','🌧️','💨','🥵','🌡️','☁️','🌈'],
}
// Emoji EXATO por palavra, dentro de cada categoria (desambigua palavras iguais: chicken=frango/galinha).
const dictWordEmoji: Record<string, Record<string, string>> = {
  casa:{door:'🚪',window:'🪟',roof:'🏠',floor:'🪵',wall:'🧱',kitchen:'🍳',bedroom:'🛏️',bathroom:'🛁',table:'🍽️',chair:'🪑',bed:'🛌',sofa:'🛋️',lamp:'💡',key:'🔑',garden:'🌷',stairs:'🪜'},
  comida:{bread:'🍞',cheese:'🧀',rice:'🍚',meat:'🥩',egg:'🥚',fruit:'🍎',coffee:'☕',water:'💧',milk:'🥛',sugar:'🍬',salt:'🧂',apple:'🍏',banana:'🍌',chicken:'🍗',soup:'🍲',cake:'🍰'},
  corpo:{head:'😀',hand:'✋',arm:'💪',leg:'🦵',foot:'🦶',eye:'👁️',nose:'👃',mouth:'👄',ear:'👂',hair:'💇',finger:'👆',tooth:'🦷',heart:'❤️',knee:'🦿',back:'🧍',neck:'🧣'},
  animais:{dog:'🐶',cat:'🐱',bird:'🐦',horse:'🐴',cow:'🐮',pig:'🐷',fish:'🐟',rabbit:'🐰',sheep:'🐑',duck:'🦆',chicken:'🐔',mouse:'🐭',bear:'🐻',bee:'🐝',ant:'🐜',spider:'🕷️'},
  transporte:{car:'🚗',bus:'🚌',train:'🚆',plane:'✈️',bike:'🚲',boat:'⛵',taxi:'🚕',subway:'🚇',truck:'🚚',motorcycle:'🏍️',ship:'🚢',helicopter:'🚁',ambulance:'🚑',ticket:'🎫',road:'🛣️',wheel:'🛞'},
  roupas:{shirt:'👕',pants:'👖',shoes:'👟',dress:'👗',hat:'🎩',coat:'🧥',socks:'🧦',jacket:'🦺',skirt:'👚',gloves:'🧤',scarf:'🧣',belt:'🎽',tie:'👔',boots:'🥾',sweater:'🧶',shorts:'🩳'},
  escola:{book:'📖',pen:'🖊️',pencil:'✏️',teacher:'👩‍🏫',student:'🧑‍🎓',desk:'🪑',notebook:'📓',test:'📝',ruler:'📏',eraser:'🧽',backpack:'🎒',board:'📋',lesson:'📔',homework:'✍️',class:'🏫',grade:'💯'},
  natureza:{tree:'🌳',flower:'🌸',river:'🏞️',mountain:'⛰️',sea:'🌊',sky:'☁️',sun:'☀️',moon:'🌙',star:'⭐',cloud:'🌥️',rain:'🌧️',beach:'🏖️',forest:'🌲',grass:'🌱',rock:'🪨',island:'🏝️'},
  esportes:{soccer:'⚽',ball:'🏀',game:'🎮',team:'👥',run:'🏃',swim:'🏊',tennis:'🎾',goal:'🥅',basketball:'⛹️',race:'🏁',player:'🏅',win:'🏆',coach:'📣',field:'🏟️',jump:'🤸',score:'🎯'},
  profissoes:{doctor:'👨‍⚕️',nurse:'👩‍⚕️',driver:'🚕',cook:'👨‍🍳',lawyer:'⚖️',engineer:'👷',farmer:'🧑‍🌾','police officer':'👮',pilot:'🧑‍✈️',dentist:'🦷',waiter:'🍽️',artist:'🧑‍🎨',firefighter:'🧑‍🚒',scientist:'🧑‍🔬',chef:'🧑‍🍳',manager:'🧑‍💼'},
  emocoes:{happy:'😄',sad:'😢',angry:'😠',tired:'😴',scared:'😨',excited:'🤩',calm:'😌',proud:'😎',bored:'😑',nervous:'😰',surprised:'😲',lonely:'😔',jealous:'😒',grateful:'🙏',worried:'😟',confident:'💪'},
  cores:{red:'🔴',blue:'🔵',green:'🟢',yellow:'🟡',black:'⚫',white:'⚪',orange:'🟠',purple:'🟣',pink:'💗',brown:'🟤',gray:'🩶',gold:'🥇',silver:'🥈',light:'🔆',dark:'🌑',beige:'🟫'},
  tempo:{monday:'📅',friday:'📆',sunday:'🗓️',january:'🌨️',july:'🌞',december:'🎄',week:'🗂️',month:'🈷️',today:'📌',tomorrow:'🔜',yesterday:'🔙',morning:'🌅',night:'🌙',year:'🎊',hour:'⏰',minute:'⏱️'},
  tecnologia:{computer:'💻',phone:'📱',internet:'🌐',screen:'🖥️',keyboard:'⌨️',app:'📲',password:'🔒','wi-fi':'📶',mouse:'🖱️',file:'📁',email:'📧',camera:'📷',battery:'🔋',charger:'🔌',website:'🕸️',button:'🔘'},
  saude:{doctor:'👨‍⚕️',medicine:'🧴',hospital:'🏥',pain:'🤕',fever:'🤒',health:'💗',nurse:'👩‍⚕️',pill:'💊',headache:'🤯',cough:'🤧',cold:'🥶',blood:'🩸',bandage:'🩹',vaccine:'💉',rest:'😴',sick:'🤢'},
  financas:{money:'💰',bank:'🏦',card:'💳',cash:'💵',price:'🏷️',salary:'💸',loan:'📄',coin:'🪙',bill:'🧾',debt:'📉',save:'🐷',buy:'🛍️',sell:'🤝',tax:'📑',wallet:'👛',change:'💱'},
  arte:{music:'🎵',song:'🎶',painting:'🖼️',dance:'💃',movie:'🎬',art:'🎨',theater:'🎭',stage:'🎤',guitar:'🎸',piano:'🎹',actor:'🕴️',drawing:'✏️',concert:'🪩',photo:'📷',poem:'📜',brush:'🖌️'},
  cidade:{street:'🛣️',building:'🏢',park:'🌳',store:'🏪',market:'🛒',square:'🏛️',bridge:'🌉',corner:'📐',traffic:'🚦',sidewalk:'🚶',station:'🚉',mall:'🏬',sign:'🪧',fountain:'⛲',avenue:'🏙️',crosswalk:'🚸'},
  culinaria:{recipe:'📜',oven:'🔥',pan:'🍳',knife:'🔪',spoon:'🥄',fork:'🍴',plate:'🍽️',salt:'🧂',cup:'🍵',bowl:'🥣',boil:'♨️',fry:'🍤',bake:'🥐',flour:'🌾',taste:'👅',pepper:'🌶️'},
  selva:{lion:'🦁',tiger:'🐯',monkey:'🐵',snake:'🐍',elephant:'🐘',jaguar:'🐆',parrot:'🦜',frog:'🐸',gorilla:'🦍',zebra:'🦓',crocodile:'🐊',leopard:'🐅',turtle:'🐢',toucan:'🐦',butterfly:'🦋',hippo:'🦛'},
  negocios:{meeting:'👥',deal:'🤝',client:'🧑‍💼',profit:'📈',company:'🏢',market:'🏪',boss:'👔',report:'📊',sales:'💹',budget:'🧮',goal:'🎯',contract:'📝',product:'📦',customer:'🙋',invoice:'🧾',strategy:'♟️'},
  viagem:{trip:'🌍',hotel:'🏨',flight:'✈️',map:'🗺️',beach:'🏖️',luggage:'🧳',passport:'🛂',ticket:'🎫',tourist:'📸',suitcase:'🛄',guide:'🧭',border:'🚧',journey:'🛤️',visa:'🪪',souvenir:'🎁',currency:'💱'},
  lugares:{home:'🏠',school:'🏫',office:'🏢',airport:'🛫',station:'🚉',library:'📚',church:'⛪',museum:'🏛️',restaurant:'🍽️',gym:'🏋️',farm:'🚜',bakery:'🥐',zoo:'🦁',cinema:'🎦',pharmacy:'💊',bank:'🏦'},
  estacoes:{summer:'☀️',winter:'❄️',spring:'🌷',autumn:'🍂',rain:'🌧️',snow:'☃️',wind:'💨',hot:'🥵',cold:'🥶',warm:'🌤️',storm:'⛈️',cloud:'☁️',sunny:'🌞',fog:'🌫️',ice:'🧊',rainbow:'🌈'},
}
function dictEmojiFor(en: string, cat: string): string {
  const k = (en || '').toLowerCase().trim()
  const cm = dictWordEmoji[cat]
  if (cm && cm[k]) return cm[k]
  if (wordEmoji[k]) return wordEmoji[k]
  const pool = catEmojiPool[cat]
  if (pool && pool.length) { let s = 0; for (let i = 0; i < k.length; i++) s = (s * 31 + k.charCodeAt(i)) >>> 0; return pool[s % pool.length] }
  return catDictEmoji[cat] || '📘'
}

const DICT_LOCAL: Record<string, {en:string;pt:string;pron:string}[]> = {
  casa: [{en:'Door',pt:'Porta',pron:'dór'},{en:'Window',pt:'Janela',pron:'uín-dou'},{en:'Roof',pt:'Telhado',pron:'rúf'},{en:'Floor',pt:'Chão / Andar',pron:'flór'},{en:'Wall',pt:'Parede',pron:'uól'},{en:'Kitchen',pt:'Cozinha',pron:'kít-chen'},{en:'Bedroom',pt:'Quarto',pron:'béd-rum'},{en:'Bathroom',pt:'Banheiro',pron:'béth-rum'},{en:'Table',pt:'Mesa',pron:'têi-bou'},{en:'Chair',pt:'Cadeira',pron:'tchér'},{en:'Bed',pt:'Cama',pron:'béd'},{en:'Sofa',pt:'Sofá',pron:'sô-fa'},{en:'Lamp',pt:'Luminária',pron:'lémp'},{en:'Key',pt:'Chave',pron:'kí'},{en:'Garden',pt:'Jardim',pron:'gár-den'},{en:'Stairs',pt:'Escada',pron:'stérs'}],
  comida: [{en:'Bread',pt:'Pão',pron:'bréd'},{en:'Cheese',pt:'Queijo',pron:'chíz'},{en:'Rice',pt:'Arroz',pron:'ráis'},{en:'Meat',pt:'Carne',pron:'mít'},{en:'Egg',pt:'Ovo',pron:'ég'},{en:'Fruit',pt:'Fruta',pron:'frút'},{en:'Coffee',pt:'Café',pron:'kó-fi'},{en:'Water',pt:'Água',pron:'uó-ter'},{en:'Milk',pt:'Leite',pron:'mílk'},{en:'Sugar',pt:'Açúcar',pron:'chú-gar'},{en:'Salt',pt:'Sal',pron:'sólt'},{en:'Apple',pt:'Maçã',pron:'é-pou'},{en:'Banana',pt:'Banana',pron:'ba-né-na'},{en:'Chicken',pt:'Frango',pron:'tchí-ken'},{en:'Soup',pt:'Sopa',pron:'súp'},{en:'Cake',pt:'Bolo',pron:'kêik'}],
  corpo: [{en:'Head',pt:'Cabeça',pron:'héd'},{en:'Hand',pt:'Mão',pron:'rénd'},{en:'Arm',pt:'Braço',pron:'árm'},{en:'Leg',pt:'Perna',pron:'lég'},{en:'Foot',pt:'Pé',pron:'fút'},{en:'Eye',pt:'Olho',pron:'ái'},{en:'Nose',pt:'Nariz',pron:'nôuz'},{en:'Mouth',pt:'Boca',pron:'máuth'},{en:'Ear',pt:'Orelha',pron:'íer'},{en:'Hair',pt:'Cabelo',pron:'rér'},{en:'Finger',pt:'Dedo',pron:'fín-guer'},{en:'Tooth',pt:'Dente',pron:'túth'},{en:'Heart',pt:'Coração',pron:'rárt'},{en:'Knee',pt:'Joelho',pron:'ní'},{en:'Back',pt:'Costas',pron:'bék'},{en:'Neck',pt:'Pescoço',pron:'nék'}],
  animais: [{en:'Dog',pt:'Cachorro',pron:'dóg'},{en:'Cat',pt:'Gato',pron:'két'},{en:'Bird',pt:'Pássaro',pron:'bârd'},{en:'Horse',pt:'Cavalo',pron:'rórs'},{en:'Cow',pt:'Vaca',pron:'káu'},{en:'Pig',pt:'Porco',pron:'píg'},{en:'Fish',pt:'Peixe',pron:'fích'},{en:'Rabbit',pt:'Coelho',pron:'ré-bit'},{en:'Sheep',pt:'Ovelha',pron:'chíp'},{en:'Duck',pt:'Pato',pron:'dâk'},{en:'Chicken',pt:'Galinha',pron:'tchí-ken'},{en:'Mouse',pt:'Rato',pron:'máus'},{en:'Bear',pt:'Urso',pron:'bér'},{en:'Bee',pt:'Abelha',pron:'bí'},{en:'Ant',pt:'Formiga',pron:'ént'},{en:'Spider',pt:'Aranha',pron:'spái-der'}],
  transporte: [{en:'Car',pt:'Carro',pron:'kár'},{en:'Bus',pt:'Ônibus',pron:'bâs'},{en:'Train',pt:'Trem',pron:'trêin'},{en:'Plane',pt:'Avião',pron:'plêin'},{en:'Bike',pt:'Bicicleta',pron:'báik'},{en:'Boat',pt:'Barco',pron:'bôut'},{en:'Taxi',pt:'Táxi',pron:'té-ksi'},{en:'Subway',pt:'Metrô',pron:'sâb-uêi'},{en:'Truck',pt:'Caminhão',pron:'trâk'},{en:'Motorcycle',pt:'Moto',pron:'mô-tor-sai-kou'},{en:'Ship',pt:'Navio',pron:'chíp'},{en:'Helicopter',pt:'Helicóptero',pron:'ré-li-kop-ter'},{en:'Ambulance',pt:'Ambulância',pron:'ém-biu-lens'},{en:'Ticket',pt:'Passagem',pron:'tí-ket'},{en:'Road',pt:'Estrada',pron:'rôud'},{en:'Wheel',pt:'Roda',pron:'uíl'}],
  roupas: [{en:'Shirt',pt:'Camisa',pron:'xârt'},{en:'Pants',pt:'Calça',pron:'pénts'},{en:'Shoes',pt:'Sapatos',pron:'xúz'},{en:'Dress',pt:'Vestido',pron:'drés'},{en:'Hat',pt:'Chapéu',pron:'rét'},{en:'Coat',pt:'Casaco',pron:'kôut'},{en:'Socks',pt:'Meias',pron:'sóks'},{en:'Jacket',pt:'Jaqueta',pron:'djé-ket'},{en:'Skirt',pt:'Saia',pron:'skârt'},{en:'Gloves',pt:'Luvas',pron:'glâvs'},{en:'Scarf',pt:'Cachecol',pron:'skárf'},{en:'Belt',pt:'Cinto',pron:'bélt'},{en:'Tie',pt:'Gravata',pron:'tái'},{en:'Boots',pt:'Botas',pron:'búts'},{en:'Sweater',pt:'Suéter',pron:'sué-ter'},{en:'Shorts',pt:'Shorts',pron:'chórts'}],
  escola: [{en:'Book',pt:'Livro',pron:'búk'},{en:'Pen',pt:'Caneta',pron:'pén'},{en:'Pencil',pt:'Lápis',pron:'pên-sil'},{en:'Teacher',pt:'Professor',pron:'tí-cher'},{en:'Student',pt:'Aluno',pron:'stiú-dent'},{en:'Desk',pt:'Carteira/Mesa',pron:'désk'},{en:'Notebook',pt:'Caderno',pron:'nôut-buk'},{en:'Test',pt:'Prova',pron:'tést'},{en:'Ruler',pt:'Régua',pron:'rú-ler'},{en:'Eraser',pt:'Borracha',pron:'i-rêi-ser'},{en:'Backpack',pt:'Mochila',pron:'bék-pék'},{en:'Board',pt:'Quadro',pron:'bórd'},{en:'Lesson',pt:'Lição',pron:'lé-son'},{en:'Homework',pt:'Dever de casa',pron:'rôum-uârk'},{en:'Class',pt:'Aula',pron:'klés'},{en:'Grade',pt:'Nota',pron:'grêid'}],
  natureza: [{en:'Tree',pt:'Árvore',pron:'trí'},{en:'Flower',pt:'Flor',pron:'fláu-er'},{en:'River',pt:'Rio',pron:'rí-ver'},{en:'Mountain',pt:'Montanha',pron:'máun-tin'},{en:'Sea',pt:'Mar',pron:'sí'},{en:'Sky',pt:'Céu',pron:'skái'},{en:'Sun',pt:'Sol',pron:'sân'},{en:'Moon',pt:'Lua',pron:'mún'},{en:'Star',pt:'Estrela',pron:'stár'},{en:'Cloud',pt:'Nuvem',pron:'kláud'},{en:'Rain',pt:'Chuva',pron:'rêin'},{en:'Beach',pt:'Praia',pron:'bích'},{en:'Forest',pt:'Floresta',pron:'fó-rest'},{en:'Grass',pt:'Grama',pron:'grés'},{en:'Rock',pt:'Pedra',pron:'rók'},{en:'Island',pt:'Ilha',pron:'ái-land'}],
  esportes: [{en:'Soccer',pt:'Futebol',pron:'só-ker'},{en:'Ball',pt:'Bola',pron:'ból'},{en:'Game',pt:'Jogo',pron:'guêim'},{en:'Team',pt:'Time',pron:'tím'},{en:'Run',pt:'Correr',pron:'rân'},{en:'Swim',pt:'Nadar',pron:'suím'},{en:'Tennis',pt:'Tênis',pron:'tê-nis'},{en:'Goal',pt:'Gol',pron:'gôul'},{en:'Basketball',pt:'Basquete',pron:'bás-ket-bol'},{en:'Race',pt:'Corrida',pron:'rêis'},{en:'Player',pt:'Jogador',pron:'plêi-er'},{en:'Win',pt:'Vencer',pron:'uín'},{en:'Coach',pt:'Treinador',pron:'kôutch'},{en:'Field',pt:'Campo',pron:'fíld'},{en:'Jump',pt:'Pular',pron:'djâmp'},{en:'Score',pt:'Placar',pron:'skór'}],
  profissoes: [{en:'Doctor',pt:'Médico',pron:'dók-tor'},{en:'Nurse',pt:'Enfermeiro',pron:'nârs'},{en:'Driver',pt:'Motorista',pron:'drái-ver'},{en:'Cook',pt:'Cozinheiro',pron:'kúk'},{en:'Lawyer',pt:'Advogado',pron:'ló-ier'},{en:'Engineer',pt:'Engenheiro',pron:'en-dji-nír'},{en:'Farmer',pt:'Fazendeiro',pron:'fár-mer'},{en:'Police officer',pt:'Policial',pron:'po-lís ó-fi-ser'},{en:'Pilot',pt:'Piloto',pron:'pái-lot'},{en:'Dentist',pt:'Dentista',pron:'dén-tist'},{en:'Waiter',pt:'Garçom',pron:'uêi-ter'},{en:'Artist',pt:'Artista',pron:'ár-tist'},{en:'Firefighter',pt:'Bombeiro',pron:'fáier-fai-ter'},{en:'Scientist',pt:'Cientista',pron:'sái-en-tist'},{en:'Chef',pt:'Chef de cozinha',pron:'chéf'},{en:'Manager',pt:'Gerente',pron:'mé-na-djer'}],
  emocoes: [{en:'Happy',pt:'Feliz',pron:'ré-pi'},{en:'Sad',pt:'Triste',pron:'séd'},{en:'Angry',pt:'Bravo',pron:'ên-gri'},{en:'Tired',pt:'Cansado',pron:'tái-erd'},{en:'Scared',pt:'Com medo',pron:'skérd'},{en:'Excited',pt:'Animado',pron:'ek-sái-ted'},{en:'Calm',pt:'Calmo',pron:'cám'},{en:'Proud',pt:'Orgulhoso',pron:'práud'},{en:'Bored',pt:'Entediado',pron:'bórd'},{en:'Nervous',pt:'Nervoso',pron:'nâr-vas'},{en:'Surprised',pt:'Surpreso',pron:'ser-práizd'},{en:'Lonely',pt:'Solitário',pron:'lôun-li'},{en:'Jealous',pt:'Com ciúmes',pron:'djé-las'},{en:'Grateful',pt:'Grato',pron:'grêit-ful'},{en:'Worried',pt:'Preocupado',pron:'uâ-rid'},{en:'Confident',pt:'Confiante',pron:'kón-fi-dent'}],
  cores: [{en:'Red',pt:'Vermelho',pron:'réd'},{en:'Blue',pt:'Azul',pron:'blú'},{en:'Green',pt:'Verde',pron:'grín'},{en:'Yellow',pt:'Amarelo',pron:'ié-lou'},{en:'Black',pt:'Preto',pron:'blék'},{en:'White',pt:'Branco',pron:'uáit'},{en:'Orange',pt:'Laranja',pron:'ó-rinj'},{en:'Purple',pt:'Roxo',pron:'pâr-pol'},{en:'Pink',pt:'Rosa',pron:'pínk'},{en:'Brown',pt:'Marrom',pron:'bráun'},{en:'Gray',pt:'Cinza',pron:'grêi'},{en:'Gold',pt:'Dourado',pron:'gôuld'},{en:'Silver',pt:'Prata',pron:'síl-ver'},{en:'Light',pt:'Claro',pron:'láit'},{en:'Dark',pt:'Escuro',pron:'dárk'},{en:'Beige',pt:'Bege',pron:'bêij'}],
  tempo: [{en:'Monday',pt:'Segunda',pron:'mân-dei'},{en:'Friday',pt:'Sexta',pron:'frái-dei'},{en:'Sunday',pt:'Domingo',pron:'sân-dei'},{en:'January',pt:'Janeiro',pron:'djé-niu-eri'},{en:'July',pt:'Julho',pron:'dju-lái'},{en:'December',pt:'Dezembro',pron:'di-sêm-ber'},{en:'Week',pt:'Semana',pron:'uík'},{en:'Month',pt:'Mês',pron:'mânth'},{en:'Today',pt:'Hoje',pron:'tu-dêi'},{en:'Tomorrow',pt:'Amanhã',pron:'tu-mó-rou'},{en:'Yesterday',pt:'Ontem',pron:'iés-ter-dei'},{en:'Morning',pt:'Manhã',pron:'mór-ning'},{en:'Night',pt:'Noite',pron:'náit'},{en:'Year',pt:'Ano',pron:'íer'},{en:'Hour',pt:'Hora',pron:'áuer'},{en:'Minute',pt:'Minuto',pron:'mí-nit'}],
  tecnologia: [{en:'Computer',pt:'Computador',pron:'kom-piú-ter'},{en:'Phone',pt:'Celular',pron:'fôun'},{en:'Internet',pt:'Internet',pron:'ín-ter-net'},{en:'Screen',pt:'Tela',pron:'skrín'},{en:'Keyboard',pt:'Teclado',pron:'kí-bord'},{en:'App',pt:'Aplicativo',pron:'ép'},{en:'Password',pt:'Senha',pron:'pés-uord'},{en:'Wi-Fi',pt:'Wi-Fi',pron:'uái-fai'},{en:'Mouse',pt:'Mouse',pron:'máus'},{en:'File',pt:'Arquivo',pron:'fáil'},{en:'Email',pt:'E-mail',pron:'í-meil'},{en:'Camera',pt:'Câmera',pron:'ké-me-ra'},{en:'Battery',pt:'Bateria',pron:'bé-te-ri'},{en:'Charger',pt:'Carregador',pron:'tchár-djer'},{en:'Website',pt:'Site',pron:'uéb-sait'},{en:'Button',pt:'Botão',pron:'bâ-ton'}],
  saude: [{en:'Doctor',pt:'Médico',pron:'dók-tor'},{en:'Medicine',pt:'Remédio',pron:'méd-sin'},{en:'Hospital',pt:'Hospital',pron:'rós-pi-tal'},{en:'Pain',pt:'Dor',pron:'pêin'},{en:'Fever',pt:'Febre',pron:'fí-ver'},{en:'Health',pt:'Saúde',pron:'rélth'},{en:'Nurse',pt:'Enfermeiro',pron:'nârs'},{en:'Pill',pt:'Comprimido',pron:'píl'},{en:'Headache',pt:'Dor de cabeça',pron:'réd-eik'},{en:'Cough',pt:'Tosse',pron:'kóf'},{en:'Cold',pt:'Resfriado',pron:'kôuld'},{en:'Blood',pt:'Sangue',pron:'blâd'},{en:'Bandage',pt:'Curativo',pron:'bén-didj'},{en:'Vaccine',pt:'Vacina',pron:'vék-sin'},{en:'Rest',pt:'Descanso',pron:'rést'},{en:'Sick',pt:'Doente',pron:'sík'}],
  financas: [{en:'Money',pt:'Dinheiro',pron:'mâ-ni'},{en:'Bank',pt:'Banco',pron:'bénk'},{en:'Card',pt:'Cartão',pron:'kárd'},{en:'Cash',pt:'Dinheiro vivo',pron:'kéx'},{en:'Price',pt:'Preço',pron:'práis'},{en:'Salary',pt:'Salário',pron:'sé-la-ri'},{en:'Loan',pt:'Empréstimo',pron:'lôun'},{en:'Coin',pt:'Moeda',pron:'kóin'},{en:'Bill',pt:'Conta',pron:'bíl'},{en:'Debt',pt:'Dívida',pron:'dét'},{en:'Save',pt:'Economizar',pron:'sêiv'},{en:'Buy',pt:'Comprar',pron:'bái'},{en:'Sell',pt:'Vender',pron:'sél'},{en:'Tax',pt:'Imposto',pron:'téks'},{en:'Wallet',pt:'Carteira',pron:'uó-let'},{en:'Change',pt:'Troco',pron:'tchêindj'}],
  arte: [{en:'Music',pt:'Música',pron:'miú-zik'},{en:'Song',pt:'Canção',pron:'sóng'},{en:'Painting',pt:'Pintura',pron:'pêin-ting'},{en:'Dance',pt:'Dança',pron:'déns'},{en:'Movie',pt:'Filme',pron:'mú-vi'},{en:'Art',pt:'Arte',pron:'árt'},{en:'Theater',pt:'Teatro',pron:'thí-a-ter'},{en:'Stage',pt:'Palco',pron:'stêidj'},{en:'Guitar',pt:'Violão',pron:'gui-tár'},{en:'Piano',pt:'Piano',pron:'pi-é-nou'},{en:'Actor',pt:'Ator',pron:'ék-tor'},{en:'Drawing',pt:'Desenho',pron:'dró-ing'},{en:'Concert',pt:'Show',pron:'kón-sert'},{en:'Photo',pt:'Foto',pron:'fô-tou'},{en:'Poem',pt:'Poema',pron:'pôu-em'},{en:'Brush',pt:'Pincel',pron:'brâch'}],
  cidade: [{en:'Street',pt:'Rua',pron:'strít'},{en:'Building',pt:'Prédio',pron:'bíl-ding'},{en:'Park',pt:'Parque',pron:'párk'},{en:'Store',pt:'Loja',pron:'stór'},{en:'Market',pt:'Mercado',pron:'már-ket'},{en:'Square',pt:'Praça',pron:'skuér'},{en:'Bridge',pt:'Ponte',pron:'bridj'},{en:'Corner',pt:'Esquina',pron:'kór-ner'},{en:'Traffic',pt:'Trânsito',pron:'tré-fik'},{en:'Sidewalk',pt:'Calçada',pron:'sáid-uok'},{en:'Station',pt:'Estação',pron:'stêi-shon'},{en:'Mall',pt:'Shopping',pron:'mól'},{en:'Sign',pt:'Placa',pron:'sáin'},{en:'Fountain',pt:'Chafariz',pron:'fáun-tin'},{en:'Avenue',pt:'Avenida',pron:'é-ve-niu'},{en:'Crosswalk',pt:'Faixa de pedestre',pron:'krós-uok'}],
  culinaria: [{en:'Recipe',pt:'Receita',pron:'ré-si-pi'},{en:'Oven',pt:'Forno',pron:'â-ven'},{en:'Pan',pt:'Panela/Frigideira',pron:'pén'},{en:'Knife',pt:'Faca',pron:'náif'},{en:'Spoon',pt:'Colher',pron:'spún'},{en:'Fork',pt:'Garfo',pron:'fórk'},{en:'Plate',pt:'Prato',pron:'plêit'},{en:'Salt',pt:'Sal',pron:'sólt'},{en:'Cup',pt:'Xícara',pron:'kâp'},{en:'Bowl',pt:'Tigela',pron:'bôul'},{en:'Boil',pt:'Ferver',pron:'bóil'},{en:'Fry',pt:'Fritar',pron:'frái'},{en:'Bake',pt:'Assar',pron:'bêik'},{en:'Flour',pt:'Farinha',pron:'fláuer'},{en:'Taste',pt:'Sabor',pron:'têist'},{en:'Pepper',pt:'Pimenta',pron:'pé-per'}],
  selva: [{en:'Lion',pt:'Leão',pron:'lái-on'},{en:'Tiger',pt:'Tigre',pron:'tái-guer'},{en:'Monkey',pt:'Macaco',pron:'mân-ki'},{en:'Snake',pt:'Cobra',pron:'snêik'},{en:'Elephant',pt:'Elefante',pron:'é-le-fant'},{en:'Jaguar',pt:'Onça',pron:'djé-guar'},{en:'Parrot',pt:'Papagaio',pron:'pé-rot'},{en:'Frog',pt:'Sapo',pron:'fróg'},{en:'Gorilla',pt:'Gorila',pron:'go-rí-la'},{en:'Zebra',pt:'Zebra',pron:'zí-bra'},{en:'Crocodile',pt:'Crocodilo',pron:'kró-ko-dail'},{en:'Leopard',pt:'Leopardo',pron:'lé-pard'},{en:'Turtle',pt:'Tartaruga',pron:'târ-tou'},{en:'Toucan',pt:'Tucano',pron:'tú-ken'},{en:'Butterfly',pt:'Borboleta',pron:'bâ-ter-flai'},{en:'Hippo',pt:'Hipopótamo',pron:'rí-pou'}],
  negocios: [{en:'Meeting',pt:'Reunião',pron:'mí-ting'},{en:'Deal',pt:'Negócio/Acordo',pron:'díl'},{en:'Client',pt:'Cliente',pron:'klái-ent'},{en:'Profit',pt:'Lucro',pron:'pró-fit'},{en:'Company',pt:'Empresa',pron:'kâm-pa-ni'},{en:'Market',pt:'Mercado',pron:'már-ket'},{en:'Boss',pt:'Chefe',pron:'bós'},{en:'Report',pt:'Relatório',pron:'ri-pórt'},{en:'Sales',pt:'Vendas',pron:'sêils'},{en:'Budget',pt:'Orçamento',pron:'bâ-djet'},{en:'Goal',pt:'Meta',pron:'gôul'},{en:'Contract',pt:'Contrato',pron:'kón-trekt'},{en:'Product',pt:'Produto',pron:'pró-dâkt'},{en:'Customer',pt:'Cliente',pron:'kâs-to-mer'},{en:'Invoice',pt:'Fatura',pron:'ín-vois'},{en:'Strategy',pt:'Estratégia',pron:'strá-te-dji'}],
  viagem: [{en:'Trip',pt:'Viagem',pron:'tríp'},{en:'Hotel',pt:'Hotel',pron:'rou-tél'},{en:'Flight',pt:'Voo',pron:'fláit'},{en:'Map',pt:'Mapa',pron:'mép'},{en:'Beach',pt:'Praia',pron:'bích'},{en:'Luggage',pt:'Bagagem',pron:'lâ-guidj'},{en:'Passport',pt:'Passaporte',pron:'pés-port'},{en:'Ticket',pt:'Passagem',pron:'tí-ket'},{en:'Tourist',pt:'Turista',pron:'tú-rist'},{en:'Suitcase',pt:'Mala',pron:'sút-keis'},{en:'Guide',pt:'Guia',pron:'gáid'},{en:'Border',pt:'Fronteira',pron:'bór-der'},{en:'Journey',pt:'Jornada',pron:'djâr-ni'},{en:'Visa',pt:'Visto',pron:'ví-za'},{en:'Souvenir',pt:'Lembrança',pron:'su-ve-nír'},{en:'Currency',pt:'Moeda',pron:'kâ-ren-si'}],
  lugares: [{en:'Home',pt:'Casa/Lar',pron:'rôum'},{en:'School',pt:'Escola',pron:'skúl'},{en:'Office',pt:'Escritório',pron:'ó-fis'},{en:'Airport',pt:'Aeroporto',pron:'ér-port'},{en:'Station',pt:'Estação',pron:'stêi-shon'},{en:'Library',pt:'Biblioteca',pron:'lái-bre-ri'},{en:'Church',pt:'Igreja',pron:'chârch'},{en:'Museum',pt:'Museu',pron:'miu-zí-um'},{en:'Restaurant',pt:'Restaurante',pron:'rés-to-rant'},{en:'Gym',pt:'Academia',pron:'djím'},{en:'Farm',pt:'Fazenda',pron:'fárm'},{en:'Bakery',pt:'Padaria',pron:'bêi-ke-ri'},{en:'Zoo',pt:'Zoológico',pron:'zú'},{en:'Cinema',pt:'Cinema',pron:'sí-ne-ma'},{en:'Pharmacy',pt:'Farmácia',pron:'fár-ma-si'},{en:'Bank',pt:'Banco',pron:'bénk'}],
  estacoes: [{en:'Summer',pt:'Verão',pron:'sâ-mer'},{en:'Winter',pt:'Inverno',pron:'uín-ter'},{en:'Spring',pt:'Primavera',pron:'spríng'},{en:'Autumn',pt:'Outono',pron:'ó-tâm'},{en:'Rain',pt:'Chuva',pron:'rêin'},{en:'Snow',pt:'Neve',pron:'snôu'},{en:'Wind',pt:'Vento',pron:'uínd'},{en:'Hot',pt:'Quente',pron:'rót'},{en:'Cold',pt:'Frio',pron:'kôuld'},{en:'Warm',pt:'Morno',pron:'uórm'},{en:'Storm',pt:'Tempestade',pron:'stórm'},{en:'Cloud',pt:'Nuvem',pron:'kláud'},{en:'Sunny',pt:'Ensolarado',pron:'sâ-ni'},{en:'Fog',pt:'Neblina',pron:'fóg'},{en:'Ice',pt:'Gelo',pron:'áis'},{en:'Rainbow',pt:'Arco-íris',pron:'rêin-bou'}],
}

// Falsos cognatos (palavras que enganam o brasileiro).
const falsosCognatos = [
  {en:'Actually',parece:'Atualmente',significa:'Na verdade',dica:'"Atualmente" em inglês é currently.'},
  {en:'Pretend',parece:'Pretender',significa:'Fingir',dica:'"Pretender" é to intend / to plan.'},
  {en:'Push',parece:'Puxar',significa:'Empurrar',dica:'"Puxar" é to pull.'},
  {en:'Library',parece:'Livraria',significa:'Biblioteca',dica:'"Livraria" é bookstore.'},
  {en:'Parents',parece:'Parentes',significa:'Pais (mãe e pai)',dica:'"Parentes" são relatives.'},
  {en:'Realize',parece:'Realizar',significa:'Perceber, dar-se conta',dica:'"Realizar" é to accomplish.'},
  {en:'Fabric',parece:'Fábrica',significa:'Tecido',dica:'"Fábrica" é factory.'},
  {en:'Lunch',parece:'Lanche',significa:'Almoço',dica:'"Lanche" é a snack.'},
  {en:'Exit',parece:'Êxito',significa:'Saída',dica:'"Êxito" é success.'},
  {en:'Novel',parece:'Novela',significa:'Romance (livro)',dica:'"Novela" é soap opera.'},
  {en:'College',parece:'Colégio',significa:'Faculdade',dica:'"Colégio" é high school.'},
  {en:'Attend',parece:'Atender',significa:'Comparecer, assistir',dica:'"Atender" o telefone é to answer.'},
  {en:'Sensible',parece:'Sensível',significa:'Sensato',dica:'"Sensível" é sensitive.'},
  {en:'Eventually',parece:'Eventualmente',significa:'No fim, por fim',dica:'"Eventualmente" é occasionally.'},
  {en:'Actual',parece:'Atual',significa:'Real, verdadeiro',dica:'"Atual" é current.'},
  {en:'Costume',parece:'Costume',significa:'Fantasia, traje',dica:'"Costume" (hábito) é habit.'},
  {en:'Injury',parece:'Injúria',significa:'Lesão, machucado',dica:'"Injúria" (ofensa) é insult.'},
  {en:'Mayor',parece:'Maior',significa:'Prefeito',dica:'"Maior" é bigger / larger.'},
  {en:'Policy',parece:'Polícia',significa:'Política, apólice',dica:'"Polícia" é the police.'},
  {en:'Support',parece:'Suportar',significa:'Apoiar',dica:'"Suportar" (aguentar) é to tolerate.'},
  {en:'Data',parece:'Data',significa:'Dados, informações',dica:'"Data" do calendário é date.'},
  {en:'Cigar',parece:'Cigarro',significa:'Charuto',dica:'"Cigarro" é cigarette.'},
  {en:'Balcony',parece:'Balcão',significa:'Sacada, varanda',dica:'"Balcão" é counter.'},
  {en:'Notice',parece:'Notícia',significa:'Aviso; perceber',dica:'"Notícia" é news.'},
  {en:'Application',parece:'Aplicação (dinheiro)',significa:'Candidatura, inscrição',dica:'Aplicação financeira é investment.'},
  {en:'Assume',parece:'Assumir',significa:'Supor, presumir',dica:'Assumir um cargo é to take on.'},
  {en:'Compromise',parece:'Compromisso',significa:'Acordo, meio-termo',dica:'Compromisso é commitment.'},
  {en:'Discussion',parece:'Discussão (briga)',significa:'Conversa, debate',dica:'Discussão (briga) é an argument.'},
  {en:'Enroll',parece:'Enrolar',significa:'Matricular-se, inscrever-se',dica:'Enrolar é to roll up.'},
  {en:'Intend',parece:'Entender',significa:'Pretender, ter a intenção',dica:'Entender é to understand.'},
  {en:'Journal',parece:'Jornal',significa:'Diário, revista científica',dica:'Jornal é newspaper.'},
  {en:'Large',parece:'Largo',significa:'Grande',dica:'Largo é wide.'},
  {en:'Lecture',parece:'Leitura',significa:'Palestra, aula',dica:'Leitura é reading.'},
  {en:'Pasta',parece:'Pasta (arquivo)',significa:'Massa, macarrão',dica:'Pasta de arquivo é folder.'},
  {en:'Prejudice',parece:'Prejuízo',significa:'Preconceito',dica:'Prejuízo é loss / damage.'},
  {en:'Preservative',parece:'Preservativo',significa:'Conservante',dica:'Preservativo é condom.'},
  {en:'Resume',parece:'Resumo',significa:'Retomar; currículo',dica:'Resumo é summary.'},
  {en:'Retire',parece:'Retirar',significa:'Aposentar-se',dica:'Retirar é to remove.'},
  {en:'Terrific',parece:'Terrível',significa:'Ótimo, incrível',dica:'Terrível é terrible.'},
  {en:'Deception',parece:'Decepção',significa:'Engano, fraude',dica:'Decepção é disappointment.'},
  {en:'Scholar',parece:'Escolar',significa:'Estudioso, acadêmico',dica:'Escolar é school (adjetivo).'},
  {en:'Tenant',parece:'Tenente',significa:'Inquilino',dica:'Tenente é lieutenant.'},
]
// Expressões mais usadas no dia a dia.
const expressoes = [
  {en:"How's it going?",pt:'E aí? / Como vai?',ex:"Hey! How's it going today?"},
  {en:'Never mind',pt:'Deixa pra lá',ex:'Never mind, I already fixed it.'},
  {en:"It's up to you",pt:'Você que sabe',ex:"We can go now or later — it's up to you."},
  {en:'No worries',pt:'Sem problema, relaxa',ex:'No worries, take your time.'},
  {en:"I'm on my way",pt:'Estou a caminho',ex:"I'm on my way, be there in 5."},
  {en:"What's up?",pt:'E aí? / Beleza?',ex:"Hey man, what's up?"},
  {en:'Take it easy',pt:'Vai com calma / Se cuida',ex:'Take it easy, we have plenty of time.'},
  {en:'By the way',pt:'A propósito / Aliás',ex:'By the way, did you call her?'},
  {en:'Kind of',pt:'Mais ou menos / Meio que',ex:'"Are you tired?" "Kind of."'},
  {en:'Look forward to',pt:'Estar ansioso por',ex:'I look forward to seeing you.'},
  {en:'As soon as possible',pt:'O quanto antes',ex:'Please reply as soon as possible.'},
  {en:'Once in a while',pt:'De vez em quando',ex:'I eat out once in a while.'},
  {en:'Piece of cake',pt:'Moleza, muito fácil',ex:'The test was a piece of cake.'},
  {en:'Break a leg',pt:'Boa sorte!',ex:'Show tonight? Break a leg!'},
  {en:'Get in touch',pt:'Entrar em contato',ex:"I'll get in touch next week."},
  {en:'Figure out',pt:'Descobrir / Entender',ex:"I can't figure out this problem."},
  {en:'Show up',pt:'Aparecer, comparecer',ex:"He didn't show up to the meeting."},
  {en:'Run out of',pt:'Ficar sem',ex:'We ran out of milk.'},
  {en:'Catch up',pt:'Colocar o papo em dia',ex:"Let's grab a coffee and catch up."},
  {en:'Hang out',pt:'Passar um tempo, sair',ex:'We hung out at the mall.'},
  {en:'Make sense',pt:'Fazer sentido',ex:'That explanation makes sense now.'},
  {en:'Give up',pt:'Desistir',ex:"Don't give up, you're almost there."},
  {en:'On purpose',pt:'De propósito',ex:"Sorry, I didn't do it on purpose."},
  {en:'Right away',pt:'Imediatamente / Já já',ex:"I'll send it right away."},
  {en:'Let me know',pt:'Me avisa',ex:'Let me know if you need help.'},
  {en:"I can't wait",pt:'Mal posso esperar',ex:"I can't wait to see you!"},
  {en:"It doesn't matter",pt:'Não importa / Tanto faz',ex:"It doesn't matter, choose any."},
  {en:'Are you kidding?',pt:'Tá brincando?',ex:"Are you kidding? That's amazing!"},
  {en:"I'm not sure",pt:'Não tenho certeza',ex:"I'm not sure about that."},
  {en:'Go ahead',pt:'Pode ir / Manda ver',ex:"Go ahead, I'm listening."},
  {en:'Sounds good',pt:'Parece bom / Fechou',ex:'Dinner at 8? Sounds good!'},
  {en:'No big deal',pt:'Não é grande coisa',ex:"It's no big deal, don't worry."},
  {en:'Keep in mind',pt:'Tenha em mente',ex:'Keep in mind it closes at 6.'},
  {en:'Out of the blue',pt:'Do nada',ex:'She called me out of the blue.'},
  {en:'Make up your mind',pt:'Se decida',ex:'Come on, make up your mind!'},
  {en:"It's worth it",pt:'Vale a pena',ex:"It's expensive, but it's worth it."},
  {en:'Better late than never',pt:'Antes tarde do que nunca',ex:'You did it — better late than never!'},
  {en:'So far so good',pt:'Até agora tudo bem',ex:'So far so good with the project.'},
  {en:'Come on',pt:'Vai / Qual é / Anda',ex:"Come on, we're going to be late!"},
  {en:'You made it!',pt:'Você conseguiu!',ex:'You passed? You made it!'},
  {en:'In the long run',pt:'A longo prazo',ex:'It pays off in the long run.'},
  {en:'Take care',pt:'Se cuida',ex:'Bye! Take care!'},
]
// "Como soa" aportuguesado — curado à mão para as palavras mais comuns do dicionário.
// Só mostra quando a palavra está aqui (aproximação errada ensinaria errado).
const COMO_SOA: Record<string, string> = {
  house: 'ráuss', water: 'uórer', chair: 'tchér', table: 'têibol', window: 'uíndou',
  door: 'dór', kitchen: 'quítchen', bed: 'béd', bathroom: 'béf-rum', bedroom: 'béd-rum',
  lamp: 'lémp', mirror: 'míror', curtain: 'quérten', drawer: 'dróer', carpet: 'cárpet',
  sofa: 'sôufa', clock: 'clóc', rug: 'râg', lawn: 'lón', garden: 'gárden',
  food: 'fúud', bread: 'bréd', chicken: 'tchíquen', orange: 'órindj', apple: 'épol',
  juice: 'djúss', cheese: 'tchíiz', rice: 'ráiss', beans: 'bíinz', meat: 'míit',
  fish: 'fích', egg: 'égg', milk: 'mílk', sugar: 'chúgar', salt: 'sólt',
  head: 'réd', hair: 'rér', eye: 'ái', mouth: 'máuf', teeth: 'tíif',
  tooth: 'túuf', heart: 'rárt', hand: 'rénd', foot: 'fút', shoulder: 'chôulder',
  stomach: 'stâmec', knee: 'níi', throat: 'frôut',
  dog: 'dóg', cat: 'quét', bird: 'bêrd', horse: 'rórss', monkey: 'mânqui',
  lion: 'láion', bear: 'bér', snake: 'snêic', turtle: 'têrtol', rabbit: 'rébit',
  car: 'cár', bus: 'bâss', train: 'trêin', plane: 'plêin', airplane: 'érplein',
  bicycle: 'báissicol', motorcycle: 'môutor-sáicol', subway: 'sâbuei', ship: 'chíp',
  shirt: 'chért', shoes: 'chúuz', dress: 'dréss', pants: 'pénts', socks: 'sócs',
  jacket: 'djéquet', skirt: 'squért', hat: 'rét', glasses: 'glésses', belt: 'bélt',
  school: 'scúul', teacher: 'títcher', book: 'búc', pencil: 'pénsol', notebook: 'nôutbuc',
  student: 'stúdent', classroom: 'cléss-rum', homework: 'rôum-uerc',
  tree: 'tríi', flower: 'fláuer', sun: 'sân', moon: 'múun', beach: 'bíitch',
  mountain: 'máunten', river: 'ríver', forest: 'fórest', island: 'áilend', sky: 'scái',
  soccer: 'sóquer', basketball: 'bésquet-ból', volleyball: 'vôlibol', swimming: 'suíming',
  doctor: 'dóctor', nurse: 'nêrss', lawyer: 'lóier', engineer: 'endjiníir',
  driver: 'dráiver', chef: 'chéf', firefighter: 'fáier-fáiter',
  happy: 'répi', sad: 'séd', angry: 'éngri', tired: 'táierd', scared: 'squérd',
  excited: 'ecssáited', worried: 'uôrid', proud: 'práud',
  red: 'réd', blue: 'blú', green: 'gríin', yellow: 'iélou', purple: 'pêrpol',
  white: 'uáit', black: 'bléc', brown: 'bráun', gray: 'grêi', pink: 'pínc',
  monday: 'mândei', tuesday: 'túzdei', wednesday: 'uénzdei', thursday: 'fêrzdei',
  friday: 'fráidei', saturday: 'séterdei', sunday: 'sândei', january: 'djénueri',
  february: 'fébrueri', august: 'óguest',
  computer: 'compiúrer', phone: 'fôun', mouse: 'máuss', keyboard: 'quíbord',
  internet: 'ínternet', screen: 'scríin', password: 'péss-uerd', email: 'ímeil',
  medicine: 'médissin', hospital: 'róspital', headache: 'réd-eic', fever: 'fíver',
  money: 'mâni', bank: 'bénc', credit: 'crédit', price: 'práiss', cash: 'quéch',
  street: 'stríit', city: 'círi', building: 'bílding', square: 'squér', bridge: 'brídj',
  travel: 'trévol', airport: 'érport', hotel: 'routél', ticket: 'tíquet', passport: 'pésport',
  luggage: 'lâguidj', trip: 'tríp',
  rain: 'rêin', snow: 'snôu', wind: 'uínd', cloud: 'cláud', storm: 'stórm',
  hot: 'rót', cold: 'côuld', warm: 'uórm', weather: 'uéder',
  world: 'uêrld', work: 'uêrc', three: 'fríi (língua nos dentes!)', thanks: 'fénks (língua nos dentes!)',
  through: 'frú (língua nos dentes!)', together: 'tuguéder', beautiful: 'biúriful',
  comfortable: 'cômf-tebol', vegetable: 'védj-tebol', chocolate: 'tchóc-let',
  interesting: 'íntresting', restaurant: 'réstront', business: 'bíznes', clothes: 'clôuz',
}

// Um texto "parece inglês"? Regra conservadora para NUNCA ler português com voz de
// inglês (fica muito estranho): acento/çãõ = português; frase só é inglês se tiver
// sinal claro (palavra funcional inglesa ou contração); palavra solta vale se não
// for português conhecido. Na dúvida, fica em silêncio — melhor que falar errado.
function textoEmIngles(t: string): boolean {
  if (!t || !/[a-z]/i.test(t)) return false
  if (/[ãõçáéíóúâêôàü]/i.test(t)) return false
  const limpo = t.trim()
  // Contração inglesa (I'm, don't, it's) = sinal fortíssimo, decide sozinha.
  if (/[a-z]'(s|t|m|re|ve|ll|d)\b/i.test(limpo)) return true
  // Palavras que SÓ existem em português (ambíguas como no/do/a/as ficam de fora das duas listas).
  const ptSoPt = /\b(que|voce|nao|uma|um|meu|minha|seu|sua|ele|ela|eu|se|os|ou|mas|em|na|da|de|por|ao|ser|estar|ter|foi|era|isso|esse|essa|muito|mais|verdade|quando|algo|tipo|meio|fim|frase|passado|presente|futuro|sentido|motivo|objeto|emprego|oposto|verbo|sujeito|puxe|puxar|empurre|empurrar|pare|parar|atualmente|eventualmente|dois|soam|dentes|resfriado|resfriada|constrangida|intestino|cozinheiro|anos|dias|casa|pergunta|resposta|certa|errada|nenhuma|porque|onde|fazer|trabalho|escola|festa|pessoas|palavra|mudo|soprado|bom|boa|dia|noite|tarde|prazer|obrigado|obrigada|oi|ola|tchau|gato|cachorro|comida|livro|grande|pequeno|homem|mulher|feliz|triste|ontem|hoje|sempre|nunca|tempo|cedo|moro|morar|gosto|quero|tenho|estou|vou|com|sem|para|pelo|pela|antes|depois|entre|sobre|pode|coisa|forma|maneira|exemplo|apenas|nada|tudo|outro|outra|acordo|termo|significa|geralmente|normalmente)\b/i
  if (ptSoPt.test(limpo)) return false
  const palavras = limpo.split(/\s+/).filter(Boolean)
  // Palavra solta: só fala se tiver "ortografia de inglês" (letras/dígrafos que o
  // português não usa) OU estiver na whitelist de palavras inglesas frequentes.
  // "Gaveta"/"Janela" ficam mudas; "week"/"Sister"/"Seven" falam.
  if (palavras.length === 1) {
    if (!/^[a-z][a-z'-]{1,}[.!?]?$/i.test(limpo)) return false
    const soLetras = limpo.toLowerCase().replace(/[.!?]+$/, '')
    const enComuns = /^(hi|bye|am|is|are|was|were|has|had|did|done|been|goes|went|ate|ran|saw|made|took|came|gave|got|said|told|drank|drove|wrote|read|sang|swam|sat|met|left|felt|kept|slept|paid|sold|built|sent|spent|lost|won|one|two|four|five|six|seven|eight|nine|ten|red|purple|orange|sister|brother|husband|uncle|aunt|cousin|son|march|april|june|august|september|october|november|december|monday|rice|bread|egg|milk|meat|arm|leg|ear|nose|hand|foot|toe|head|dog|cat|sun|rain|man|men|car|bus|cup|pen|bed|hat|map|job|fun|run|sit|eat|hot|cold|big|tall|old|new|sad|bad|mine|hers|ours|theirs|an|in|on|at|can|have|ever|blue|forest|generous)$/
    if (enComuns.test(soLetras)) return true
    return /[kwy]|ee|oo|th|sh|gh|ck|ll|tt|ph|wh|ay|ey|ow|aw|igh|ing\b|'s\b/i.test(limpo)
  }
  // Frase só é falada se tiver sinal claro de inglês; sem sinal = silêncio (nunca lê PT).
  const sinalEN = /\b(the|is|are|was|were|be|been|you|i|my|your|he|she|it|we|they|an|to|of|in|on|at|does|did|have|has|had|and|not|this|that|these|those|what|how|where|when|who|why|good|hello|hi|thank|thanks|please|yes|his|her|our|their|for|with|from|make|take|get|go|let|see|like|need|meet|nice|day|off|one|will|would|can|could|should)\b/i
  return sinalEN.test(limpo)
}

// Escolhe a melhor voz em inglês do aparelho. A padrão costuma ser robótica; vozes
// "Natural" (Windows/Edge) e "Google" (Android/Chrome) soam muito melhor.
function melhorVozEN(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const vs = window.speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang))
  if (!vs.length) return null
  const nota = (v: SpeechSynthesisVoice) => {
    let n = 0
    if (/natural|neural|premium|enhanced/i.test(v.name)) n -= 40
    if (/google/i.test(v.name)) n -= 20
    if (/en[-_]US/i.test(v.lang)) n -= 10
    if (/samantha|aria|jenny|ava/i.test(v.name)) n -= 5
    return n
  }
  return [...vs].sort((a, b) => nota(a) - nota(b))[0]
}
function falarNavegador(text: string, rate = 0.95, onend?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onend?.(); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'; u.rate = rate
  const v = melhorVozEN(); if (v) u.voice = v
  if (onend) { u.onend = onend; u.onerror = onend }
  window.speechSynthesis.speak(u)
}

function DictCard({word,color='#534AB7'}:{word:{en:string;pt:string;pron:string};color?:string}) {
  function speak(){falarNavegador(word.en, 0.85)}
  // Alguns registros já vêm com as barras (/x/) e outros não — normaliza para exibir /x/ uma única vez.
  const pron = (word.pron || '').replace(/^\/+|\/+$/g, '')
  const traducao = word.pt ? word.pt.charAt(0).toUpperCase() + word.pt.slice(1) : ''
  const soa = COMO_SOA[(word.en || '').toLowerCase().trim()]
  return(
    <div onClick={speak} style={{background:`linear-gradient(150deg, ${color}12, var(--color-background-primary) 62%)`,border:'0.5px solid var(--color-border-tertiary)',borderLeft:`4px solid ${color}`,borderRadius:16,padding:'14px 15px',cursor:'pointer',boxShadow:'0 3px 10px rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
        <div style={{fontSize:19,fontWeight:800,color:'var(--color-text-primary)',lineHeight:1.15}}>{word.en}</div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();falarNavegador(word.en,0.55)}} aria-label="Ouvir devagar" style={{background:color+'0D',color,border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic e="🐢" c={color} s={15} /></button>
          <button onClick={e=>{e.stopPropagation();speak()}} aria-label="Ouvir" style={{background:color+'1A',color,border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic e="🔊" c={color} s={15} /></button>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginTop:7}}>
        <span style={{display:'inline-block',fontSize:11.5,color,fontStyle:'italic',fontWeight:600,background:color+'14',padding:'2px 9px',borderRadius:10}}>/{pron}/</span>
        {soa && <span style={{display:'inline-block',fontSize:11.5,color:'#8A5A10',fontWeight:700,background:'#FEF3E2',padding:'2px 9px',borderRadius:10}}>🇧🇷 soa "{soa}"</span>}
      </div>
      <div style={{fontSize:14,color:'var(--color-text-secondary)',marginTop:8}}>{traducao}</div>
    </div>
  )
}

function DictTab({dictCat,setDictCat}:{dictCat:string;setDictCat:(c:string)=>void}) {
  const [words,setWords]=useState<{en:string;pt:string;pron:string}[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    setLoading(true)
    supabase.from('dicionario').select('en,pt,pron').eq('categoria',dictCat).order('en')
      .then(({data})=>{setWords(data&&data.length?data:(DICT_LOCAL[dictCat]||[]));setLoading(false)})
  },[dictCat])
  const [dictMode,setDictMode]=useState<'palavras'|'cognatos'|'expressoes'>('palavras')
  const cc = dictColor[dictCat] || '#534AB7'
  const headC = dictMode==='cognatos' ? '#C2410C' : dictMode==='expressoes' ? '#0D9488' : cc
  const semanaDict = Math.floor(Date.now() / (7 * 86400000))
  const rota = (arr:any[], n:number):any[] => { const a=[...arr]; let s=semanaDict*131+7; for(let i=a.length-1;i>0;i--){s=(s*9301+49297)%233280;const j=Math.floor(s/233280*(i+1));const t=a[i];a[i]=a[j];a[j]=t} return a.slice(0,n) }
  const weekWords = rota(words, 10)
  const weekCog = rota(falsosCognatos, 8)
  const weekExp = rota(expressoes, 8)
  const falarEN = (t:string) => falarNavegador(t, 0.9)
  const subt = dictMode==='cognatos' ? 'Palavras que enganam o brasileiro' : dictMode==='expressoes' ? 'O que os nativos realmente dizem' : 'Toque na palavra para ouvir'
  return(
    <div>
      <div style={{background:headC,padding:'20px 16px 16px',transition:'background 0.3s',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:-14,top:-8,opacity:0.14,pointerEvents:'none'}}><Ic e={dictMode==='cognatos'?'🪤':dictMode==='expressoes'?'💬':'📖'} c="#fff" s={112} /></div>
        <div style={{fontSize:18,fontWeight:700,color:'#fff',position:'relative'}}>Dicionário</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',marginTop:2,position:'relative'}}>{subt}</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,background:'rgba(255,255,255,0.2)',padding:'6px 13px',borderRadius:20}}>
          <span style={{fontSize:13}}>🔄</span>
          <span style={{fontSize:12,color:'#fff',fontWeight:600}}>Muda toda semana</span>
        </div>
      </div>
      <div style={{padding:16}}>
        <div style={{display:'flex',gap:5,marginBottom:14,background:'var(--color-background-secondary)',padding:4,borderRadius:12}}>
          {([['palavras','Palavras'],['cognatos','Falsos amigos'],['expressoes','Expressões']] as const).map(([m,l])=>(
            <button key={m} onClick={()=>setDictMode(m)} style={{flex:1,padding:'8px 0',borderRadius:9,border:'none',background:dictMode===m?headC:'transparent',color:dictMode===m?'#fff':'var(--color-text-secondary)',fontSize:12.5,fontWeight:dictMode===m?700:500,cursor:'pointer',fontFamily:'inherit',transition:'background 0.2s'}}>{l}</button>
          ))}
        </div>
        {dictMode==='palavras' && (<>
          <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:4}}>
            {dictCatList.map(c=>(
              <button key={c.id} onClick={()=>setDictCat(c.id)} style={{padding:'7px 14px',border:dictCat===c.id?'none':'0.5px solid var(--color-border-tertiary)',borderRadius:20,background:dictCat===c.id?(dictColor[c.id]||'#534AB7'):'var(--color-background-primary)',color:dictCat===c.id?'#fff':'var(--color-text-secondary)',fontSize:13,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'inherit'}}><IcLabel label={c.label} /></button>
            ))}
          </div>
          {loading?<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[0,1,2,3,4,5].map(i=><div key={i} className="su-skel" style={{height:104,borderRadius:16}} />)}</div>:(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {weekWords.map((w,i)=><DictCard key={i} word={w} color={cc}/>)}
            </div>
          )}
        </>)}
        {dictMode==='cognatos' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {weekCog.map((c,i)=>(
              <div key={i} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderLeft:'4px solid #C2410C',borderRadius:14,padding:'14px 15px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
                  <div style={{fontSize:18,fontWeight:800,color:'var(--color-text-primary)'}}>{c.en}</div>
                  <span style={{fontSize:10,background:'#C2410C1A',color:'#C2410C',padding:'2px 9px',borderRadius:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.03em'}}>falso amigo</span>
                </div>
                <div style={{fontSize:13.5,color:'#C0392B',marginBottom:4}}>❌ Não é "{c.parece}"</div>
                <div style={{fontSize:13.5,color:'#16A34A',fontWeight:600}}>✅ Significa "{c.significa}"</div>
                <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:9,background:'var(--color-background-secondary)',borderRadius:9,padding:'8px 11px',lineHeight:1.5}}>💡 {c.dica}</div>
              </div>
            ))}
          </div>
        )}
        {dictMode==='expressoes' && (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {weekExp.map((x,i)=>(
              <div key={i} onClick={()=>falarEN(x.en)} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderLeft:'4px solid #0D9488',borderRadius:14,padding:'14px 15px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{fontSize:16.5,fontWeight:800,color:'var(--color-text-primary)',lineHeight:1.2}}>"{x.en}"</div>
                  <span style={{flexShrink:0}}><Ic e="🔊" c="#0D9488" s={16} /></span>
                </div>
                <div style={{fontSize:14,color:'#0D9488',fontWeight:600,marginTop:4}}>{x.pt}</div>
                <div style={{fontSize:12.5,color:'var(--color-text-secondary)',fontStyle:'italic',marginTop:6}}>Ex: "{x.ex}"</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const cefrByTitle: Record<string, string> = {
  "Saudações e apresentações": "A1",
  "Números de 1 a 100": "A1",
  "Cores e adjetivos básicos": "A1",
  "Família e pessoas": "A1",
  "Dias, meses e datas": "A1",
  "Comida e bebidas": "A1",
  "No restaurante": "A1",
  "Partes do corpo": "A1",
  "O verbo To Be": "A1",
  "Verbos do cotidiano": "A1",
  "Animais e natureza": "A1",
  "Profissões": "A1",
  "Tempo e clima": "A1",
  "Adjetivos de personalidade": "A2",
  "Transporte e direções": "A2",
  "Compras e dinheiro": "A2",
  "Preposições de tempo e lugar": "A2",
  "Question Words": "A2",
  "Vocabulário de saúde": "A2",
  "Comparativos e superlativos": "A2",
  "Vocabulário para viagens": "A2",
  "Present Perfect na prática": "B1",
  "Conditional — If clauses": "B1",
  "Phrasal verbs essenciais": "B1",
  "Passive Voice": "B1",
  "Reported Speech": "B1",
  "Modal Verbs": "B1",
  "Simple Past vs Present Perfect": "B1",
  "Tecnologia e internet": "B1",
  "Conectivos e coesão": "B1",
  "Make vs Do": "B1",
  "Inglês informal e gírias": "B2",
  "Expressões idiomáticas": "B2",
  "Vocabulário para negócios": "B2",
  "False Friends": "B2",
  "Registro formal vs informal": "B2",
  "Phrasal verbs avançados": "B2",
  "Inglês para entrevistas": "B2",
  "Escrita formal e acadêmica": "C1",
  "Subjuntivo em inglês": "C1",
  "Vocabulário acadêmico (AWL)": "C1",
  "Ironia e sarcasmo": "C1",
  "Discourse Markers": "C1",
  "Argumentação e debate": "C1",
  "Sotaques e variações": "C2",
  "Collocations naturais": "C2",
  "Conotação e nuance": "C2",
  "Metáforas e linguagem figurada": "C2",
  "Eufemismos e diplomacia": "C2",
  "Pronomes pessoais (sujeito)": "A1",
  "Demonstrativos (this/that)": "A1",
  "Verbo have got": "A1",
  "Advérbios de frequência (always/never)": "A2",
  "Imperativo (ordens)": "A2",
  "Will ou Going to?": "A2",
  "Past Perfect (had done)": "B1",
  "Pronomes reflexivos": "B1",
  "So, Such, Too e Enough": "B1",
  "Future Perfect e Continuous": "B2",
  "Modais perfeitos (should have)": "B2",
  "Conjunções de contraste": "B2",
  "Inversão condicional": "C1",
  "Particípios -ing vs -ed": "C1",
  "Expressões com get": "C1",
  "Provérbios e ditados": "C2",
  "Phrasal verbs idiomáticos": "C2",
  "Linguagem jurídica e formal": "C2",
  "Pronomes relativos": "B2",
  "Causativo: have/get it done": "B2",
  "Nominalização (estilo formal)": "C1",
  "Hedging: cautela acadêmica": "C1",
  "Artigos: a, an, the": "A1",
  "Plural dos substantivos": "A1",
  "There is / There are": "A1",
  "Pronomes possessivos": "A1",
  "Que horas são?": "A1",
  "Preposições de lugar": "A1",
  "Present Continuous vs Simple Present": "A2",
  "Futuro com 'going to'": "A2",
  "Quantificadores": "A2",
  "Used to (hábitos do passado)": "A2",
  "Gerúndio ou Infinitivo?": "B1",
  "Orações relativas": "B1",
  "Collocations comuns": "B2",
  "Mixed Conditionals": "C1",
  "Inversão para ênfase": "C1",
  "Linguagem diplomática": "C1",
  "Conotação: positivo x negativo": "C1",
  "Reduções na fala": "C2",
  "O alfabeto e os sons": "A1",
  "Pronomes pessoais": "A1",
  "Perguntas com To Be": "A1",
  "This / That / These / Those": "A1",
  "Descrevendo pessoas": "A1",
  "Números ordinais": "A1",
  "Preposições de tempo (at, on, in)": "A1",
  "Presente simples (rotina)": "A1",
  "Advérbios de frequência": "A1",
  "Perguntas no presente (Do/Does)": "A1",
  "Negativas no presente (don't/doesn't)": "A1",
  "A casa e os cômodos": "A1",
  "Móveis e objetos": "A1",
  "A cidade e os lugares": "A1",
  "Can / Can't (habilidade)": "A1",
  "Imperativo": "A1",
  "Como eu me sinto": "A1",
  "No médico": "A1",
  "Roupas e vestuário": "A1",
  "Passado de To Be (was/were)": "A2",
  "Passado simples — regulares": "A2",
  "Passado simples — irregulares": "A2",
  "Perguntas e negativas no passado": "A2",
  "Ago, last, yesterday": "A2",
  "Verbos de estado (love, want, know)": "A2",
  "Descrevendo o que está acontecendo": "A2",
  "Will (decisões e previsões)": "A2",
  "Will vs Going to": "A2",
  "Presente contínuo para o futuro": "A2",
  "As... as (igualdade)": "A2",
  "Too / enough": "A2",
  "Advérbios de modo": "A2",
  "Contáveis e incontáveis": "A2",
  "A few / a little / a lot of": "A2",
  "Recipientes e medidas": "A2",
  "And / but / because / so": "A2",
  "Adjetivos + preposições": "A2",
  "No aeroporto e no hotel": "A2",
  "No telefone": "A2",
  "Marcando encontros e horários": "A2",
  "Passado contínuo": "A2",
  "When / While": "A2",
  "Have to / don't have to": "A2",
  "Ever, never, just, already, yet": "B1",
  "For e Since": "B1",
  "Zero Conditional": "B1",
  "First Conditional": "B1",
  "Second Conditional": "B1",
  "Must / Have to (obrigação)": "B1",
  "Should / Ought to (conselho)": "B1",
  "May / Might (possibilidade)": "B1",
  "Can / Could / Be able to": "B1",
  "Verbos + preposição": "B1",
  "So / Such / Too / Enough": "B1",
  "Both / Either / Neither": "B1",
  "Meio ambiente e sustentabilidade": "B1",
  "Educação e estudos": "B1",
  "Trabalho e carreira": "B1",
  "Present Perfect Continuous": "B2",
  "Past Perfect": "B2",
  "Past Perfect Continuous": "B2",
  "Os tempos da narração": "B2",
  "Third Conditional": "B2",
  "I wish / If only": "B2",
  "Would rather / Had better": "B2",
  "Passiva avançada": "B2",
  "Causative (have it done)": "B2",
  "Reported speech avançado": "B2",
  "Reporting verbs": "B2",
  "Must / Can't have (dedução)": "B2",
  "Modais de probabilidade": "B2",
  "Used to / Would (hábitos)": "B2",
  "E-mails e comunicação escrita": "B2",
  "Reuniões e apresentações": "B2",
  "Cleft sentences": "C1",
  "Estruturas enfáticas": "C1",
  "Collocations avançadas": "C1",
  "Persuasão e retórica": "C1",
  "Stress e entonação": "C2",
  "Conexão de sons (linking)": "C2",
  "Estilística e tom": "C2",
  "Linguagem figurada": "C2",
  "Humor e trocadilhos": "C2",
  "Expressões idiomáticas raras": "C2",
  "Inglês técnico e jurídico": "C2",
  "Negociação avançada": "C2",
  "Oratória e discursos": "C2",
  "Redação de alto nível": "C2"
}

const placementQuestions = [{"lvl": "A1", "tipo": "G", "q": "\"___ name is John.\"", "opts": ["My", "Me", "I", "Mine"], "ans": 0, "ctx": ""}, {"lvl": "A1", "tipo": "G", "q": "\"She ___ a doctor.\"", "opts": ["am", "is", "are", "be"], "ans": 1, "ctx": ""}, {"lvl": "A1", "tipo": "G", "q": "\"There ___ two books on the table.\"", "opts": ["is", "am", "are", "be"], "ans": 2, "ctx": ""}, {"lvl": "A1", "tipo": "V", "q": "O oposto de \"big\" é:", "opts": ["small", "tall", "long", "old"], "ans": 0, "ctx": ""}, {"lvl": "A1", "tipo": "L", "q": "Pergunta: Where is Tom going?", "opts": ["To the gym", "A blue car", "Three apples", "Yesterday"], "ans": 0, "ctx": "Tom says: \"I am going to the gym now.\""}, {"lvl": "A2", "tipo": "G", "q": "\"Last weekend we ___ a movie.\"", "opts": ["watch", "watched", "watching", "watches"], "ans": 1, "ctx": ""}, {"lvl": "A2", "tipo": "G", "q": "\"He is ___ than his brother.\"", "opts": ["tall", "taller", "tallest", "more tall"], "ans": 1, "ctx": ""}, {"lvl": "A2", "tipo": "G", "q": "\"I ___ going to call you tomorrow.\"", "opts": ["am", "is", "are", "be"], "ans": 0, "ctx": ""}, {"lvl": "A2", "tipo": "V", "q": "\"I am very tired. I need to ___.\"", "opts": ["rest", "run", "cook", "drive"], "ans": 0, "ctx": ""}, {"lvl": "A2", "tipo": "L", "q": "Pergunta: When does the store close?", "opts": ["At 8 p.m.", "On Mondays", "For two hours", "Very cheap"], "ans": 0, "ctx": "Sign: \"Our store is open from 9 a.m. to 8 p.m., Monday to Friday.\""}, {"lvl": "B1", "tipo": "G", "q": "\"I have known her ___ five years.\"", "opts": ["since", "for", "ago", "during"], "ans": 1, "ctx": ""}, {"lvl": "B1", "tipo": "G", "q": "\"If you heat ice, it ___.\"", "opts": ["melt", "melts", "melted", "will melt"], "ans": 1, "ctx": ""}, {"lvl": "B1", "tipo": "G", "q": "\"She asked me where I ___ from.\"", "opts": ["come", "came", "coming", "comes"], "ans": 1, "ctx": ""}, {"lvl": "B1", "tipo": "V", "q": "\"The meeting was ___; everyone fell asleep.\"", "opts": ["boring", "bored", "boredom", "bore"], "ans": 0, "ctx": ""}, {"lvl": "B1", "tipo": "L", "q": "Pergunta: Why was the trip cancelled?", "opts": ["Because of the weather", "Because it was cheap", "Because of the food", "Because Tom was happy"], "ans": 0, "ctx": "Email: \"Unfortunately, due to the heavy storm, we had to cancel the trip this weekend.\""}, {"lvl": "B2", "tipo": "G", "q": "\"By the time the police arrived, the thief ___.\"", "opts": ["escaped", "has escaped", "had escaped", "escapes"], "ans": 2, "ctx": ""}, {"lvl": "B2", "tipo": "G", "q": "\"I wish I ___ more time to study yesterday.\"", "opts": ["have had", "had had", "have", "had"], "ans": 1, "ctx": ""}, {"lvl": "B2", "tipo": "G", "q": "\"The report ___ by the team last week.\"", "opts": ["was written", "wrote", "has wrote", "is writing"], "ans": 0, "ctx": ""}, {"lvl": "B2", "tipo": "V", "q": "\"Her argument was ___; nobody could disagree.\"", "opts": ["compelling", "comfortable", "compulsory", "competitive"], "ans": 0, "ctx": ""}, {"lvl": "B2", "tipo": "L", "q": "A frase implica que o projeto:", "opts": ["será adiado", "já terminou", "nunca começou", "foi um sucesso"], "ans": 0, "ctx": "Note: \"Given the current budget constraints, the launch will have to be postponed until further notice.\""}, {"lvl": "C1", "tipo": "G", "q": "\"Not only ___ the deadline, but he also impressed the client.\"", "opts": ["he met", "met he", "did he meet", "he did meet"], "ans": 2, "ctx": ""}, {"lvl": "C1", "tipo": "G", "q": "\"___ harder, she would have passed the exam.\"", "opts": ["Had she studied", "If she studies", "She had studied", "Did she study"], "ans": 0, "ctx": ""}, {"lvl": "C1", "tipo": "G", "q": "\"It was his persistence ___ ultimately led to success.\"", "opts": ["which", "that", "who", "what"], "ans": 1, "ctx": ""}, {"lvl": "C1", "tipo": "V", "q": "\"The new policy was met with widespread ___.\"", "opts": ["scepticism", "scenery", "schedule", "sculpture"], "ans": 0, "ctx": ""}, {"lvl": "C1", "tipo": "L", "q": "O tom do autor é:", "opts": ["crítico", "entusiasmado", "neutro e informativo", "humorístico"], "ans": 0, "ctx": "Review: \"While the device boasts impressive specs, its exorbitant price and fragile build leave much to be desired.\""}, {"lvl": "C2", "tipo": "G", "q": "\"Seldom ___ such a remarkable performance.\"", "opts": ["we have seen", "have we seen", "we saw", "saw we"], "ans": 1, "ctx": ""}, {"lvl": "C2", "tipo": "G", "q": "\"He spoke as though he ___ the whole story himself.\"", "opts": ["witnessed", "has witnessed", "had witnessed", "witnesses"], "ans": 2, "ctx": ""}, {"lvl": "C2", "tipo": "V", "q": "\"Ephemeral\" most nearly means:", "opts": ["lasting briefly", "extremely loud", "very heavy", "clearly visible"], "ans": 0, "ctx": ""}, {"lvl": "C2", "tipo": "V", "q": "\"To take something with a grain of salt\" means to:", "opts": ["be skeptical of it", "add flavour to it", "accept it fully", "forget it quickly"], "ans": 0, "ctx": ""}, {"lvl": "C2", "tipo": "L", "q": "A passagem sugere que a teoria é:", "opts": ["elegante mas pouco prática", "totalmente comprovada", "simples de aplicar", "amplamente rejeitada"], "ans": 0, "ctx": "Critique: \"The theory, for all its conceptual elegance, founders when confronted with the messy realities of implementation.\""}]

const listeningExercises = [
  { nivel: 'A1', en: "Hi! My name is Anna and I'm from Canada.", pt: 'Oi! Meu nome é Anna e eu sou do Canadá.', q: 'De onde a Anna é?', opts: ['Do Canadá', 'Da Austrália', 'Da Irlanda', 'Dos Estados Unidos'], ans: 0 },
  { nivel: 'A1', en: "I wake up at seven o'clock every morning.", pt: 'Eu acordo às sete horas toda manhã.', q: 'A que horas ela acorda?', opts: ['Às sete', 'Às nove', 'Às seis', 'Às onze'], ans: 0 },
  { nivel: 'A1', en: 'Can I have a glass of water, please?', pt: 'Posso tomar um copo de água, por favor?', q: 'O que a pessoa pediu?', opts: ['Um copo de água', 'Um café', 'A conta', 'Um cardápio'], ans: 0 },
  { nivel: 'A2', en: 'The train to London leaves at half past nine.', pt: 'O trem para Londres sai às nove e meia.', q: 'Que horas o trem sai?', opts: ['Nove e meia', 'Dez e meia', 'Nove em ponto', 'Meio-dia'], ans: 0 },
  { nivel: 'A2', en: 'I went to the beach last weekend with my family.', pt: 'Eu fui à praia no fim de semana passado com minha família.', q: 'Para onde ela foi?', opts: ['À praia', 'Ao cinema', 'Ao trabalho', 'À montanha'], ans: 0 },
  { nivel: 'A2', en: 'Sorry, the restaurant is fully booked tonight.', pt: 'Desculpe, o restaurante está lotado hoje à noite.', q: 'Qual é o problema?', opts: ['Não há mesas disponíveis', 'Fechou para sempre', 'A comida acabou', 'O preço subiu'], ans: 0 },
  { nivel: 'B1', en: "I've been learning English for about three years now.", pt: 'Eu estudo inglês há cerca de três anos.', q: 'Há quanto tempo ele estuda inglês?', opts: ['Cerca de três anos', 'Há três meses', 'Desde criança', 'Há três semanas'], ans: 0 },
  { nivel: 'B1', en: "If the weather is nice tomorrow, we'll go hiking.", pt: 'Se o tempo estiver bom amanhã, vamos fazer trilha.', q: 'De que depende o plano?', opts: ['Do tempo estar bom', 'Do dinheiro', 'Da família concordar', 'Do trabalho'], ans: 0 },
  { nivel: 'B1', en: "She said she couldn't come because she was feeling sick.", pt: 'Ela disse que não podia vir porque estava se sentindo mal.', q: 'Por que ela não veio?', opts: ['Estava doente', 'Estava ocupada', 'Esqueceu', 'Estava viajando'], ans: 0 },
  { nivel: 'B2', en: 'The flight has been delayed due to bad weather conditions.', pt: 'O voo foi atrasado por causa das más condições do tempo.', q: 'Por que o voo atrasou?', opts: ['Por causa do mau tempo', 'Por problema técnico', 'Por greve', 'Por excesso de bagagem'], ans: 0 },
  { nivel: 'B2', en: "I'd rather stay home tonight than go to a crowded party.", pt: 'Eu preferiria ficar em casa hoje a ir a uma festa lotada.', q: 'O que a pessoa prefere?', opts: ['Ficar em casa', 'Ir à festa', 'Sair para jantar', 'Trabalhar'], ans: 0 },
  { nivel: 'C1', en: 'Despite the setbacks, the team managed to meet the deadline.', pt: 'Apesar dos contratempos, a equipe conseguiu cumprir o prazo.', q: 'O que a equipe conseguiu?', opts: ['Cumprir o prazo', 'Cancelar o projeto', 'Adiar a entrega', 'Aumentar o orçamento'], ans: 0 },
  { nivel: 'A1', en: 'My favorite color is green.', pt: 'Minha cor favorita é verde.', q: 'Qual é a cor favorita dele?', opts: ['Verde', 'Azul', 'Vermelho', 'Amarelo'], ans: 0 },
  { nivel: 'A1', en: 'I have two brothers and one sister.', pt: 'Eu tenho dois irmãos e uma irmã.', q: 'Quantos irmãos ela tem ao todo?', opts: ['Dois', 'Três', 'Um', 'Quatro'], ans: 1 },
  { nivel: 'A1', en: 'The cat is sleeping on the sofa.', pt: 'O gato está dormindo no sofá.', q: 'Onde está o gato?', opts: ['Na cama', 'No chão', 'No sofá', 'Na cadeira'], ans: 2 },
  { nivel: 'A1', en: 'I usually drink coffee in the morning.', pt: 'Eu costumo tomar café de manhã.', q: 'O que ela bebe de manhã?', opts: ['Chá', 'Suco', 'Água', 'Café'], ans: 3 },
  { nivel: 'A1', en: 'My house has three bedrooms.', pt: 'Minha casa tem três quartos.', q: 'Quantos quartos a casa tem?', opts: ['Três', 'Dois', 'Quatro', 'Cinco'], ans: 0 },
  { nivel: 'A1', en: 'She is wearing a red dress.', pt: 'Ela está usando um vestido vermelho.', q: 'O que ela está vestindo?', opts: ['Uma saia azul', 'Um vestido vermelho', 'Uma blusa branca', 'Calça preta'], ans: 1 },
  { nivel: 'A2', en: "I'm going to visit my grandparents next weekend.", pt: 'Vou visitar meus avós no próximo fim de semana.', q: 'Quando ele vai visitar os avós?', opts: ['No próximo fim de semana', 'Hoje', 'Amanhã', 'Mês que vem'], ans: 0 },
  { nivel: 'A2', en: 'The supermarket is next to the pharmacy.', pt: 'O supermercado fica ao lado da farmácia.', q: 'Onde fica o supermercado?', opts: ['Em frente ao banco', 'Ao lado da farmácia', 'Atrás da escola', 'Longe daqui'], ans: 1 },
  { nivel: 'A2', en: 'We watched a great movie last night.', pt: 'Assistimos a um ótimo filme ontem à noite.', q: 'O que eles fizeram ontem à noite?', opts: ['Jantaram fora', 'Estudaram', 'Assistiram a um filme', 'Viajaram'], ans: 2 },
  { nivel: 'A2', en: 'It takes me thirty minutes to get to work.', pt: 'Levo trinta minutos para chegar ao trabalho.', q: 'Quanto tempo ela leva para o trabalho?', opts: ['Uma hora', 'Quinze minutos', 'Dez minutos', 'Trinta minutos'], ans: 3 },
  { nivel: 'A2', en: 'I bought this jacket because it was on sale.', pt: 'Comprei esta jaqueta porque estava em promoção.', q: 'Por que ela comprou a jaqueta?', opts: ['Estava em promoção', 'Era cara', 'Era um presente', 'Estava velha'], ans: 0 },
  { nivel: 'A2', en: "He doesn't like spicy food.", pt: 'Ele não gosta de comida apimentada.', q: 'Do que ele não gosta?', opts: ['De comida doce', 'De comida apimentada', 'De frutas', 'De peixe'], ans: 1 },
  { nivel: 'B1', en: 'Although it was raining, we decided to go for a walk.', pt: 'Embora estivesse chovendo, decidimos sair para caminhar.', q: 'Apesar da chuva, o que decidiram fazer?', opts: ['Ficar em casa', 'Ir ao cinema', 'Sair para caminhar', 'Dormir'], ans: 2 },
  { nivel: 'B1', en: "I've never been abroad, but I'd love to travel someday.", pt: 'Nunca fui ao exterior, mas adoraria viajar um dia.', q: 'O que é verdade sobre ela?', opts: ['Já morou fora', 'Nunca foi ao exterior', 'Viaja todo ano', 'Odeia viajar'], ans: 1 },
  { nivel: 'B1', en: 'The manager asked us to finish the report by Friday.', pt: 'O gerente pediu para terminarmos o relatório até sexta.', q: 'Até quando o relatório deve ficar pronto?', opts: ['Até sexta-feira', 'Até segunda', 'Hoje', 'Sem prazo'], ans: 0 },
  { nivel: 'B1', en: 'If I were you, I would talk to her honestly.', pt: 'Se eu fosse você, falaria com ela honestamente.', q: 'Qual é o conselho dado?', opts: ['Não falar nada', 'Esperar', 'Conversar com ela honestamente', 'Mandar mensagem'], ans: 2 },
  { nivel: 'B1', en: "We're thinking about moving to a bigger apartment.", pt: 'Estamos pensando em mudar para um apartamento maior.', q: 'O que estão considerando?', opts: ['Comprar um carro', 'Mudar para um apartamento maior', 'Reformar a casa', 'Viajar'], ans: 1 },
  { nivel: 'B1', en: "She's been working here for almost ten years.", pt: 'Ela trabalha aqui há quase dez anos.', q: 'Há quanto tempo ela trabalha lá?', opts: ['Quase dez anos', 'Dois anos', 'Seis meses', 'Acabou de entrar'], ans: 0 },
  { nivel: 'B2', en: 'The project was delayed because of a lack of funding.', pt: 'O projeto atrasou por falta de verba.', q: 'Por que o projeto atrasou?', opts: ['Falta de equipe', 'Falta de verba', 'Mau tempo', 'Falta de tempo'], ans: 1 },
  { nivel: 'B2', en: "I'd rather you didn't mention this to anyone.", pt: 'Eu preferiria que você não comentasse isso com ninguém.', q: 'O que a pessoa prefere?', opts: ['Que você conte a todos', 'Que você não comente com ninguém', 'Que você pergunte', 'Que você espere'], ans: 1 },
  { nivel: 'B2', en: "Despite his efforts, he couldn't convince the board.", pt: 'Apesar dos esforços, ele não convenceu a diretoria.', q: 'Qual foi o resultado dos esforços dele?', opts: ['Convenceu a diretoria', 'Não convenceu a diretoria', 'Desistiu logo', 'Foi promovido'], ans: 1 },
  { nivel: 'B2', en: 'By the time we arrived, the meeting had already started.', pt: 'Quando chegamos, a reunião já havia começado.', q: 'O que aconteceu quando chegaram?', opts: ['A reunião não tinha começado', 'A reunião já tinha começado', 'A reunião foi cancelada', 'Chegaram cedo'], ans: 1 },
  { nivel: 'B2', en: 'The new policy is likely to affect small businesses the most.', pt: 'A nova política provavelmente afetará mais os pequenos negócios.', q: 'Quem será mais afetado?', opts: ['Grandes empresas', 'Pequenos negócios', 'O governo', 'Os turistas'], ans: 1 },
  { nivel: 'C1', en: 'Had I known about the traffic, I would have left earlier.', pt: 'Se eu soubesse do trânsito, teria saído mais cedo.', q: 'O que a pessoa lamenta?', opts: ['Não ter saído mais cedo', 'Ter saído cedo demais', 'Ter perdido o voo', 'Não ter dirigido'], ans: 0 },
  { nivel: 'C1', en: 'The findings, while preliminary, are quite promising.', pt: 'Os resultados, embora preliminares, são bastante promissores.', q: 'Como são os resultados?', opts: ['Definitivos', 'Preliminares, mas promissores', 'Decepcionantes', 'Irrelevantes'], ans: 1 },
  { nivel: 'C1', en: 'She has a tendency to overcommit and then feel overwhelmed.', pt: 'Ela tende a assumir demais e depois se sentir sobrecarregada.', q: 'Qual é a tendência dela?', opts: ['Assumir demais e se sobrecarregar', 'Recusar tarefas', 'Trabalhar pouco', 'Delegar tudo'], ans: 0 },
  { nivel: 'C1', en: 'The proposal was turned down despite widespread support.', pt: 'A proposta foi recusada apesar do amplo apoio.', q: 'O que aconteceu com a proposta?', opts: ['Foi aprovada', 'Foi recusada', 'Foi adiada', 'Foi reescrita'], ans: 1 },
  { nivel: 'C1', en: 'His remarks were taken out of context by the media.', pt: 'Os comentários dele foram tirados de contexto pela mídia.', q: 'O que aconteceu com os comentários dele?', opts: ['Foram elogiados', 'Foram tirados de contexto', 'Foram ignorados', 'Foram confirmados'], ans: 1 },
  { nivel: 'A1', en: 'The store opens at nine in the morning.', pt: 'A loja abre às nove da manhã.', q: 'Que horas a loja abre?', opts: ['Às nove da manhã', 'Ao meio-dia', 'Às sete', 'À noite'], ans: 0 },
  { nivel: 'A1', en: 'I like to play soccer with my friends.', pt: 'Eu gosto de jogar futebol com meus amigos.', q: 'Do que ele gosta?', opts: ['De jogar futebol', 'De nadar', 'De correr', 'De ler'], ans: 0 },
  { nivel: 'A2', en: 'Could you tell me how to get to the museum?', pt: 'Você poderia me dizer como chegar ao museu?', q: 'O que a pessoa quer saber?', opts: ['Como chegar ao museu', 'O preço do ingresso', 'O horário', 'Onde comer'], ans: 0 },
  { nivel: 'A2', en: 'My sister is studying to become a nurse.', pt: 'Minha irmã está estudando para se tornar enfermeira.', q: 'O que a irmã quer ser?', opts: ['Médica', 'Enfermeira', 'Professora', 'Advogada'], ans: 1 },
  { nivel: 'B1', en: 'I wish I had studied more before the exam.', pt: 'Eu queria ter estudado mais antes da prova.', q: 'Do que ela se arrepende?', opts: ['De não ter estudado mais', 'De ter faltado', 'De ter dormido tarde', 'De não ter comido'], ans: 0 },
  { nivel: 'B1', en: 'The bus was so crowded that I decided to walk.', pt: 'O ônibus estava tão cheio que decidi ir a pé.', q: 'Por que ele foi a pé?', opts: ['O ônibus estava cheio', 'Estava com pressa', 'Perdeu o ônibus', 'Queria se exercitar'], ans: 0 },
  { nivel: 'B2', en: 'You should have told me you were running late.', pt: 'Você deveria ter me avisado que estava atrasado.', q: 'Qual é a crítica?', opts: ['Não avisou do atraso', 'Chegou cedo demais', 'Falou demais', 'Esqueceu o trabalho'], ans: 0 },
  { nivel: 'B2', en: 'The company is investing heavily in renewable energy.', pt: 'A empresa está investindo pesado em energia renovável.', q: 'Em que a empresa investe?', opts: ['Em energia renovável', 'Em imóveis', 'Em publicidade', 'Em tecnologia militar'], ans: 0 },
  { nivel: 'C1', en: 'Only after reviewing the data did they realize the mistake.', pt: 'Só depois de revisar os dados é que perceberam o erro.', q: 'Quando perceberam o erro?', opts: ['Antes de começar', 'Depois de revisar os dados', 'Nunca perceberam', 'No primeiro dia'], ans: 1 },
  { nivel: 'C2', en: 'The nuances of the argument were lost on most of the audience.', pt: 'As sutilezas do argumento passaram despercebidas pela maioria da plateia.', q: 'O que aconteceu com as sutilezas?', opts: ['Foram bem compreendidas', 'Passaram despercebidas pela plateia', 'Foram exageradas', 'Foram anotadas por todos'], ans: 1 },
  { nivel: 'C2', en: 'Far from being a burden, the change proved remarkably beneficial.', pt: 'Longe de ser um fardo, a mudança se mostrou notavelmente benéfica.', q: 'Como foi a mudança?', opts: ['Um fardo pesado', 'Notavelmente benéfica', 'Indiferente', 'Um desastre'], ans: 1 },
  { nivel: 'C2', en: 'She conceded the point, albeit somewhat reluctantly.', pt: 'Ela admitiu o ponto, ainda que um tanto relutante.', q: 'Como ela admitiu o ponto?', opts: ['Com entusiasmo', 'Um tanto relutante', 'Sem admitir', 'Rapidamente'], ans: 1 },
]

const grammarTips = [
  { t: 'Verbo to be (am/is/are)', d: 'Use "am" com I, "is" com he/she/it e "are" com you/we/they.', ex: 'She is a teacher. / They are happy.' },
  { t: 'Artigos a / an', d: 'Use "a" antes de som de consoante e "an" antes de som de vogal.', ex: 'a car · an apple · an hour' },
  { t: 'Plural dos substantivos', d: 'Geralmente +s; palavras em -s, -x, -ch, -sh levam +es.', ex: 'cat → cats · box → boxes' },
  { t: 'Present Simple (3ª pessoa)', d: 'Com he/she/it o verbo leva -s no presente.', ex: 'He works. / She studies.' },
  { t: 'Present Continuous', d: 'am/is/are + verbo-ing para ações acontecendo agora.', ex: 'I am studying right now.' },
  { t: 'There is / There are', d: '"There is" para singular e "There are" para plural.', ex: 'There is a book. / There are two books.' },
  { t: 'Pronomes possessivos', d: 'my, your, his, her, its, our, their vêm antes do substantivo.', ex: 'This is my pen. Her car is blue.' },
  { t: 'Can (habilidade)', d: '"can" + verbo base; não muda com a pessoa.', ex: 'She can swim. / They can help.' },
  { t: 'Simple Past (regulares)', d: 'Verbos regulares formam o passado com -ed.', ex: 'work → worked · play → played' },
  { t: 'Simple Past (irregulares)', d: 'Muitos verbos têm passado próprio — vale decorar.', ex: 'go → went · have → had · see → saw' },
  { t: 'Comparativos', d: 'Curtos: adjetivo + -er than. Longos: more + adjetivo + than.', ex: 'taller than · more expensive than' },
  { t: 'Superlativos', d: 'Curtos: the + -est. Longos: the most + adjetivo.', ex: 'the tallest · the most expensive' },
  { t: 'Going to (futuro)', d: 'am/is/are going to + verbo para planos e intenções.', ex: 'I am going to travel next year.' },
  { t: 'Will (futuro)', d: '"will" + verbo base para decisões e previsões.', ex: 'I will help you. / It will rain.' },
  { t: 'Some / Any', d: '"some" em afirmativas; "any" em negativas e perguntas.', ex: 'I have some money. / I don\'t have any.' },
  { t: 'Much / Many', d: '"many" para contáveis; "much" para incontáveis.', ex: 'many books · much water' },
  { t: 'Preposições de tempo', d: 'in (meses/anos), on (dias/datas), at (horas).', ex: 'in May · on Monday · at 5pm' },
  { t: 'Present Perfect', d: 'have/has + particípio para experiência ou passado ligado ao agora.', ex: 'I have visited Paris twice.' },
  { t: 'Since / For', d: '"since" + ponto no tempo; "for" + duração.', ex: 'since 2010 · for five years' },
  { t: 'Already / Yet', d: '"already" em afirmativas; "yet" em negativas/perguntas, no fim.', ex: 'I\'ve already eaten. / Not yet.' },
  { t: '1º Condicional', d: 'If + presente, ... will + verbo (situação real e provável).', ex: 'If it rains, I will stay home.' },
  { t: '2º Condicional', d: 'If + passado, ... would + verbo (situação hipotética).', ex: 'If I were rich, I would travel.' },
  { t: 'Used to', d: '"used to" + verbo base: hábito do passado que não existe mais.', ex: 'I used to play soccer as a kid.' },
  { t: 'Have to / Must', d: 'Obrigação: "have to" é externa; "must" é mais forte/pessoal.', ex: 'I have to work. / You must stop.' },
  { t: 'Should (conselho)', d: '"should" + verbo base para dar conselhos.', ex: 'You should rest more.' },
  { t: 'Voz passiva', d: 'to be + particípio quando o foco é a ação, não quem a faz.', ex: 'The house was built in 1990.' },
  { t: 'Gerúndio após preposição', d: 'Depois de preposição, o verbo vai para -ing.', ex: 'good at singing · before leaving' },
  { t: 'Infinitivo de propósito', d: 'Use "to + verbo" para indicar finalidade.', ex: 'I came here to learn English.' },
  { t: 'Reported Speech', d: 'Ao relatar, o tempo verbal recua um grau.', ex: '"I am tired" → She said she was tired.' },
  { t: 'Question tags', d: 'Mini-pergunta no fim: frase afirmativa pede tag negativa.', ex: 'You like coffee, don\'t you?' },
  { t: 'Phrasal verbs', d: 'Verbo + partícula com sentido novo; não traduza ao pé da letra.', ex: 'give up = desistir · look for = procurar' },
  { t: 'Make vs Do', d: '"make" para criar/produzir; "do" para tarefas e atividades.', ex: 'make a cake · do homework' },
  { t: 'Say vs Tell', d: '"tell" precisa de objeto (tell me); "say" não precisa.', ex: 'She told me. / She said hello.' },
  { t: 'Too / Enough', d: '"too" = demais (antes do adjetivo); "enough" = suficiente (depois).', ex: 'too hot · hot enough' },
  { t: 'Present Perfect Continuous', d: 'have/has been + -ing: ação contínua que vem até agora.', ex: 'I have been studying for hours.' },
  { t: 'Past Continuous', d: 'was/were + -ing: ação em andamento no passado.', ex: 'I was sleeping when you called.' },
  { t: 'Relative clauses', d: 'who (pessoas), which (coisas), that (ambos), whose (posse).', ex: 'The man who called you is here.' },
  { t: '3º Condicional', d: 'If + past perfect, ... would have + particípio (passado irreal).', ex: 'If I had known, I would have helped.' },
  { t: 'Wish', d: '"wish" + passado para desejos sobre o presente.', ex: 'I wish I had more free time.' },
  { t: 'Causativo (have/get done)', d: 'have/get + objeto + particípio: outra pessoa faz por você.', ex: 'I had my car repaired.' },
]

// Compara duas palavras por proximidade (0 a 1), tolerando pequenos erros do reconhecimento de voz.
function _levDist(a: string, b: string): number {
  const m = a.length, n = b.length
  if (!m) return n; if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    let cur = [i, ...Array(n).fill(0)]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[n]
}
function simPalavra(a: string, b: string): number {
  if (a === b) return 1
  const max = Math.max(a.length, b.length, 1)
  return 1 - _levDist(a, b) / max
}
// Melhor semelhança entre uma palavra-alvo e a lista de palavras ouvidas.
function melhorSim(alvo: string, ouvidas: string[]): number {
  let m = 0
  for (const o of ouvidas) { const s = simPalavra(alvo, o); if (s > m) m = s }
  return m
}

const pronCategorias = [
  { id: 'th', label: 'O som do TH', icon: '🦷', desc: 'think, three, this, that', frases: [
    { en: 'I think this is the best one.', pt: 'Acho que este é o melhor.' },
    { en: 'Thank you for the three books.', pt: 'Obrigado pelos três livros.' },
    { en: 'My brother and mother are there.', pt: 'Meu irmão e minha mãe estão lá.' },
    { en: 'The weather is nice this Thursday.', pt: 'O tempo está bom nesta quinta.' },
    { en: 'Both of them think the same thing.', pt: 'Os dois pensam a mesma coisa.' },
    { en: 'That is the third time this month.', pt: 'Essa é a terceira vez este mês.' },
    { en: 'These are my father and mother.', pt: 'Estes são meu pai e minha mãe.' },
    { en: 'I thought that bath was warm.', pt: 'Achei que aquele banho estava quente.' },
  ] },
  { id: 'h', label: 'O H aspirado', icon: '💨', desc: 'house, hello, behind', frases: [
    { en: 'Hello, how are you today?', pt: 'Olá, como você está hoje?' },
    { en: 'He has a happy heart.', pt: 'Ele tem um coração feliz.' },
    { en: 'The hotel is behind the hospital.', pt: 'O hotel fica atrás do hospital.' },
    { en: 'I hope you have a good holiday.', pt: 'Espero que tenha boas férias.' },
    { en: 'Her house has a huge hall.', pt: 'A casa dela tem um salão enorme.' },
    { en: 'How high can he hang the hat?', pt: 'Quão alto ele consegue pendurar o chapéu?' },
    { en: 'Harry heard a horrible howl.', pt: 'O Harry ouviu um uivo horrível.' },
    { en: 'I have to help him at home.', pt: 'Eu tenho que ajudá-lo em casa.' },
  ] },
  { id: 'r', label: 'O R do inglês', icon: '🔴', desc: 'red, very, world, around', frases: [
    { en: 'The red car is very fast.', pt: 'O carro vermelho é muito rápido.' },
    { en: 'Around the world, people read.', pt: 'Pelo mundo, as pessoas leem.' },
    { en: 'My brother works hard every morning.', pt: 'Meu irmão trabalha duro toda manhã.' },
    { en: 'There is a problem with the printer.', pt: 'Há um problema com a impressora.' },
    { en: 'Robert really runs in the park.', pt: 'O Robert realmente corre no parque.' },
    { en: 'Three brave rabbits ran around.', pt: 'Três coelhos corajosos correram ao redor.' },
    { en: 'Our teacher wrote a great report.', pt: 'Nossa professora escreveu um ótimo relatório.' },
    { en: 'Mary drove her red truck right here.', pt: 'A Mary dirigiu o caminhão vermelho até aqui.' },
  ] },
  { id: 'ed', label: 'Terminação -ED', icon: '⏪', desc: 'worked, played, wanted', frases: [
    { en: 'I worked and played yesterday.', pt: 'Eu trabalhei e brinquei ontem.' },
    { en: 'She wanted and decided quickly.', pt: 'Ela quis e decidiu rápido.' },
    { en: 'We finished the project last week.', pt: 'Terminamos o projeto semana passada.' },
    { en: 'They watched and enjoyed the movie.', pt: 'Eles assistiram e curtiram o filme.' },
    { en: 'He cooked and cleaned the kitchen.', pt: 'Ele cozinhou e limpou a cozinha.' },
    { en: 'She walked, talked, and laughed.', pt: 'Ela caminhou, conversou e riu.' },
    { en: 'They needed and wanted more time.', pt: 'Eles precisavam e queriam mais tempo.' },
    { en: 'I called you and waited outside.', pt: 'Eu te liguei e esperei lá fora.' },
  ] },
  { id: 'vogais', label: 'Vogais curtas x longas', icon: '🔊', desc: 'ship/sheep, live/leave', frases: [
    { en: 'The sheep is on the ship.', pt: 'A ovelha está no navio.' },
    { en: 'I want to eat at the beach.', pt: 'Quero comer na praia.' },
    { en: 'Please leave the green leaf.', pt: 'Por favor, deixe a folha verde.' },
    { en: 'It is a big beach with blue water.', pt: 'É uma praia grande com água azul.' },
    { en: 'She lives near a beautiful field.', pt: 'Ela mora perto de um belo campo.' },
    { en: 'I will sit on this seat and rest.', pt: 'Vou sentar neste assento e descansar.' },
    { en: 'The ship is full of sheep.', pt: 'O navio está cheio de ovelhas.' },
    { en: 'He feels his feet are cold.', pt: 'Ele sente que seus pés estão frios.' },
  ] },
  { id: 'stress', label: 'Sílaba tônica', icon: '🎵', desc: 'photograph, comfortable', frases: [
    { en: 'I took a photograph of the city.', pt: 'Tirei uma foto da cidade.' },
    { en: 'This chair is very comfortable.', pt: 'Esta cadeira é muito confortável.' },
    { en: 'Vegetables are important for health.', pt: 'Vegetais são importantes para a saúde.' },
    { en: 'The interesting hotel was beautiful.', pt: 'O hotel interessante era lindo.' },
    { en: 'Technology develops very quickly.', pt: 'A tecnologia evolui muito rápido.' },
    { en: 'I prefer to record a new record.', pt: 'Prefiro gravar um novo disco.' },
    { en: 'The desert is dry, but I want dessert.', pt: 'O deserto é seco, mas eu quero sobremesa.' },
    { en: 'Please present the birthday present.', pt: 'Por favor, apresente o presente de aniversário.' },
  ] },
  { id: 'wv', label: 'W x V', icon: '🌊', desc: 'we, very, wine, view', frases: [
    { en: 'We live in a quiet village.', pt: 'Nós moramos numa vila tranquila.' },
    { en: 'Victor wants a glass of wine.', pt: 'O Victor quer uma taça de vinho.' },
    { en: 'The view from the window is wonderful.', pt: 'A vista da janela é maravilhosa.' },
    { en: 'We were very worried.', pt: 'Nós estávamos muito preocupados.' },
    { en: 'Violet wore a white veil.', pt: 'A Violet usou um véu branco.' },
    { en: 'We value every visit.', pt: 'Valorizamos cada visita.' },
    { en: 'Will you visit the village?', pt: 'Você vai visitar a vila?' },
    { en: 'Vera waved from the window.', pt: 'A Vera acenou da janela.' },
    { en: 'We won a very nice vacation.', pt: 'Ganhamos umas férias muito boas.' },
  ] },
  { id: 's', label: 'Terminação -S', icon: '🐍', desc: 'books, watches, dishes', frases: [
    { en: 'She watches the cats and the dogs.', pt: 'Ela observa os gatos e os cachorros.' },
    { en: 'He reads books on the buses.', pt: 'Ele lê livros nos ônibus.' },
    { en: 'My friends like these dishes.', pt: 'Meus amigos gostam destes pratos.' },
    { en: 'The boxes contain old glasses.', pt: 'As caixas contêm copos velhos.' },
    { en: 'She wishes for new clothes.', pt: 'Ela deseja roupas novas.' },
    { en: 'The girls dance and the boys watch.', pt: 'As meninas dançam e os meninos assistem.' },
  ] },
  { id: 'silent', label: 'Letras mudas', icon: '🤫', desc: 'knife, write, hour', frases: [
    { en: 'I wrote with a knife near the comb.', pt: 'Escrevi com uma faca perto do pente.' },
    { en: 'The hour is half past eight.', pt: 'A hora é oito e meia.' },
    { en: 'He climbed the high mountain.', pt: 'Ele escalou a montanha alta.' },
    { en: 'Listen, the castle is very quiet.', pt: 'Escute, o castelo está bem silencioso.' },
    { en: 'I know the answer is wrong.', pt: 'Eu sei que a resposta está errada.' },
    { en: 'She bought a light, sharp sword.', pt: 'Ela comprou uma espada leve e afiada.' },
    { en: 'The doubt about the debt is gone.', pt: 'A dúvida sobre a dívida acabou.' },
    { en: 'Could you knock on the door?', pt: 'Você poderia bater na porta?' },
    { en: 'Half of the island is calm.', pt: 'Metade da ilha está calma.' },
  ] },
  { id: 'ing', label: 'Terminação -ING', icon: '🎯', desc: 'going, doing, running', frases: [
    { en: 'I am going running this morning.', pt: 'Vou correr esta manhã.' },
    { en: 'She is reading and writing.', pt: 'Ela está lendo e escrevendo.' },
    { en: 'They are cooking and cleaning.', pt: 'Eles estão cozinhando e limpando.' },
    { en: 'We are studying English now.', pt: 'Estamos estudando inglês agora.' },
    { en: 'He is bringing something interesting.', pt: 'Ele está trazendo algo interessante.' },
    { en: 'Working and learning take time.', pt: 'Trabalhar e aprender levam tempo.' },
  ] },
  { id: 'contr', label: 'Contrações', icon: '✂️', desc: "I'm, don't, can't", frases: [
    { en: "I'm sure I don't know him.", pt: 'Tenho certeza de que não o conheço.' },
    { en: "She's happy but he isn't.", pt: 'Ela está feliz, mas ele não.' },
    { en: "We can't go because it's late.", pt: 'Não podemos ir porque está tarde.' },
    { en: "They've finished, haven't they?", pt: 'Eles terminaram, não foi?' },
    { en: "You're right, I wasn't ready.", pt: 'Você tem razão, eu não estava pronto.' },
    { en: "Let's not forget what we've learned.", pt: 'Não vamos esquecer o que aprendemos.' },
  ] },
  { id: 'pairs', label: 'Pares confusos', icon: '⚖️', desc: 'pull/full, walk/work', frases: [
    { en: 'Please pull the cart when it is full.', pt: 'Por favor, puxe o carrinho quando estiver cheio.' },
    { en: 'I walk to work every morning.', pt: 'Eu caminho até o trabalho toda manhã.' },
    { en: 'She sat down on the soft seat.', pt: 'Ela se sentou no assento macio.' },
    { en: 'Do not fool me with a full cup.', pt: 'Não me engane com um copo cheio.' },
    { en: 'The ship will not slip away.', pt: 'O navio não vai escapar.' },
    { en: 'He will live here and then leave.', pt: 'Ele vai morar aqui e depois partir.' },
  ] },
  { id: 'frases', label: 'Frases do dia a dia', icon: '💬', desc: 'cortesia e pedidos', frases: [
    { en: 'Could you help me, please?', pt: 'Você poderia me ajudar, por favor?' },
    { en: 'Nice to meet you. How are you?', pt: 'Prazer em conhecer. Como vai?' },
    { en: 'I would like a coffee, thank you.', pt: 'Eu gostaria de um café, obrigado.' },
    { en: 'Excuse me, where is the station?', pt: 'Com licença, onde fica a estação?' },
    { en: 'Have a great day. See you soon.', pt: 'Tenha um ótimo dia. Até logo.' },
    { en: 'I am sorry, could you repeat that?', pt: 'Desculpe, você poderia repetir?' },
  ] },
  { id: 'num', label: 'Números e datas', icon: '🔢', desc: 'thirteen x thirty', frases: [
    { en: 'Thirteen is different from thirty.', pt: 'Treze é diferente de trinta.' },
    { en: 'My birthday is on March third.', pt: 'Meu aniversário é em três de março.' },
    { en: 'I will arrive at a quarter past nine.', pt: 'Vou chegar às nove e quinze.' },
    { en: 'There are fifteen students here.', pt: 'Há quinze alunos aqui.' },
    { en: 'The meeting is on the twenty-first.', pt: 'A reunião é no dia vinte e um.' },
    { en: 'It costs forty-four dollars.', pt: 'Custa quarenta e quatro dólares.' },
  ] },
  { id: 'shch', label: 'SH x CH', icon: '👟', desc: 'shoe/chew, wash/watch', frases: [
    { en: 'She wears cheap shoes to the church.', pt: 'Ela usa sapatos baratos para a igreja.' },
    { en: 'Watch me wash the dishes.', pt: 'Me observe lavar a louça.' },
    { en: 'The chef shares a short lunch.', pt: 'O chef divide um almoço curto.' },
    { en: 'Which shirt should I choose?', pt: 'Qual camisa eu deveria escolher?' },
    { en: 'The children push the shopping cart.', pt: 'As crianças empurram o carrinho de compras.' },
    { en: 'I wish to teach and share.', pt: 'Eu desejo ensinar e compartilhar.' },
    { en: 'Charlie showed his cheap watch.', pt: 'O Charlie mostrou seu relógio barato.' },
  ] },
  { id: 'darkl', label: 'L no fim (dark L)', icon: '🌑', desc: 'ball, milk, full, feel', frases: [
    { en: 'I feel the cold ball in the hall.', pt: 'Eu sinto a bola fria no salão.' },
    { en: 'The little girl drinks warm milk.', pt: 'A garotinha bebe leite morno.' },
    { en: 'My meal is full of small apples.', pt: 'Minha refeição está cheia de maçãs pequenas.' },
    { en: 'Please tell Bill to call me.', pt: 'Por favor, diga ao Bill para me ligar.' },
    { en: 'The wheel fell off the well.', pt: 'A roda caiu do poço.' },
    { en: 'We will travel until April.', pt: 'Vamos viajar até abril.' },
    { en: 'The final goal feels real.', pt: 'O objetivo final parece real.' },
  ] },
  { id: 'jg', label: 'J e G suave', icon: '🧃', desc: 'judge, giant, age, page', frases: [
    { en: 'The judge is a gentle giant.', pt: 'O juiz é um gigante gentil.' },
    { en: 'Just turn to the next page.', pt: 'Apenas vire para a próxima página.' },
    { en: 'George enjoys orange juice.', pt: 'O George gosta de suco de laranja.' },
    { en: 'The magic bridge is huge.', pt: 'A ponte mágica é enorme.' },
    { en: 'Jane manages a large garage.', pt: 'A Jane administra uma garagem grande.' },
    { en: 'His message changed my age.', pt: 'A mensagem dele mudou minha idade.' },
    { en: 'Generally, the general agrees.', pt: 'Geralmente, o general concorda.' },
  ] },
]

// Mascote do Vonai ("Vô") — personagem próprio em SVG (fica igual em qualquer aparelho).
// Mascote do Vonai com humor: reage ao que o aluno faz (comemora acertos, fica
// triste com erros). 'comemora' quica e ergue os bracinhos.
function Mascote({ size = 40, humor = 'normal', prof = false }: { size?: number; humor?: 'normal' | 'feliz' | 'triste' | 'comemora'; prof?: boolean }) {
  const alegre = humor === 'feliz' || humor === 'comemora'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: 'block', animation: humor === 'comemora' ? 'su_bounce 0.7s cubic-bezier(0.16,1,0.3,1)' : 'none' }}>
      <defs>
        <linearGradient id="vonaiMasc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E86E8" />
          <stop offset="1" stopColor="#1E63C7" />
        </linearGradient>
      </defs>
      {/* antena com ponto dourado (só sem capelo) */}
      {!prof && (<>
        <rect x="30.5" y="4" width="3" height="8" rx="1.5" fill="#FFD98A" />
        <circle cx="32" cy="4" r="3.4" fill="#FFD98A" />
      </>)}
      {/* bracinhos para cima na comemoração */}
      {humor === 'comemora' && (<>
        <path d="M8 30 Q2 22 6 15" stroke="#1E63C7" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M56 30 Q62 22 58 15" stroke="#1E63C7" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="6" cy="14" r="3" fill="#FFD98A" />
        <circle cx="58" cy="14" r="3" fill="#FFD98A" />
      </>)}
      {/* corpo */}
      <rect x="7" y="11" width="50" height="45" rx="19" fill="url(#vonaiMasc)" />
      {/* capelo de professor (formatura) com borla dourada */}
      {prof && (<>
        <path d="M16 14 Q32 7 48 14 L48 19 Q32 13 16 19 Z" fill="#122A4C" />
        <path d="M32 1 L59 10 L32 19 L5 10 Z" fill="#16212C" />
        <path d="M32 4 L52 10 L32 16 L12 10 Z" fill="#1E63C7" opacity="0.35" />
        <circle cx="32" cy="10" r="2.2" fill="#FFD98A" />
        <path d="M57 11 L57 21" stroke="#FFD98A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="57" cy="23.5" r="2.6" fill="#FFD98A" />
      </>)}
      {/* olhos */}
      {alegre ? (<>
        <path d="M18 32 Q24 25 30 32" stroke="#fff" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        <path d="M34 32 Q40 25 46 32" stroke="#fff" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      </>) : humor === 'triste' ? (<>
        <circle cx="24" cy="31" r="8.2" fill="#fff" />
        <circle cx="40" cy="31" r="8.2" fill="#fff" />
        <path d="M16 25 L31 28" stroke="#1E63C7" strokeWidth="5" strokeLinecap="round" />
        <path d="M48 25 L33 28" stroke="#1E63C7" strokeWidth="5" strokeLinecap="round" />
        <circle cx="25" cy="33.5" r="3.7" fill="#0F2E5C" />
        <circle cx="41" cy="33.5" r="3.7" fill="#0F2E5C" />
        <path d="M47.5 40 Q50 44.5 47.5 46.5 Q45 44.5 47.5 40" fill="#9BD1FF" />
      </>) : (<>
        <circle cx="24" cy="31" r="8.2" fill="#fff" />
        <circle cx="40" cy="31" r="8.2" fill="#fff" />
        <circle cx="25" cy="32" r="3.7" fill="#0F2E5C" />
        <circle cx="41" cy="32" r="3.7" fill="#0F2E5C" />
        <circle cx="23.4" cy="30.4" r="1.2" fill="#fff" />
        <circle cx="39.4" cy="30.4" r="1.2" fill="#fff" />
      </>)}
      {/* óculos redondos do professor */}
      {prof && (<>
        <circle cx="24" cy="31" r="9.6" stroke="#FFD98A" strokeWidth="2.2" fill="none" />
        <circle cx="40" cy="31" r="9.6" stroke="#FFD98A" strokeWidth="2.2" fill="none" />
        <path d="M14.4 29 L8.5 27" stroke="#FFD98A" strokeWidth="2" strokeLinecap="round" />
        <path d="M49.6 29 L55.5 27" stroke="#FFD98A" strokeWidth="2" strokeLinecap="round" />
      </>)}
      {/* boca */}
      {humor === 'comemora' ? (
        <ellipse cx="32" cy="45" rx="7" ry="5.5" fill="#0F2E5C" />
      ) : humor === 'feliz' ? (
        <path d="M22 42 Q32 52 42 42" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      ) : humor === 'triste' ? (
        <path d="M24 48 Q32 42 40 48" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M23 43 Q32 50 41 43" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {/* bochechas */}
      {humor !== 'triste' && (<>
        <circle cx="15.5" cy="39" r="3" fill="#FFB4A2" opacity="0.55" />
        <circle cx="48.5" cy="39" r="3" fill="#FFB4A2" opacity="0.55" />
      </>)}
    </svg>
  )
}

// Sons que mais derrubam brasileiros no inglês, com dica pronta — aparece na hora,
// sem esperar a resposta da IA (e funciona offline).
const SONS_BR: { id: string; re: RegExp; dica: string }[] = [
  { id: 'th', re: /th/i, dica: 'o "th" não existe em português: encoste a ponta da língua nos dentes e sopre. "Think" não é "sink" nem "fink".' },
  { id: 'ed-final', re: /[a-z]ed$/i, dica: 'o "-ed" final quase nunca soa "éd": em "worked" vira /t/ (workt), em "played" vira /d/ (playd). Não acrescente uma sílaba extra.' },
  { id: 'h-aspirado', re: /^h[aeiou]/i, dica: 'o "h" inglês é soprado, como um "rr" carioca bem leve: "house" começa com sopro — brasileiro tende a comer esse som.' },
  { id: 'r-ingles', re: /^r/i, dica: 'o "r" inglês não vibra como o nosso: a língua NÃO toca o céu da boca. "Red" não é "réd" de "rato".' },
  { id: 'i-longo', re: /ee|ea/i, dica: 'capriche na vogal longa: "sheep" (iiii) é diferente de "ship" (i curtinho). Brasileiro costuma encurtar as duas.' },
  { id: 'w', re: /^w/i, dica: 'o "w" é um "u" rápido, nunca "v": "wine" ≠ "vine". Arredonde os lábios como em "uau".' },
  { id: 's-inicial', re: /^s[tpkc]/i, dica: 'não coloque um "i" antes do "s": "school" é "skul", não "eskul" — esse é o erro nº 1 do brasileiro.' },
  { id: 'oo', re: /oo/i, dica: 'o "oo" muda de palavra pra palavra: "food" é "u" longo (fuud), "book" é "u" curto (buk).' },
]

// Histórias interativas (estilo Duolingo Stories): mini-novelas em diálogo, reveladas
// linha a linha com áudio, tradução ao toque e perguntas de compreensão no meio.
// who: '' = narrador. after: índice da linha depois da qual a pergunta aparece.
type HistLinha = { who: string; en: string; pt: string }
type Historia = { id: string; titulo: string; nivel: string; icon: string; desc: string; linhas: HistLinha[]; qs: { after: number; q: string; opts: string[]; ans: number; exp: string }[] }
const HISTORIAS: Historia[] = [
  {
    id: 'coffee', titulo: 'The Coffee Order', nivel: 'A1', icon: '☕', desc: 'Anna só quer um café. O barista tem outros planos.',
    linhas: [
      { who: '', en: 'Anna is at a coffee shop in New York.', pt: 'Anna está numa cafeteria em Nova York.' },
      { who: 'Barista', en: 'Good morning! What would you like?', pt: 'Bom dia! O que você gostaria?' },
      { who: 'Anna', en: 'Hi! A large coffee with milk, please.', pt: 'Oi! Um café grande com leite, por favor.' },
      { who: 'Barista', en: 'Sure! What is your name?', pt: 'Claro! Qual é o seu nome?' },
      { who: 'Anna', en: 'Anna. A-N-N-A.', pt: 'Anna. A-N-N-A.' },
      { who: 'Barista', en: 'Got it! Your coffee is coming.', pt: 'Entendi! Seu café está saindo.' },
      { who: '', en: 'Five minutes later, the barista calls a name.', pt: 'Cinco minutos depois, o barista chama um nome.' },
      { who: 'Barista', en: 'Large coffee for... Banana?', pt: 'Café grande para... Banana?' },
      { who: 'Anna', en: 'It is ANNA! Not Banana!', pt: 'É ANNA! Não Banana!' },
      { who: 'Barista', en: 'Oh, sorry! But look — the coffee is still yours.', pt: 'Ah, desculpa! Mas olha — o café ainda é seu.' },
      { who: 'Anna', en: 'Fine. But next time, I am "Bob".', pt: 'Tá bom. Mas da próxima vez, eu sou "Bob".' },
    ],
    qs: [
      { after: 2, q: 'O que a Anna pediu?', opts: ['Um chá pequeno', 'Um café grande com leite', 'Um suco de banana'], ans: 1, exp: '"A large coffee with milk" = um café grande com leite.' },
      { after: 7, q: 'Qual nome o barista escreveu no copo?', opts: ['Anna', 'Bob', 'Banana'], ans: 2, exp: 'Ele entendeu "Banana" — clássico das cafeterias gringas. 😄' },
      { after: 10, q: 'Por que Anna diz que da próxima vez será "Bob"?', opts: ['Porque ela mudou de nome', 'Porque um nome simples é impossível de errar', 'Porque ela não gosta do barista'], ans: 1, exp: 'Piada dela: com um nome de 3 letras, não tem como o barista errar de novo.' },
    ],
  },
  {
    id: 'dog', titulo: 'The Lost Dog', nivel: 'A1', icon: '🐕', desc: 'Leo perdeu o cachorro. Ou será que não?',
    linhas: [
      { who: '', en: 'Leo opens the door. His dog Max is not in the house.', pt: 'Leo abre a porta. Seu cachorro Max não está em casa.' },
      { who: 'Leo', en: 'Max? Max! Where are you?', pt: 'Max? Max! Onde você está?' },
      { who: '', en: 'Leo looks in the garden. No dog.', pt: 'Leo olha no jardim. Nada de cachorro.' },
      { who: 'Leo', en: 'Excuse me, did you see a small brown dog?', pt: 'Com licença, você viu um cachorro pequeno e marrom?' },
      { who: 'Neighbor', en: 'Hmm... a dog with a red collar?', pt: 'Hmm... um cachorro com uma coleira vermelha?' },
      { who: 'Leo', en: 'Yes! That is Max!', pt: 'Sim! Esse é o Max!' },
      { who: 'Neighbor', en: 'He is at the bakery. He goes there every morning.', pt: 'Ele está na padaria. Ele vai lá toda manhã.' },
      { who: 'Leo', en: 'Every morning?!', pt: 'Toda manhã?!' },
      { who: '', en: 'At the bakery, Max is eating a piece of bread. The baker smiles.', pt: 'Na padaria, Max está comendo um pedaço de pão. O padeiro sorri.' },
      { who: 'Baker', en: 'Ah, you are Max\'s father! He has breakfast here every day.', pt: 'Ah, você é o pai do Max! Ele toma café da manhã aqui todo dia.' },
      { who: 'Leo', en: 'Max, you have a secret life!', pt: 'Max, você tem uma vida secreta!' },
    ],
    qs: [
      { after: 3, q: 'Como Leo descreve o Max?', opts: ['Um cachorro grande e preto', 'Um cachorro pequeno e marrom', 'Um gato pequeno'], ans: 1, exp: '"A small brown dog" — em inglês o adjetivo vem ANTES do substantivo.' },
      { after: 6, q: 'Onde o Max está?', opts: ['No jardim', 'Na padaria', 'Na casa do vizinho'], ans: 1, exp: '"He is at the bakery" = ele está na padaria.' },
      { after: 9, q: 'O que o padeiro conta sobre o Max?', opts: ['Que ele toma café da manhã lá todo dia', 'Que ele mora na padaria', 'Que ele não gosta de pão'], ans: 0, exp: '"He has breakfast here every day" — refeições usam HAVE: have breakfast.' },
    ],
  },
  {
    id: 'party', titulo: 'The Surprise Party', nivel: 'A2', icon: '🎉', desc: 'Uma festa surpresa para a Marta. Só tem um problema...',
    linhas: [
      { who: 'Julia', en: 'Okay, everyone! Marta\'s birthday is on Friday.', pt: 'Ok, pessoal! O aniversário da Marta é na sexta.' },
      { who: 'Julia', en: 'We are going to have a surprise party at my place.', pt: 'Vamos fazer uma festa surpresa na minha casa.' },
      { who: 'Tom', en: 'Great idea! I can make a chocolate cake.', pt: 'Ótima ideia! Eu posso fazer um bolo de chocolate.' },
      { who: 'Julia', en: 'Perfect. And remember: it is a SECRET.', pt: 'Perfeito. E lembrem: é um SEGREDO.' },
      { who: '', en: 'On Friday, everyone hides in the living room and waits.', pt: 'Na sexta, todos se escondem na sala e esperam.' },
      { who: '', en: 'The door opens. The lights turn on.', pt: 'A porta se abre. As luzes se acendem.' },
      { who: 'Everyone', en: 'SURPRISE!!!', pt: 'SURPRESA!!!' },
      { who: 'Marta', en: 'Oh! Wow! I... had no idea!', pt: 'Oh! Uau! Eu... não fazia ideia!' },
      { who: 'Tom', en: 'Wait a minute. Why are you wearing a party dress?', pt: 'Espera um pouco. Por que você está usando um vestido de festa?' },
      { who: 'Marta', en: 'This old thing? I always wear it on Fridays!', pt: 'Esse vestido velho? Eu sempre uso ele às sextas!' },
      { who: 'Julia', en: 'Marta... who told you?', pt: 'Marta... quem te contou?' },
      { who: 'Marta', en: 'Tom posted "making a cake for Marta" on Instagram. On Monday.', pt: 'O Tom postou "fazendo um bolo para a Marta" no Instagram. Na segunda.' },
    ],
    qs: [
      { after: 1, q: 'O que a Julia está planejando?', opts: ['Uma viagem com a Marta', 'Uma festa surpresa', 'Um jantar de trabalho'], ans: 1, exp: '"A surprise party at my place" — "my place" é jeito natural de dizer "minha casa".' },
      { after: 8, q: 'O que deixou o Tom desconfiado?', opts: ['Marta chegou atrasada', 'Marta estava com um vestido de festa', 'Marta trouxe um bolo'], ans: 1, exp: '"Why are you wearing a party dress?" — present continuous para o que acontece agora.' },
      { after: 11, q: 'Como a Marta descobriu a festa?', opts: ['Julia contou', 'Ela ouviu atrás da porta', 'Tom postou no Instagram'], ans: 2, exp: 'O segredo durou até... segunda-feira. 😄' },
    ],
  },
  {
    id: 'interview', titulo: 'The Job Interview', nivel: 'A2', icon: '💼', desc: 'Pedro tem uma entrevista importante. E mãos escorregadias.',
    linhas: [
      { who: '', en: 'Pedro arrives early for his job interview. He is very nervous.', pt: 'Pedro chega cedo para a entrevista de emprego. Ele está muito nervoso.' },
      { who: 'Ms. Lee', en: 'Good morning, Pedro. Please, have a seat.', pt: 'Bom dia, Pedro. Por favor, sente-se.' },
      { who: 'Pedro', en: 'Thank you for this opportunity, Ms. Lee.', pt: 'Obrigado por esta oportunidade, Sra. Lee.' },
      { who: 'Ms. Lee', en: 'So, tell me about yourself.', pt: 'Então, me fale sobre você.' },
      { who: 'Pedro', en: 'Well, I am 26 years old and I love solving problems.', pt: 'Bem, tenho 26 anos e adoro resolver problemas.' },
      { who: '', en: 'Pedro moves his hands... and knocks the coffee onto Ms. Lee\'s laptop.', pt: 'Pedro mexe as mãos... e derruba o café no notebook da Sra. Lee.' },
      { who: 'Pedro', en: 'Oh no. I am SO sorry!', pt: 'Ah não. Me desculpe MUITO!' },
      { who: '', en: 'Pedro takes the laptop, turns it off, dries it, and removes the battery — in ten seconds.', pt: 'Pedro pega o notebook, desliga, seca e remove a bateria — em dez segundos.' },
      { who: 'Ms. Lee', en: 'That was... fast.', pt: 'Isso foi... rápido.' },
      { who: 'Pedro', en: 'I told you. I love solving problems. Especially the ones I create.', pt: 'Eu disse. Adoro resolver problemas. Principalmente os que eu crio.' },
      { who: 'Ms. Lee', en: 'You start on Monday, Pedro.', pt: 'Você começa na segunda, Pedro.' },
    ],
    qs: [
      { after: 4, q: 'Como Pedro fala a idade dele?', opts: ['"I have 26 years"', '"I am 26 years old"', '"I do 26 years"'], ans: 1, exp: 'Idade usa BE: I am 26 years old. Nada de "have 26 years"!' },
      { after: 6, q: 'O que aconteceu com o café?', opts: ['Pedro bebeu tudo', 'Caiu no notebook da entrevistadora', 'Esfriou'], ans: 1, exp: '"Knocks the coffee onto the laptop" — derrubou em cima do notebook. 😬' },
      { after: 10, q: 'Por que Pedro conseguiu a vaga?', opts: ['Ele pediu desculpas bonito', 'Ele resolveu o problema com rapidez e bom humor', 'Ele pagou um notebook novo'], ans: 1, exp: 'Ele PROVOU a habilidade que tinha citado — resolver problemas — na prática.' },
    ],
  },
  {
    id: 'suitcase', titulo: 'The Wrong Suitcase', nivel: 'B1', icon: '🧳', desc: 'Duas malas pretas idênticas. Um conteúdo nada idêntico.',
    linhas: [
      { who: '', en: 'Carla lands in London after a long flight. She grabs her black suitcase and takes a taxi.', pt: 'Carla aterrissa em Londres após um voo longo. Pega sua mala preta e entra num táxi.' },
      { who: '', en: 'At the hotel, she opens the suitcase to get her charger.', pt: 'No hotel, ela abre a mala para pegar o carregador.' },
      { who: 'Carla', en: 'What... is... this?', pt: 'O que... é... isso?' },
      { who: '', en: 'The suitcase is full of rubber ducks. Hundreds of tiny yellow rubber ducks.', pt: 'A mala está cheia de patinhos de borracha. Centenas de patinhos amarelos.' },
      { who: 'Carla', en: 'This cannot be happening. I picked up the wrong suitcase!', pt: 'Isso não pode estar acontecendo. Peguei a mala errada!' },
      { who: '', en: 'There is a phone number on the tag. Carla calls it.', pt: 'Há um número de telefone na etiqueta. Carla liga.' },
      { who: 'Mr. Duncan', en: 'Hello? Oh, thank goodness! You have my ducks!', pt: 'Alô? Ah, graças a Deus! Você está com meus patos!' },
      { who: 'Carla', en: 'Yes... about that. WHY do you travel with hundreds of rubber ducks?', pt: 'Sim... sobre isso. POR QUE você viaja com centenas de patinhos de borracha?' },
      { who: 'Mr. Duncan', en: 'I collect them! Tomorrow is the World Rubber Duck Fair. These are very rare.', pt: 'Eu coleciono! Amanhã é a Feira Mundial do Pato de Borracha. Esses são raríssimos.' },
      { who: 'Carla', en: 'Of course it is. Meet me at the hotel lobby in one hour?', pt: 'Claro que é. Me encontra no saguão do hotel em uma hora?' },
      { who: 'Mr. Duncan', en: 'I will be there. And please... be gentle with Gerald. He is the golden one.', pt: 'Estarei lá. E por favor... cuidado com o Gerald. É o dourado.' },
    ],
    qs: [
      { after: 3, q: 'O que havia dentro da mala?', opts: ['Roupas de outra pessoa', 'Centenas de patinhos de borracha', 'Equipamento de fotografia'], ans: 1, exp: '"Full of rubber ducks" = cheia de patinhos de borracha. Sim, isso existe.' },
      { after: 4, q: '"I picked up the wrong suitcase" significa:', opts: ['Perdi minha mala', 'Peguei a mala errada', 'Minha mala quebrou'], ans: 1, exp: 'Phrasal verb "pick up" = pegar. Wrong = errado(a).' },
      { after: 8, q: 'Por que o Sr. Duncan viaja com os patinhos?', opts: ['Ele os vende na internet', 'É colecionador e vai a uma feira', 'São presentes para os netos'], ans: 1, exp: '"I collect them" + a Feira Mundial do Pato de Borracha (que, acredite, é plausível).' },
    ],
  },
  {
    id: 'text', titulo: 'The Midnight Text', nivel: 'B1', icon: '📱', desc: 'Uma mensagem enviada para a pessoa errada. A pessoa MUITO errada.',
    linhas: [
      { who: '', en: 'It is almost midnight. Nina is texting her best friend about her day at work.', pt: 'É quase meia-noite. Nina está mandando mensagem para a melhor amiga sobre o dia no trabalho.' },
      { who: 'Nina', en: 'Ugh, today was ENDLESS. If I hear the word "meeting" again, I will scream.', pt: 'Aff, hoje foi INTERMINÁVEL. Se eu ouvir a palavra "reunião" de novo, eu grito.' },
      { who: 'Nina', en: 'And my boss? He schedules meetings ABOUT meetings. Send help.', pt: 'E meu chefe? Ele marca reuniões SOBRE reuniões. Socorro.' },
      { who: '', en: 'Nina presses send... and freezes. She sent it to "Mr. Roberts — BOSS".', pt: 'Nina aperta enviar... e congela. Ela mandou para "Sr. Roberts — CHEFE".' },
      { who: 'Nina', en: 'No. No, no, no. Please tell me I did not do that.', pt: 'Não. Não, não, não. Por favor me diga que eu não fiz isso.' },
      { who: '', en: 'The three little dots appear. Mr. Roberts is typing.', pt: 'Os três pontinhos aparecem. O Sr. Roberts está digitando.' },
      { who: '', en: 'Nina considers moving to another country. Maybe changing her name.', pt: 'Nina considera se mudar de país. Talvez mudar de nome.' },
      { who: 'Mr. Roberts', en: 'To be honest, I also want to scream in those meetings.', pt: 'Para ser sincero, eu também tenho vontade de gritar nessas reuniões.' },
      { who: 'Mr. Roberts', en: 'New rule starting tomorrow: no meetings on Fridays. Thanks for the feedback. 😄', pt: 'Nova regra a partir de amanhã: sem reuniões às sextas. Obrigado pelo feedback. 😄' },
      { who: 'Nina', en: 'I cannot believe this. I got a promotion for complaining.', pt: 'Não acredito nisso. Ganhei uma melhoria por reclamar.' },
      { who: '', en: 'Nina still triple-checks every message before sending. Every single one.', pt: 'Nina ainda confere três vezes cada mensagem antes de enviar. Todas, sem exceção.' },
    ],
    qs: [
      { after: 3, q: 'Qual foi o erro da Nina?', opts: ['Esqueceu de responder a amiga', 'Mandou a reclamação para o próprio chefe', 'Perdeu o celular'], ans: 1, exp: 'Ela enviou para "Mr. Roberts — BOSS". O pesadelo universal do WhatsApp.' },
      { after: 5, q: '"Mr. Roberts is typing" — o que os três pontinhos indicam?', opts: ['Que ele está digitando', 'Que ele bloqueou a Nina', 'Que a mensagem falhou'], ans: 0, exp: '"Is typing" = está digitando (present continuous para ação em andamento).' },
      { after: 8, q: 'Como o chefe reagiu?', opts: ['Demitiu a Nina', 'Concordou e criou a sexta sem reuniões', 'Marcou uma reunião sobre a mensagem'], ans: 1, exp: 'Plot twist do bem: "no meetings on Fridays" + agradeceu o feedback.' },
    ],
  },
  {
    id: 'gps', titulo: 'The GPS Says Left', nivel: 'A2', icon: '🗺️', desc: 'Pedro confia no GPS. O GPS tem outros planos.',
    linhas: [
      { who: '', en: 'Pedro is driving in London for the first time.', pt: 'Pedro está dirigindo em Londres pela primeira vez.' },
      { who: 'GPS', en: 'In two hundred meters, turn left.', pt: 'Em duzentos metros, vire à esquerda.' },
      { who: 'Pedro', en: 'Left? But the hotel is on the right!', pt: 'Esquerda? Mas o hotel é à direita!' },
      { who: '', en: 'Pedro turns left anyway.', pt: 'Pedro vira à esquerda mesmo assim.' },
      { who: 'GPS', en: 'Turn left again.', pt: 'Vire à esquerda de novo.' },
      { who: 'Pedro', en: 'Okay, okay. You are the boss.', pt: 'Tá, tá. Você que manda.' },
      { who: '', en: 'He turns left two more times.', pt: 'Ele vira à esquerda mais duas vezes.' },
      { who: 'Pedro', en: 'Wait. This is the same street!', pt: 'Espera. Essa é a mesma rua!' },
      { who: 'GPS', en: 'You have arrived at your destination.', pt: 'Você chegou ao seu destino.' },
      { who: 'Pedro', en: 'This is not my hotel. This is a car wash!', pt: 'Isso não é meu hotel. É um lava-jato!' },
      { who: 'Funcionário', en: 'Good morning! Full wash?', pt: 'Bom dia! Lavagem completa?' },
      { who: 'Pedro', en: 'Why not? The car is already here.', pt: 'Por que não? O carro já está aqui.' },
      { who: '', en: 'The car got clean. Pedro got a taxi.', pt: 'O carro saiu limpo. Pedro pegou um táxi.' },
    ],
    qs: [
      { after: 2, q: 'Onde fica o hotel, segundo Pedro?', opts: ['À direita', 'À esquerda', 'Atrás dele', 'Num lava-jato'], ans: 0, exp: '"The hotel is on the right!"' },
      { after: 8, q: '"You have arrived" significa:', opts: ['Você chegou', 'Você errou', 'Você virou', 'Você parou'], ans: 0, exp: 'Arrive = chegar.' },
      { after: 12, q: 'Como a história termina?', opts: ['Carro limpo e Pedro de táxi', 'Pedro achou o hotel de carro', 'O GPS pediu desculpas', 'Pedro dormiu no carro'], ans: 0, exp: 'Aproveitou a lavagem e foi de táxi.' },
    ],
  },
  {
    id: 'date', titulo: 'The First Date', nivel: 'B1', icon: '🌹', desc: 'Lucas fala demais do gato. Por sorte, do gato certo.',
    linhas: [
      { who: '', en: 'Lucas is nervous. It is his first date with Julia.', pt: 'Lucas está nervoso. É o primeiro encontro com Julia.' },
      { who: 'Lucas', en: 'You look great! Sorry, I am a little nervous.', pt: 'Você está linda! Desculpa, estou meio nervoso.' },
      { who: 'Julia', en: 'Relax! Tell me about yourself.', pt: 'Relaxa! Me fala de você.' },
      { who: 'Lucas', en: 'Well... I have a cat. His name is Batman.', pt: 'Bom... eu tenho um gato. O nome dele é Batman.' },
      { who: 'Julia', en: 'Batman? That is a strong name.', pt: 'Batman? Nome forte.' },
      { who: 'Lucas', en: 'He is afraid of pigeons. And of the vacuum cleaner.', pt: 'Ele tem medo de pombos. E do aspirador.' },
      { who: '', en: 'Lucas talks about his cat for twenty minutes.', pt: 'Lucas fala do gato por vinte minutos.' },
      { who: 'Lucas', en: 'Sorry! I am talking too much about my cat.', pt: 'Desculpa! Estou falando demais do meu gato.' },
      { who: 'Julia', en: 'Actually... I loved it.', pt: 'Na verdade... eu adorei.' },
      { who: 'Lucas', en: 'Really? Why?', pt: 'Sério? Por quê?' },
      { who: 'Julia', en: 'I am a vet. Cats are my favorite patients.', pt: 'Sou veterinária. Gatos são meus pacientes favoritos.' },
      { who: 'Lucas', en: 'So... second date at my place? Batman needs a check-up.', pt: 'Então... segundo encontro lá em casa? O Batman precisa de check-up.' },
      { who: 'Julia', en: 'It is a date. Tell Batman I am coming.', pt: 'Combinado. Avisa o Batman que eu vou.' },
    ],
    qs: [
      { after: 5, q: '"Afraid of" significa:', opts: ['Com medo de', 'Amigo de', 'Longe de', 'Dono de'], ans: 0, exp: 'Afraid of = medo de.' },
      { after: 10, q: 'Qual é a profissão de Julia?', opts: ['Veterinária', 'Médica', 'Professora', 'Dona de pet shop'], ans: 0, exp: 'Vet = veterinária.' },
      { after: 12, q: '"It is a date" aqui significa:', opts: ['Combinado! Está marcado', 'É uma fruta', 'Que dia é hoje?', 'Recusa educada'], ans: 0, exp: 'Duplo sentido: date = encontro/combinado.' },
    ],
  },
  {
    id: 'room13', titulo: 'The Noise in Room 13', nivel: 'B1', icon: '🏨', desc: 'Um barulho na parede. Uma recepção misteriosa demais.',
    linhas: [
      { who: '', en: 'Marta checks into an old hotel. Room 13.', pt: 'Marta se hospeda num hotel antigo. Quarto 13.' },
      { who: 'Recepção', en: 'Enjoy your stay. And... good luck.', pt: 'Aproveite a estadia. E... boa sorte.' },
      { who: 'Marta', en: 'Good luck? What do you mean?', pt: 'Boa sorte? Como assim?' },
      { who: '', en: 'At midnight, Marta hears a strange noise.', pt: 'À meia-noite, Marta ouve um barulho estranho.' },
      { who: 'Marta', en: 'Hello? Reception? There is a scratching sound in my wall.', pt: 'Alô? Recepção? Tem um som de arranhão na minha parede.' },
      { who: 'Recepção', en: 'Again? Madam, do not open the closet, please.', pt: 'De novo? Senhora, não abra o armário, por favor.' },
      { who: 'Marta', en: 'Now I HAVE to open the closet.', pt: 'Agora eu TENHO que abrir o armário.' },
      { who: '', en: 'Marta slowly opens the closet door.', pt: 'Marta abre a porta do armário devagar.' },
      { who: 'Marta', en: 'A... cat?', pt: 'Um... gato?' },
      { who: '', en: 'The hotel cat, Whiskers, sleeps inside the walls.', pt: 'O gato do hotel, Whiskers, dorme dentro das paredes.' },
      { who: 'Recepção', en: 'He finds secret ways in. We stopped fighting it.', pt: 'Ele acha passagens secretas. A gente desistiu de brigar.' },
      { who: 'Marta', en: 'You could have just told me!', pt: 'Era só ter me contado!' },
      { who: 'Recepção', en: 'The mystery is part of the experience, madam.', pt: 'O mistério faz parte da experiência, senhora.' },
    ],
    qs: [
      { after: 2, q: '"What do you mean?" significa:', opts: ['O que você quer dizer?', 'Quanto custa?', 'Onde fica?', 'Que horas são?'], ans: 0, exp: 'Pedindo explicação.' },
      { after: 6, q: 'Por que Marta "TEM" que abrir o armário?', opts: ['A proibição deu curiosidade', 'Está com frio', 'O gato pediu', 'Foi ordem da recepção'], ans: 0, exp: 'Proibir = convidar. 😄' },
      { after: 12, q: 'O barulho era:', opts: ['O gato do hotel na parede', 'Um fantasma', 'O vizinho', 'O ar-condicionado'], ans: 0, exp: 'Whiskers, o gato explorador.' },
    ],
  },
  {
    id: 'elevator', titulo: 'Stuck with the CEO', nivel: 'B2', icon: '🛗', desc: 'O elevador para. A carreira do estagiário, não.',
    linhas: [
      { who: '', en: 'Dan, an intern, enters the elevator with a stranger.', pt: 'Dan, um estagiário, entra no elevador com um desconhecido.' },
      { who: '', en: 'Suddenly, the elevator stops between floors.', pt: 'De repente, o elevador para entre andares.' },
      { who: 'Dan', en: 'Great. Stuck. On my presentation day.', pt: 'Ótimo. Preso. Justo no dia da minha apresentação.' },
      { who: 'Estranho', en: 'Presentation? Tell me about it. We have time.', pt: 'Apresentação? Me conta. Temos tempo.' },
      { who: 'Dan', en: 'It is an idea to cut costs with smart lights.', pt: 'É uma ideia pra cortar custos com lâmpadas inteligentes.' },
      { who: 'Estranho', en: 'Interesting. What is the weak point?', pt: 'Interessante. Qual é o ponto fraco?' },
      { who: 'Dan', en: 'Honestly? The boss never listens to interns.', pt: 'Sinceramente? O chefe nunca escuta estagiário.' },
      { who: 'Estranho', en: 'Maybe the boss just never hears good ideas in elevators.', pt: 'Talvez o chefe só nunca ouça boas ideias em elevadores.' },
      { who: '', en: 'The elevator starts moving again.', pt: 'O elevador volta a se mover.' },
      { who: '', en: 'At the meeting, Dan sees the stranger at the head of the table.', pt: 'Na reunião, Dan vê o desconhecido na cabeceira da mesa.' },
      { who: 'CEO', en: 'Everyone, let us start with the smart lights idea.', pt: 'Pessoal, vamos começar pela ideia das lâmpadas inteligentes.' },
      { who: 'Dan', en: 'You... you are the CEO?', pt: 'Você... você é o CEO?' },
      { who: 'CEO', en: 'And you are the intern whose boss never listens. Go on, impress me.', pt: 'E você é o estagiário que o chefe nunca escuta. Vai lá, me impressione.' },
    ],
    qs: [
      { after: 6, q: '"The boss never listens to interns" revela:', opts: ['Frustração de Dan', 'Alegria', 'Medo do elevador', 'Preguiça'], ans: 0, exp: 'Desabafo sincero — na hora errada (ou certa).' },
      { after: 9, q: 'Quem era o estranho?', opts: ['O CEO da empresa', 'Outro estagiário', 'O porteiro', 'Um cliente'], ans: 0, exp: 'Estava na cabeceira da mesa.' },
      { after: 12, q: '"Go on, impress me" indica:', opts: ['Uma chance real pra Dan', 'Uma demissão', 'Uma piada de mau gosto', 'Um castigo'], ans: 0, exp: 'O CEO quer ouvir a ideia.' },
    ],
  },
  {
    id: 'review', titulo: 'The Five-Star Guest', nivel: 'B2', icon: '🏠', desc: 'O hóspede anota tudo. Paula surta com classe.',
    linhas: [
      { who: '', en: 'Paula rents her guest room to tourists.', pt: 'Paula aluga o quarto de hóspedes pra turistas.' },
      { who: 'Paula', en: 'Welcome! Fresh towels, chocolate, and a city map.', pt: 'Bem-vindo! Toalhas limpas, chocolate e um mapa da cidade.' },
      { who: 'Sr. Ito', en: 'Thank you. I will be very quiet.', pt: 'Obrigado. Serei bem silencioso.' },
      { who: '', en: 'The guest, Mr. Ito, takes notes about everything.', pt: 'O hóspede, Sr. Ito, anota tudo.' },
      { who: 'Paula', en: 'He writes when I serve breakfast. He writes when I speak!', pt: 'Ele escreve quando sirvo o café. Escreve quando eu falo!' },
      { who: '', en: 'Paula panics and upgrades everything.', pt: 'Paula entra em pânico e melhora tudo.' },
      { who: 'Paula', en: 'Organic coffee! Silk pillows! A welcome song!', pt: 'Café orgânico! Travesseiros de seda! Música de boas-vindas!' },
      { who: '', en: 'On the last day, Mr. Ito hands her a notebook.', pt: 'No último dia, o Sr. Ito entrega um caderno a ela.' },
      { who: 'Sr. Ito', en: 'Thank you for the best chapter of my book.', pt: 'Obrigado pelo melhor capítulo do meu livro.' },
      { who: 'Paula', en: 'Chapter? You are not a hotel inspector?', pt: 'Capítulo? Você não é inspetor de hotéis?' },
      { who: 'Sr. Ito', en: 'I am a novelist. My character needed a kind host.', pt: 'Sou romancista. Minha personagem precisava de uma anfitriã gentil.' },
      { who: 'Paula', en: 'So the notes were... about me?', pt: 'Então as anotações eram... sobre mim?' },
      { who: 'Sr. Ito', en: 'Five stars, by the way. And you get a copy when it is published.', pt: 'Cinco estrelas, aliás. E você ganha um exemplar quando for publicado.' },
    ],
    qs: [
      { after: 4, q: 'Por que Paula está preocupada?', opts: ['O hóspede anota tudo', 'O hóspede é barulhento', 'O hóspede não paga', 'O hóspede sumiu'], ans: 0, exp: 'Ela acha que está sendo avaliada.' },
      { after: 10, q: 'Sr. Ito é:', opts: ['Escritor', 'Inspetor de hotéis', 'Crítico de comida', 'Detetive'], ans: 0, exp: 'Novelist = romancista.' },
      { after: 12, q: 'Como termina?', opts: ['5 estrelas e Paula vira personagem', '1 estrela', 'Paula expulsa o hóspede', 'O livro é cancelado'], ans: 0, exp: 'Final feliz — e literário.' },
    ],
  },
  {
    id: 'ticket', titulo: 'The Winning Ticket', nivel: 'C1', icon: '🎫', desc: 'Um bilhete premiado no casaco do avô. Ou quase.',
    linhas: [
      { who: '', en: 'Rui finds an old lottery ticket in his late grandfather\'s coat.', pt: 'Rui encontra um bilhete de loteria antigo no casaco do falecido avô.' },
      { who: 'Rui', en: 'No way. These are last Saturday\'s winning numbers!', pt: 'Não acredito. São os números sorteados no sábado passado!' },
      { who: '', en: 'His hands trembling, he checks the draw date twice.', pt: 'Com as mãos tremendo, ele confere a data do sorteio duas vezes.' },
      { who: 'Rui', en: 'Six matches. Six! I need to sit down.', pt: 'Seis acertos. Seis! Preciso sentar.' },
      { who: '', en: 'Then he notices the fine print: the ticket is from last year.', pt: 'Então ele repara nas letras miúdas: o bilhete é do ano passado.' },
      { who: 'Rui', en: 'Expired. Of course. Story of my life.', pt: 'Vencido. Claro. História da minha vida.' },
      { who: '', en: 'About to throw it away, he sees writing on the back.', pt: 'Quase jogando fora, ele vê algo escrito no verso.' },
      { who: 'Vovô (bilhete)', en: 'If you are reading this, check the coat\'s inner pocket.', pt: 'Se você está lendo isto, olhe o bolso interno do casaco.' },
      { who: '', en: 'Inside, there is a small key and an address.', pt: 'Dentro, há uma chavinha e um endereço.' },
      { who: 'Rui', en: 'A safe deposit box? Grandpa, what did you do?', pt: 'Um cofre de banco? Vô, o que você aprontou?' },
      { who: '', en: 'At the bank, the box contains no money at all.', pt: 'No banco, o cofre não tem dinheiro nenhum.' },
      { who: '', en: 'Only letters — one for every birthday Rui had missed with him.', pt: 'Só cartas — uma pra cada aniversário que Rui não passou com ele.' },
      { who: 'Rui', en: 'You old romantic. This is worth more than the jackpot.', pt: 'Seu velho romântico. Isso vale mais que o prêmio.' },
    ],
    qs: [
      { after: 4, q: '"Fine print" refere-se a:', opts: ['As letras miúdas', 'A caligrafia bonita', 'O valor do prêmio', 'A fila da lotérica'], ans: 0, exp: 'Fine print = letrinhas pequenas (detalhes).' },
      { after: 9, q: 'O que havia no bolso interno?', opts: ['Uma chave e um endereço', 'Dinheiro', 'Outro bilhete', 'Uma foto'], ans: 0, exp: '"A small key and an address."' },
      { after: 12, q: 'Por que vale mais que o prêmio?', opts: ['As cartas têm valor sentimental', 'Ele vendeu as cartas', 'Havia ouro no cofre', 'Ele ganhou na loteria'], ans: 0, exp: 'Uma carta pra cada aniversário perdido. 🥲' },
    ],
  },
]

// Caça-Erros do Brasileiro: as armadilhas clássicas de quem fala português — traduções
// literais, falsos cognatos, preposições, make/do e pronúncia. Conteúdo curado; 5 por dia.
const ERROS_BR: { cat: string; q: string; opts: string[]; ans: number; exp: string }[] = [
  // Traduções literais
  { cat: 'Tradução literal', q: 'Como dizer "Tenho 25 anos"?', opts: ['I have 25 years', 'I am 25 years old', 'I have 25 years old'], ans: 1, exp: 'Idade em inglês usa o verbo BE, não HAVE. "I have 25 years" é a tradução literal do português — o erro nº 1 do brasileiro.' },
  { cat: 'Tradução literal', q: 'Você quer perguntar algo. "Fazer uma pergunta" é...', opts: ['make a question', 'ask a question', 'do a question'], ans: 1, exp: 'Pergunta se ASK: ask a question. "Make/do a question" não existem em inglês.' },
  { cat: 'Tradução literal', q: '"Tenho certeza" =', opts: ['I have sure', 'I am sure', 'I have the certainty'], ans: 1, exp: '"Sure" é adjetivo, então usa BE: I am sure. "I have sure" é português com roupa de inglês.' },
  { cat: 'Tradução literal', q: '"Estou com fome" =', opts: ['I am with hunger', 'I am hungry', 'I have hunger'], ans: 1, exp: 'Fome, sede, medo e sono viram adjetivos com BE: hungry, thirsty, afraid, sleepy.' },
  { cat: 'Tradução literal', q: '"Ela concorda comigo" =', opts: ['She agrees with me', 'She is agree with me', 'She is according with me'], ans: 0, exp: 'AGREE já é o verbo: she agrees. "Is agree" vem do nosso "estar de acordo".' },
  { cat: 'Tradução literal', q: '"Vou fazer uma festa" =', opts: ["I'm going to do a party", "I'm going to have a party", "I'm going to make a party"], ans: 1, exp: 'Festa se HAVE (ou throw): have a party. Make/do a party é literal do português.' },
  { cat: 'Tradução literal', q: '"Estou esperando você" =', opts: ["I'm waiting you", "I'm waiting for you", "I'm hoping you"], ans: 1, exp: 'WAIT sempre pede FOR: wait for someone. E hope é ter esperança, não esperar alguém.' },
  { cat: 'Tradução literal', q: '"Deixa eu ver..." =', opts: ['Let I see...', 'Let me see...', 'Leave I see...'], ans: 1, exp: 'Depois de LET vem o pronome objeto: let ME see, let HIM go, let US try.' },
  // Falsos cognatos
  { cat: 'Falso cognato', q: '"Pretendo viajar em julho" =', opts: ['I pretend to travel in July', 'I intend to travel in July', 'I prevent to travel in July'], ans: 1, exp: 'PRETEND é FINGIR! Pretender = intend / plan to. Falso cognato campeão de mico.' },
  { cat: 'Falso cognato', q: 'Seu colega diz "Actually, the meeting is today". Actually significa...', opts: ['atualmente', 'na verdade', 'eventualmente'], ans: 1, exp: 'ACTUALLY = na verdade. Atualmente = currently / nowadays.' },
  { cat: 'Falso cognato', q: 'Na porta está escrito PUSH. Você deve...', opts: ['puxar', 'empurrar', 'parar'], ans: 1, exp: 'PUSH = empurrar (o contrário do que parece!). Puxar = PULL. Todo brasileiro já errou essa porta.' },
  { cat: 'Falso cognato', q: '"Ele é um ótimo cozinheiro" =', opts: ['He is a great cooker', 'He is a great cook', 'He is a great chef of kitchen'], ans: 1, exp: 'COOKER é o fogão! A pessoa é cook (ou chef).' },
  { cat: 'Falso cognato', q: '"Meus parentes moram no Rio" =', opts: ['My parents live in Rio', 'My relatives live in Rio', 'My relations live in Rio'], ans: 1, exp: 'PARENTS = só pai e mãe. Parentes em geral = RELATIVES.' },
  { cat: 'Falso cognato', q: '"A fábrica fechou" — fábrica =', opts: ['fabric', 'factory', 'farm'], ans: 1, exp: 'FABRIC é tecido! Fábrica = factory.' },
  { cat: 'Falso cognato', q: 'Se você diz "I\'m constipated" para o médico, ele entende que você está...', opts: ['resfriado', 'com o intestino preso', 'constrangido'], ans: 1, exp: 'CONSTIPATED = intestino preso 😅. Resfriado = "I have a cold".' },
  { cat: 'Falso cognato', q: 'Fantasia de carnaval em inglês é...', opts: ['costume', 'custom', 'fantasy'], ans: 0, exp: 'COSTUME = fantasia. CUSTOM = costume/hábito. E fantasy é fantasia de imaginação, não de vestir.' },
  { cat: 'Falso cognato', q: '"Ela assistiu à palestra" — palestra =', opts: ['lecture', 'palace', 'speech class'], ans: 0, exp: 'Palestra = LECTURE. (E "assistir" é attend/watch — "assist" é ajudar, outro falso amigo!)' },
  // 3ª pessoa e gramática
  { cat: 'Gramática', q: '"Ela trabalha aqui" =', opts: ['She work here', 'She works here', 'She is work here'], ans: 1, exp: 'He/she/it ganha S no presente: works. Em português o verbo não muda assim — por isso esquecemos.' },
  { cat: 'Gramática', q: '"Ele não gosta de café" =', opts: ["He don't like coffee", "He doesn't like coffee", 'He not like coffee'], ans: 1, exp: 'Com he/she/it a negação é DOESN\'T — e o verbo volta ao normal (like, sem s).' },
  { cat: 'Gramática', q: '"As pessoas são legais" =', opts: ['The people is nice', 'People are nice', 'The persons are nice'], ans: 1, exp: 'PEOPLE já é plural (are) e dispensa "the" para generalizar.' },
  { cat: 'Gramática', q: '"Eu gosto muito disso" =', opts: ['I like very much this', 'I really like this', 'I like very this'], ans: 1, exp: '"I like very much this" é ordem do português. Diga "I really like this" ou "I like this very much" (no final).' },
  { cat: 'Gramática', q: '"Eu a conheço há anos" =', opts: ['I know her for years', "I've known her for years", 'I meet her for years'], ans: 1, exp: 'Algo que começou no passado e continua pede present perfect: I\'ve known her for years.' },
  { cat: 'Gramática', q: '"Tem um mercado aqui perto" =', opts: ['Have a market near here', 'There is a market near here', 'It has a market near here'], ans: 1, exp: 'O nosso "tem" de existência é THERE IS/ARE — nunca "have" solto.' },
  // Preposições
  { cat: 'Preposição', q: '"Vi um vídeo na internet" =', opts: ['in the internet', 'on the internet', 'at the internet'], ans: 1, exp: 'Internet, TV e rádio usam ON: on the internet, on TV, on the radio.' },
  { cat: 'Preposição', q: '"Estou no ônibus" =', opts: ["I'm in the bus", "I'm on the bus", "I'm at the bus"], ans: 1, exp: 'Transporte público usa ON: on the bus/train/plane. IN fica para o carro: in the car.' },
  { cat: 'Preposição', q: '"Chego em casa às 7" =', opts: ['I arrive to home at 7', 'I get home at 7', 'I arrive in home at 7'], ans: 1, exp: 'GET HOME — sem preposição antes de home. E "arrive to" não existe (arrive in/at).' },
  { cat: 'Preposição', q: '"Depende de você" =', opts: ['It depends of you', 'It depends on you', 'It depends from you'], ans: 1, exp: 'DEPEND pede ON: depends on you. O "of" é o nosso "de" se intrometendo.' },
  { cat: 'Preposição', q: '"Sonhei com você" =', opts: ['I dreamed with you', 'I dreamed about you', 'I dreamed on you'], ans: 1, exp: 'DREAM ABOUT/OF someone. "Dream with" seria sonhar em dupla 😄.' },
  { cat: 'Preposição', q: '"Ela é casada com um argentino" =', opts: ['married with an Argentinian', 'married to an Argentinian', 'married at an Argentinian'], ans: 1, exp: 'MARRIED TO someone. ("Married with children" = casado E com filhos.)' },
  // Make / do / have / take
  { cat: 'Make ou do?', q: '"Fazer a lição de casa" =', opts: ['make homework', 'do homework', 'take homework'], ans: 1, exp: 'Homework se DO. Regra prática: DO = tarefa/trabalho, MAKE = criar algo novo.' },
  { cat: 'Make ou do?', q: '"Tirar uma foto" =', opts: ['make a photo', 'take a photo', 'do a photo'], ans: 1, exp: 'Foto se TAKE: take a photo/picture.' },
  { cat: 'Make ou do?', q: '"Fazer uma prova" =', opts: ['make a test', 'take a test', 'do the proof'], ans: 1, exp: 'Prova se TAKE: take a test. Quem "makes the test" é o professor — ele a cria!' },
  { cat: 'Make ou do?', q: '"Tomar café da manhã" =', opts: ['take the breakfast', 'have breakfast', 'drink breakfast'], ans: 1, exp: 'Refeições se HAVE: have breakfast/lunch/dinner.' },
  { cat: 'Make ou do?', q: '"Fazer amigos" =', opts: ['do friends', 'make friends', 'get friends'], ans: 1, exp: 'Amizade se MAKE: make friends — você "constrói" a amizade.' },
  { cat: 'Make ou do?', q: '"Ganhar dinheiro (trabalhando)" =', opts: ['win money', 'make money', 'gain money'], ans: 1, exp: 'Trabalhando você MAKE (ou earn) money. WIN é ganhar na loteria ou num jogo.' },
  { cat: 'Make ou do?', q: '"Perdi o ônibus!" =', opts: ['I lost the bus!', 'I missed the bus!', 'I wasted the bus!'], ans: 1, exp: 'Perder transporte, aula ou evento = MISS. Lose é para objetos e jogos.' },
  // Pronúncia (percepção)
  { cat: 'Pronúncia', q: '"Three" (3) e "free" (grátis) começam com o mesmo som?', opts: ['Sim, os dois soam "fri"', 'Não: three começa com a língua entre os dentes (th)', 'Sim, os dois soam "tri"'], ans: 1, exp: 'O TH não existe em português — na boca do brasileiro vira F (ou T). Ponta da língua entre os dentes e sopre: THree ≠ Free.' },
  { cat: 'Pronúncia', q: 'Como soa o "-ed" de "worked"?', opts: ['uork-ED, com sílaba extra', 'workt, som de T', 'workid'], ans: 1, exp: 'Depois de sons surdos (k, p, s, sh), o -ed soa T: workt, stopt. Sem sílaba extra!' },
  { cat: 'Pronúncia', q: 'Quantas sílabas você FALA em "comfortable"?', opts: ['4: com-for-ta-ble', '3: cômf-tə-bol', '5: com-for-ta-bl-e'], ans: 1, exp: 'Fala-se "CÔMF-tə-bol" (3 sílabas). O brasileiro tende a ler todas as letras — o inglês engole várias.' },
  { cat: 'Pronúncia', q: '"Beach" (praia) e "bitch" — qual a diferença na fala?', opts: ['Nenhuma, soam igual', 'O "ea" de beach é looongo: biiich', 'Beach termina com som de X'], ans: 1, exp: 'Vogal longa salva você do mico: beach = "biiich" (i longo). O i curto é a outra palavra 😬.' },
  { cat: 'Pronúncia', q: 'O "h" de "hot" e "house" se pronuncia...', opts: ['mudo, como em "hora"', 'soprado, como um "rr" carioca leve', 'como G'], ans: 1, exp: 'O H inglês é aspirado (um sopro). Em português ele é mudo — por isso o brasileiro o come: "ot dog".' },
  { cat: 'Pronúncia', q: '"School" se fala...', opts: ['is-cul (com i antes)', 'scul (direto no S)', 'chul'], ans: 1, exp: 'Nada de "i" antes do S! sCHool, sTop, sPeak — comece direto no S. O "is-top" é o sotaque BR clássico.' },
  // Expressões
  { cat: 'Expressão', q: '"Estou de folga hoje" =', opts: ["I'm in rest today", "I'm off today", "I'm on vacation of one day"], ans: 1, exp: '"I\'m off today" / "It\'s my day off" — curto e nativo.' },
  { cat: 'Expressão', q: '"Vamos combinar alguma coisa!" =', opts: ["Let's combine something!", "Let's make plans!", "Let's match something!"], ans: 1, exp: 'COMBINE é misturar elementos. Marcar algo com alguém = make plans / arrange something.' },
  { cat: 'Expressão', q: '"Tomara que dê certo!" =', opts: ['I wait it works!', 'I hope it works out!', 'I wish it works!'], ans: 1, exp: 'Torcer por algo = HOPE: I hope it works out. (Wait é esperar no relógio; wish pede passado.)' },
  { cat: 'Expressão', q: 'Para pedir silêncio: "quiet", "quite" ou "quit"?', opts: ['Be quite', 'Be quiet', 'Be quit'], ans: 1, exp: 'QUIET = silencioso. QUITE = bastante. QUIT = desistir. Trio traiçoeiro na escrita!' },
  { cat: 'Expressão', q: '"Vou pensar no assunto" (resposta educada) =', opts: ['I will think', "I'll think about it", 'I go to think it'], ans: 1, exp: '"I\'ll think about it" — o ABOUT IT é obrigatório para soar natural.' },
]

// O Simulador responde em inglês + uma linha "[PT] ..." com a tradução/correção.
// Estes helpers separam as duas partes para exibir (inglês em cima, PT embaixo)
// e para a voz ler SÓ o inglês.
function separaPT(text: string): { en: string; pt: string } {
  const t = (text || '').replace(/\r/g, '')
  const i = t.search(/\[PT\]/i)
  if (i === -1) return { en: t.trim(), pt: '' }
  return { en: t.slice(0, i).trim(), pt: t.slice(i).replace(/\[PT\]\s*/i, '').trim() }
}
function soIngles(text: string): string { return separaPT(text).en }

// Rede de segurança do microfone: o reconhecimento de voz do Android às vezes
// re-entrega o que já disse, gerando "where where is where is the...". Esta função
// colapsa blocos imediatamente repetidos (de qualquer tamanho), transformando
// "where is the most where is the most beautiful" em "where is the most beautiful".
function colapsarRepeticao(text: string): string {
  if (!text) return text
  const w = text.split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (const word of w) {
    out.push(word)
    const n = out.length
    // procura o maior bloco k tal que os últimos 2k formem [X][X]; remove uma cópia.
    for (let k = Math.floor(n / 2); k >= 1; k--) {
      let dup = true
      for (let j = 0; j < k; j++) {
        if (out[n - 2 * k + j].toLowerCase() !== out[n - k + j].toLowerCase()) { dup = false; break }
      }
      if (dup) { out.splice(n - k, k); break }
    }
  }
  return out.join(' ')
}

// A IA às vezes responde com markdown mesmo sem pedirmos. Renderiza o básico (**negrito**)
// e remove separadores "---" em vez de mostrar os asteriscos crus na tela.
function TextoIA({ text }: { text: string }) {
  const limpo = text.split('\n').filter(l => l.trim() !== '---').join('\n').replace(/\s+---\s+/g, '\n')
  const partes = limpo.split(/\*\*([^*]+)\*\*/g)
  return <>{partes.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}</>
}

// Bloco pulsante de carregamento (skeleton) — sensação de app vivo enquanto os dados chegam.
function Skel({ h = 16, w = '100%' as string | number, r = 12, mb = 0 }: { h?: number; w?: string | number; r?: number; mb?: number }) {
  return <div className="su-skel" style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} />
}

// Nível numérico a partir do XP total (sobe rápido no começo, dando "level up" frequente).
function nivelDeXp(xp: number) {
  let nivel = 1, need = 100, acc = 0
  while (xp >= acc + need) { acc += need; nivel++; need = 100 + (nivel - 1) * 50 }
  return { nivel, into: xp - acc, need, pct: Math.round(((xp - acc) / need) * 100) }
}

export default function AppPage() {
  const XP_PENDING_KEY = 'speakup_xp_pending'
  const [tab, setTab] = useState('home')
  const [level, setLevel] = useState('A1')
  const [view, setView] = useState<ViewType>('levels')
  const [lessonIdx, setLessonIdx] = useState(0)
  const [lisIdx, setLisIdx] = useState(0)
  const [lisSel, setLisSel] = useState(-1)
  const [lisAns, setLisAns] = useState(false)
  const [lisScore, setLisScore] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [buildIdx, setBuildIdx] = useState(0)
  const [buildPicked, setBuildPicked] = useState<number[]>([])
  const [buildChecked, setBuildChecked] = useState(false)
  const [ditIdx, setDitIdx] = useState(0)
  const [ditInput, setDitInput] = useState('')
  const [ditChecked, setDitChecked] = useState(false)
  const [tradIdx, setTradIdx] = useState(0)
  const [tradInput, setTradInput] = useState('')
  const [tradChecked, setTradChecked] = useState(false)
  const [xp, setXp] = useState(0)
  const [xpHydrated, setXpHydrated] = useState(false)
  const [streak, setStreak] = useState(0)
  const [recorde, setRecorde] = useState(0)
  const [lembretesAtivos, setLembretesAtivos] = useState(false)
  const [conqNova, setConqNova] = useState<{ e: string; nome: string } | null>(null)
  const [licoesConcluidas, setLicoesConcluidas] = useState<string[]>([])
  const [licaoDiaData, setLicaoDiaData] = useState('')
  const [isPremium, setIsPremium] = useState(BETA_GRATIS)
  // App iOS (Capacitor): compra via Apple; sem mencionar pagamento externo (regra 3.1.1)
  const [isIOSNative, setIsIOSNative] = useState(false)
  useEffect(() => { if ((window as any).Capacitor?.isNativePlatform?.()) setIsIOSNative(true) }, [])

  const tocarSom = (tipo: 'acerto' | 'erro') => {
    try {
      const audio = new Audio(tipo === 'acerto' ? '/acerto.mp3' : '/erro.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch (e) {}
    try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(tipo === 'acerto' ? [0, 30, 40, 30] : 60) } catch (e) {}
  }
  // Torcida de XP: número da home "sobe" animado até o valor real
  const [xpShown, setXpShown] = useState(0)
  useEffect(() => {
    const start = xpShown, end = xp
    if (start === end) return
    let raf = 0; const dur = 700, t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); const eased = 1 - Math.pow(1 - p, 3); setXpShown(Math.round(start + (end - start) * eased)); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [xp])
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [vocabCat, setVocabCat] = useState('all')
  const [vocabSrs, setVocabSrs] = useState<Record<string, string>>({})
  const [vocabModo, setVocabModo] = useState('all')
  const [vocabDiaData, setVocabDiaData] = useState('')
  const [perfilIa, setPerfilIa] = useState<any>({})
  const [onboarded, setOnboarded] = useState(false)
  const [hist, setHist] = useState<Record<string, number>>({})
  const [feedbackModal, setFeedbackModal] = useState(false)
  const [avalModal, setAvalModal] = useState(false)
  // Modo escuro (opt-in): classe .dark no <html> troca as variáveis de cor do globals.css.
  const [temaEscuro, setTemaEscuro] = useState(false)
  useEffect(() => {
    try {
      const t = localStorage.getItem('speakup_tema') === 'escuro'
      setTemaEscuro(t)
      document.documentElement.classList.toggle('dark', t)
    } catch (e) {}
  }, [])
  function alternarTema() {
    const novo = !temaEscuro
    setTemaEscuro(novo)
    try { localStorage.setItem('speakup_tema', novo ? 'escuro' : 'claro') } catch (e) {}
    try { document.documentElement.classList.toggle('dark', novo) } catch (e) {}
    try { track('tema_' + (novo ? 'escuro' : 'claro')) } catch (e) {}
  }
  const [feedbackTxt, setFeedbackTxt] = useState('')
  const [feedbackEnviado, setFeedbackEnviado] = useState(false)
  const [onbStep, setOnbStep] = useState(0)
  const [onbObj, setOnbObj] = useState('')
  const [onbMeta, setOnbMeta] = useState(50)
  const [chatMsgs, setChatMsgs] = useState<Msg[]>([{ role: 'ai', text: 'Olá! Sou seu professor de inglês com IA. Pode me perguntar sobre gramática, vocabulário ou praticar conversação. Como posso ajudar?' }])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [userName, setUserName] = useState('Aluno')
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  // Voz automática do simulador: a IA "fala" cada resposta (imersão). Persistido no aparelho.
  const [autoVoz, setAutoVoz] = useState(true)
  useEffect(() => { try { const v = localStorage.getItem('speakup_autovoz'); if (v !== null) setAutoVoz(v === '1') } catch (e) {} }, [])
  const [convMsgs, setConvMsgs] = useState<ConvMsg[]>([])
  const [convInput, setConvInput] = useState('')
  const [loadingConv, setLoadingConv] = useState(false)
  const [convStarted, setConvStarted] = useState(false)
  const [simDiaData, setSimDiaData] = useState('')
  const [profDiaData, setProfDiaData] = useState('')
  const [moedas, setMoedas] = useState(0)
  const [streakFreezes, setStreakFreezes] = useState(0)
  const [bauDia, setBauDia] = useState('')
  const [bauReward, setBauReward] = useState<number | null>(null)
  const [lojaModal, setLojaModal] = useState(false)
  const [xpFloat, setXpFloat] = useState(0)
  const [tempoMin, setTempoMin] = useState(0)
  const [missoes, setMissoes] = useState<{ week: number; claimed: string[] }>({ week: 0, claimed: [] })
  const [conqExpand, setConqExpand] = useState(false)
  const [ajudaTxt, setAjudaTxt] = useState<string | null>(null)
  const [ajudaLoading, setAjudaLoading] = useState(false)
  const [dictCat, setDictCat] = useState('casa')
  const [fluencyReport, setFluencyReport] = useState<{score:number;strengths:string[];improvements:string[];message:string}|null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(-1)
  const [nivIdx, setNivIdx] = useState(0)
  const [nivScore, setNivScore] = useState<number[]>([0,0,0,0,0,0])
  const [nivSel, setNivSel] = useState(-1)
  const [nivAns, setNivAns] = useState(false)
  const [nivResult, setNivResult] = useState<string | null>(null)
  const [desafioFeito, setDesafioFeito] = useState(false)
  const [desQ, setDesQ] = useState(0)
  const [desSel, setDesSel] = useState(-1)
  const [desAns, setDesAns] = useState(false)
  const [desAcertos, setDesAcertos] = useState(0)
  const [desResult, setDesResult] = useState(false)
  const [histSel, setHistSel] = useState<string | null>(null)
  const [histPos, setHistPos] = useState(1)
  const [histAns, setHistAns] = useState<Record<number, number>>({})
  const [histPt, setHistPt] = useState<Record<number, boolean>>({})
  const [histFim, setHistFim] = useState(false)
  const [histDone, setHistDone] = useState<string[]>([])
  const [errbrFeito, setErrbrFeito] = useState(false)
  const [errQ, setErrQ] = useState(0)
  const [errSel, setErrSel] = useState(-1)
  const [errAns, setErrAns] = useState(false)
  const [errAcertos, setErrAcertos] = useState(0)
  const [errResult, setErrResult] = useState(false)
  // Revisão Inteligente (SRS): agenda cada lição concluída para voltar na hora certa.
  const [srsData, setSrsData] = useState<Record<string, { due: string; box: number }>>({})
  const [revQ, setRevQ] = useState(0)
  const [revSel, setRevSel] = useState(-1)
  const [revAns, setRevAns] = useState(false)
  const [revAcertos, setRevAcertos] = useState(0)
  const [revResult, setRevResult] = useState(false)
  const licaoErrosRef = useRef(0)
  const licaoComboRef = useRef(0)
  const [whatsapp, setWhatsapp] = useState('')
  const [whatsappInput, setWhatsappInput] = useState('')
  const [pronCat, setPronCat] = useState<string | null>(null)
  const [pronIdx, setPronIdx] = useState(0)
  const [pronListening, setPronListening] = useState(false)
  const [pronHeard, setPronHeard] = useState('')
  const [pronScore, setPronScore] = useState<number | null>(null)
  const [pronTip, setPronTip] = useState('')
  const [pronLoadingTip, setPronLoadingTip] = useState(false)
  const [zapModal, setZapModal] = useState(false)
  const [provaQ, setProvaQ] = useState(0)
  const [provaSel, setProvaSel] = useState(-1)
  const [provaAns, setProvaAns] = useState(false)
  const [provaAcertos, setProvaAcertos] = useState(0)
  const [provaResult, setProvaResult] = useState(false)
  const [provaScoreSemana, setProvaScoreSemana] = useState<number | null>(null)
  const [provaNivelEscolhido, setProvaNivelEscolhido] = useState(false)
  const [dbLessons, setDbLessons] = useState<Record<string, Lesson[]>>({ beginner: [], intermediate: [], advanced: [] })
  const recognitionRef = useRef<any>(null)
  const micAtivoRef = useRef(false)
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null)
  const ttsServidorRef = useRef(true)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const sttServidorRef = useRef<boolean | null>(null)
  const ttsPendentesRef = useRef<Set<string>>(new Set())
  // As vozes do navegador carregam de forma assíncrona — este listener garante que
  // melhorVozEN() encontre a lista completa no primeiro toque em "Ouvir".
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const carrega = () => window.speechSynthesis.getVoices()
    carrega()
    window.speechSynthesis.addEventListener?.('voiceschanged', carrega)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', carrega)
  }, [])
  const xpSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Segurança: se trocar de aba enquanto grava, encerra o microfone (não fica ligado em 2º plano).
  useEffect(() => { pararMic() }, [tab])
  const lastSyncedXpRef = useRef<number | null>(null)
  const semNumRef = useRef<number | null>(null)
  const semBaseRef = useRef(0)
  const [ligaData, setLigaData] = useState<{ nome: string; sem_xp: number }[]>([])
  const [ligaLoading, setLigaLoading] = useState(false)
  const convEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const lessons: Record<string, Lesson[]> = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] }
  const allForCefr = [...baseLessons.beginner, ...baseLessons.intermediate, ...baseLessons.advanced, ...dbLessons.beginner, ...dbLessons.intermediate, ...dbLessons.advanced]
  // Lições do banco podem repetir as fixas do app — dedup por título para não inflar
  // contadores nem mostrar a mesma lição duas vezes na trilha.
  const titulosVistos = new Set<string>()
  allForCefr.forEach(l => { if (titulosVistos.has(l.title)) return; titulosVistos.add(l.title); const k = cefrByTitle[l.title] || l.cefr || 'A1'; if (lessons[k]) lessons[k].push({ ...l, q: (l.q || []).map(embaralharQ) }) })

  const totalLessons = Object.values(lessons).flat().length
  const doneLessons = licoesConcluidas.length
  const conquistasDef = [
    { id: 'l1', e: '🎯', nome: '1ª lição', ok: doneLessons >= 1 },
    { id: 's3', e: '🔥', nome: '3 dias', ok: streak >= 3 },
    { id: 's7', e: '🚀', nome: '7 dias', ok: streak >= 7 },
    { id: 'x100', e: '⭐', nome: '100 XP', ok: xp >= 100 },
    { id: 'l10', e: '📚', nome: '10 lições', ok: doneLessons >= 10 },
    { id: 'x500', e: '💎', nome: '500 XP', ok: xp >= 500 },
    { id: 'l30', e: '🎓', nome: '30 lições', ok: doneLessons >= 30 },
    { id: 's30', e: '🏆', nome: '30 dias', ok: streak >= 30 },
  ]
  const FREE_LIMIT = 3
  const saudacao = (() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' })()
  const isNovo = xp === 0 && streak === 0 && doneLessons === 0

  // Data no fuso do aparelho (YYYY-MM-DD). toISOString() usa UTC e viraria o dia às 21h no Brasil.
  const dataLocal = (diasAtras = 0) => { const d = new Date(Date.now() - diasAtras * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
  const hojeStr = dataLocal(0)
  const LIMITE_DIA_LICOES = 3
  const licoesHoje = (() => { const p = licaoDiaData.split(':'); return p[0] === hojeStr ? (parseInt(p[1]) || 0) : 0 })()
  const metaFeitaHoje = licoesHoje >= LIMITE_DIA_LICOES
  const simulacoesHoje = (() => { const p = simDiaData.split(':'); return p[0] === hojeStr ? (parseInt(p[1]) || 0) : 0 })()
  const PROF_LIMIT = 10
  const PROF_LIMIT_PREMIUM = 120 // uso justo (proteção de custo); invisível ao aluno
  const profHoje = (() => { const p = profDiaData.split(':'); return p[0] === hojeStr ? (parseInt(p[1]) || 0) : 0 })()
  const profBloqueado = !isPremium && profHoje >= PROF_LIMIT
  const [xpInicioDia, setXpInicioDia] = useState(0)
  useEffect(() => {
    if (!xpHydrated) return // só define a base do dia depois do XP carregar do banco
    try {
      const raw = localStorage.getItem('speakup_xpdia')
      if (raw) {
        const [dia, base] = raw.split('|')
        if (dia === hojeStr) { setXpInicioDia(parseInt(base) || 0); return }
      }
      localStorage.setItem('speakup_xpdia', hojeStr + '|' + xp)
      setXpInicioDia(xp)
    } catch (e) {}
  }, [xpHydrated])
  const xpHoje = Math.max(0, xp - xpInicioDia)

  Object.values(lessons).flat().forEach(l => { l.done = licoesConcluidas.includes(l.title) })

  useEffect(() => {
    try { const sn = localStorage.getItem('speakup_nivel'); if (sn && lessons[sn]) setLevel(sn) } catch (e) {}
  }, [])

  const desafioPool = Object.values(lessons).flat().flatMap(l => l.q || [])
  const daySeed = Math.floor(Date.now() / 86400000)
  const desafioQuestions: Question[] = (() => {
    if (desafioPool.length < 5) return []
    // Passo modular pode ciclar sem visitar todos os índices (quando o tamanho do pool
    // é múltiplo do passo) — por isso o laço é LIMITADO e completa sequencialmente.
    const idxs: number[] = []
    let k = daySeed % desafioPool.length
    for (let p = 0; idxs.length < 5 && p < desafioPool.length; p++) { if (!idxs.includes(k)) idxs.push(k); k = (k + 137) % desafioPool.length }
    for (let i = 0; idxs.length < 5 && i < desafioPool.length; i++) if (!idxs.includes(i)) idxs.push(i)
    return idxs.map(i => desafioPool[i])
  })()

  useEffect(() => {
    try { const d = localStorage.getItem('speakup_desafio'); setDesafioFeito(d === hojeStr) } catch (e) {}
    try { const d = localStorage.getItem('speakup_errbr'); setErrbrFeito(d === hojeStr) } catch (e) {}
    try { const h = localStorage.getItem('speakup_hist_done'); if (h) setHistDone(JSON.parse(h)) } catch (e) {}
  }, [])

  useEffect(() => {
    try { const d = localStorage.getItem('speakup_licao_dia'); if (d) setLicaoDiaData(d) } catch (e) {}
    try { const sv = localStorage.getItem('speakup_vocab_srs'); if (sv) setVocabSrs(JSON.parse(sv)) } catch (e) {}
    try { const vd = localStorage.getItem('speakup_vocab_dia'); if (vd) setVocabDiaData(vd) } catch (e) {}
    try { if (localStorage.getItem('speakup_onboarded')) setOnboarded(true) } catch (e) {}
    try { const r = localStorage.getItem('speakup_recorde'); if (r) setRecorde(parseInt(r) || 0) } catch (e) {}
    try { const s = localStorage.getItem('speakup_srs'); if (s) setSrsData(JSON.parse(s)) } catch (e) {}
    try { const pd = localStorage.getItem('speakup_prof_dia'); if (pd) setProfDiaData(pd) } catch (e) {}
    try { const sd = localStorage.getItem('speakup_sim_dia'); if (sd) setSimDiaData(sd) } catch (e) {}
    try { const b = localStorage.getItem('speakup_bau_dia'); if (b) setBauDia(b) } catch (e) {}
    try { const t = localStorage.getItem('speakup_tempo'); if (t) setTempoMin(parseInt(t) || 0) } catch (e) {}
    try { const m = localStorage.getItem('speakup_missoes'); if (m) setMissoes(JSON.parse(m)) } catch (e) {}
  }, [])

  useEffect(() => {
    if (streak > recorde) { setRecorde(streak); try { localStorage.setItem('speakup_recorde', String(streak)) } catch (e) {} }
  }, [streak, recorde])

  useEffect(() => {
    if (!xpHydrated) return
    const earned = conquistasDef.filter(c => c.ok).map(c => c.id)
    let seen: string[] | null = null
    try { const raw = localStorage.getItem('speakup_conq_vistas'); seen = raw ? JSON.parse(raw) : null } catch (e) { seen = null }
    if (seen === null) { try { localStorage.setItem('speakup_conq_vistas', JSON.stringify(earned)) } catch (e) {} ; return }
    const novas = conquistasDef.filter(c => c.ok && !seen!.includes(c.id))
    if (novas.length) {
      const ult = novas[novas.length - 1]
      setConqNova({ e: ult.e, nome: ult.nome })
      try { localStorage.setItem('speakup_conq_vistas', JSON.stringify(Array.from(new Set([...seen!, ...earned])))) } catch (e) {}
    }
  }, [xpHydrated, xp, streak, doneLessons])

  useEffect(() => {
    if (!xpHydrated) return
    setChatMsgs(prev => {
      if (prev.length !== 1) return prev
      const nome = userName ? ' ' + userName : ''
      const fracos = perfilIa.topicos_fracos || []
      const fraco = fracos[fracos.length - 1]
      const sons = perfilIa.sons_dificeis || []
      let txt = `Oi${nome}! 👋 Sou seu professor pessoal de inglês. `
      if (fraco) txt += `Da última vez, "${fraco}" te deu um pouco de trabalho — quer revisar isso ou praticar outra coisa hoje?`
      else if (sons.length) txt += `Reparei que ${SONS_NOME[sons[sons.length - 1]] || 'um som'} ainda te desafia na pronúncia. Quer umas dicas, ou prefere praticar outra coisa?`
      else if (streak > 0) txt += `Você está com ${streak} ${streak === 1 ? 'dia' : 'dias'} de sequência, mandando bem! O que vamos praticar hoje?`
      else txt += 'O que você quer praticar hoje? Posso explicar gramática, vocabulário ou puxar uma conversa.'
      return [{ role: 'ai', text: txt }]
    })
  }, [xpHydrated, perfilIa, userName, streak])

  useEffect(() => {
    if (!xpHydrated) return
    const completo = licoesHoje > 0 && (vocabDiaData === hojeStr) && simulacoesHoje > 0 && desafioFeito
    if (!completo) return
    try { if (localStorage.getItem('speakup_plano_bonus') === hojeStr) return; localStorage.setItem('speakup_plano_bonus', hojeStr) } catch (e) {}
    setXp(x => x + 20)
    ganharMoedas(30)
    setConqNova({ e: '🎉', nome: 'Plano do dia completo! +20 XP e +30 🪙' })
  }, [xpHydrated, licoesHoje, vocabDiaData, simulacoesHoje, desafioFeito])

  // Level up (nível numérico de XP)
  useEffect(() => {
    if (!xpHydrated) return
    const nv = nivelDeXp(xp).nivel
    let visto = 0
    try { visto = parseInt(localStorage.getItem('speakup_nivel_visto') || '0') || 0 } catch (e) {}
    if (visto === 0) { try { localStorage.setItem('speakup_nivel_visto', String(nv)) } catch (e) {} ; return }
    if (nv > visto) {
      try { localStorage.setItem('speakup_nivel_visto', String(nv)) } catch (e) {}
      ganharMoedas(nv * 5)
      setConqNova({ e: '⭐', nome: `Subiu para o nível ${nv}! +${nv * 5} 🪙` })
    }
  }, [xpHydrated, xp])

  // Marcos de sequência (7, 30, 100 dias...)
  useEffect(() => {
    if (!xpHydrated || streak <= 0) return
    const marcos = [7, 14, 30, 60, 100, 180, 365]
    if (!marcos.includes(streak)) return
    let vistos: number[] = []
    try { vistos = JSON.parse(localStorage.getItem('speakup_streak_marcos') || '[]') } catch (e) {}
    if (vistos.includes(streak)) return
    vistos.push(streak)
    try { localStorage.setItem('speakup_streak_marcos', JSON.stringify(vistos)) } catch (e) {}
    ganharMoedas(streak * 3)
    setConqNova({ e: '🔥', nome: `${streak} dias de sequência! +${streak * 3} 🪙` })
  }, [xpHydrated, streak])

  // Tempo de estudo (minutos com o app aberto)
  useEffect(() => {
    const id = setInterval(() => {
      setTempoMin(m => { const novo = m + 1; try { localStorage.setItem('speakup_tempo', String(novo)) } catch (e) {} ; return novo })
    }, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!xpHydrated) return
    try {
      const raw = localStorage.getItem('speakup_hist')
      const h: Record<string, number> = raw ? JSON.parse(raw) : {}
      h[hojeStr] = xp
      const keys = Object.keys(h).sort()
      while (keys.length > 30) { const k = keys.shift(); if (k) delete h[k] }
      localStorage.setItem('speakup_hist', JSON.stringify(h))
      setHist(h)
    } catch (e) {}
  }, [xpHydrated, xp])

  // Sequência: qualquer estudo do dia conta (lição concluída ou desafio). Guarda o último dia
  // ativo em localStorage; se pulou um dia e tem proteção (freeze), gasta uma para manter o fogo.
  function calcularStreakHoje() {
    const hoje = dataLocal(0), ontem = dataLocal(1)
    let last: string | null = null
    try { last = localStorage.getItem('speakup_ultima_atividade') || localStorage.getItem('speakup_desafio') } catch (e) {}
    let novoStreak: number, freezesRestantes = streakFreezes, usouFreeze = false
    if (last === hoje) novoStreak = Math.max(streak, 1)
    else if (last === ontem) novoStreak = streak + 1
    else if (last) {
      // Dias de falha desde a última atividade; cada proteção cobre 1 dia (até o estoque).
      const faltas = Math.round((new Date(hoje).getTime() - new Date(last).getTime()) / 86400000) - 1
      if (faltas >= 1 && faltas <= streakFreezes) { novoStreak = streak + 1; freezesRestantes = streakFreezes - faltas; usouFreeze = true }
      else novoStreak = 1
    }
    else novoStreak = 1
    try { localStorage.setItem('speakup_ultima_atividade', hoje) } catch (e) {}
    return { novoStreak, freezesRestantes, usouFreeze }
  }
  function aplicarStreak(r: { novoStreak: number; freezesRestantes: number; usouFreeze: boolean }) {
    setStreak(r.novoStreak)
    if (r.usouFreeze) { setStreakFreezes(r.freezesRestantes); setConqNova({ e: '🔥', nome: 'Proteção usada — sua sequência continua!' }) }
  }

  function finalizarDesafio() {
    const hoje = dataLocal(0)
    const st = calcularStreakHoje()
    const novoXp = xp + desAcertos * 5
    const novasMoedas = moedas + 5 + desAcertos
    aplicarStreak(st); setXp(novoXp); setDesafioFeito(true); setDesResult(true); setMoedas(novasMoedas)
    try { localStorage.setItem('speakup_desafio', hoje) } catch (e) {}
    // Atenção: o cliente do Supabase só envia a requisição quando a promise é consumida (.then/await).
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, streak: st.novoStreak, moedas: novasMoedas, streak_freezes: st.freezesRestantes, ultima_atividade: hoje, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
    try { track('desafio_concluido', { acertos: desAcertos }) } catch (e) {}
  }

  function abrirHistoria(id: string) {
    setHistSel(id); setHistPos(1); setHistAns({}); setHistPt({}); setHistFim(false); setTab('historias')
    const h = HISTORIAS.find(x => x.id === id)
    if (h) setTimeout(() => speakEN(h.linhas[0].en, 9500), 500)
    try { track('historia_aberta', { historia: id }) } catch (e) {}
  }
  function finalizarHistoria(h: Historia, acertos: number) {
    setHistFim(true)
    const st = calcularStreakHoje()
    const novoXp = xp + 10 + acertos * 5
    const novasMoedas = moedas + 10
    aplicarStreak(st); setXp(novoXp); setMoedas(novasMoedas)
    const novos = Array.from(new Set([...histDone, h.id]))
    setHistDone(novos)
    try { localStorage.setItem('speakup_hist_done', JSON.stringify(novos)) } catch (e) {}
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, streak: st.novoStreak, moedas: novasMoedas, streak_freezes: st.freezesRestantes, ultima_atividade: hojeStr, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
    try { track('historia_concluida', { historia: h.id, acertos }) } catch (e) {}
  }

  function finalizarErrosBr() {
    const st = calcularStreakHoje()
    const novoXp = xp + errAcertos * 5
    const novasMoedas = moedas + 5 + errAcertos
    aplicarStreak(st); setXp(novoXp); setMoedas(novasMoedas); setErrResult(true); setErrbrFeito(true)
    try { localStorage.setItem('speakup_errbr', hojeStr) } catch (e) {}
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, streak: st.novoStreak, moedas: novasMoedas, streak_freezes: st.freezesRestantes, ultima_atividade: hojeStr, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
    try { track('errosbr_concluido', { acertos: errAcertos }) } catch (e) {}
  }

  // ---- Gamificação: moedas, baú do dia e loja ----
  function ganharMoedas(n: number) {
    const novo = moedas + n
    setMoedas(novo)
    if (userId) supabase.from('progresso').upsert({ user_id: userId, moedas: novo, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
  }
  function claimMissao(id: string, reward: number) {
    const weekNow = Math.floor(Date.now() / (7 * 86400000))
    const base = missoes.week === weekNow ? missoes.claimed : []
    if (base.includes(id)) return
    const novo = { week: weekNow, claimed: [...base, id] }
    setMissoes(novo)
    try { localStorage.setItem('speakup_missoes', JSON.stringify(novo)) } catch (e) {}
    ganharMoedas(reward)
    setConqNova({ e: '🎉', nome: `Missão concluída! +${reward} 🪙` })
  }
  function abrirBau() {
    if (bauDia === hojeStr) return
    const premio = 15 + Math.floor(Math.random() * 26) // 15 a 40 moedas
    ganharMoedas(premio)
    setBauReward(premio)
    try { localStorage.setItem('speakup_bau_dia', hojeStr) } catch (e) {}
    setBauDia(hojeStr)
    tocarSom('acerto')
  }
  function comprarStreakFreeze() {
    const custo = 50, maxFreezes = 2
    if (moedas < custo || streakFreezes >= maxFreezes) return
    const novoM = moedas - custo, novoF = streakFreezes + 1
    setMoedas(novoM); setStreakFreezes(novoF)
    if (userId) supabase.from('progresso').upsert({ user_id: userId, moedas: novoM, streak_freezes: novoF, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
  }
  async function carregarLiga() {
    setLigaLoading(true)
    try {
      const weekNow = Math.floor(Date.now() / (7 * 86400000))
      const { data } = await supabase.from('ranking_semanal').select('nome, sem_xp').eq('sem_num', weekNow).order('sem_xp', { ascending: false }).limit(30)
      setLigaData((data as any) || [])
    } catch (e) { setLigaData([]) }
    setLigaLoading(false)
  }

  async function salvarWhatsapp() {
    const num = whatsappInput.replace(/\D/g, '')
    if (num.length < 10) { alert('Por favor, informe um número de WhatsApp válido com DDD.'); return false }
    setWhatsapp(whatsappInput)
    if (userId) await supabase.from('progresso').upsert({ user_id: userId, whatsapp: whatsappInput, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    return true
  }

  function ouvirPron(text: string) { speakEN(text, 99999) }

  function avaliarPron(target: string, heard: string) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').trim().split(/\s+/).filter(Boolean)
    const tw = norm(target); const hw = norm(heard)
    // Crédito parcial: cada palavra vale pela proximidade com a melhor palavra ouvida
    // (tolera trocas típicas do reconhecimento de voz, ex.: think→sink). Abaixo de 0.5 não conta.
    const soma = tw.reduce((acc, w) => { const s = melhorSim(w, hw); return acc + (s >= 0.5 ? s : 0) }, 0)
    const score = tw.length ? Math.round(soma / tw.length * 100) : 0
    setPronScore(score)
    try { track('pronuncia_avaliada', { score }) } catch (e) {}
    // Som fraco vai para o perfil do aluno — o Professor IA passa a saber e reforçar.
    if (score < 70) {
      const pior = tw.map(w => ({ w, s: melhorSim(w, hw) })).filter(d => d.s < 0.75).sort((a, b) => a.s - b.s)[0]
      const som = pior ? SONS_BR.find(p => p.re.test(pior.w)) : null
      if (som) registrarSomDificil(som.id)
    }
    if (score < 90) pedirDicaPron(target, heard); else setPronTip('')
  }

  function registrarSomDificil(somId: string) {
    const sons = Array.from(new Set([...(perfilIa.sons_dificeis || []), somId])).slice(-8)
    salvarPerfil({ ...perfilIa, sons_dificeis: sons, objetivo: perfilIa.objetivo || OBJETIVO_PADRAO })
  }

  // Sonda única: a rota /api/stt (Whisper) está configurada? 400 = sim (áudio vazio),
  // 501 = sem chave → usa o reconhecimento do navegador para sempre nesta sessão.
  async function sttDisponivel(): Promise<boolean> {
    if (sttServidorRef.current !== null) return sttServidorRef.current
    try {
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) { sttServidorRef.current = false; return false }
      const r = await fetch('/api/stt', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      sttServidorRef.current = r.status === 400
    } catch (e) { sttServidorRef.current = false }
    return sttServidorRef.current
  }

  // Grava o áudio REAL do aluno e transcreve com Whisper (bem mais preciso para
  // sotaque brasileiro que o Web Speech). Só roda quando a rota está configurada.
  async function gravarPronWhisper(target: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks: BlobPart[] = []
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        mediaRecRef.current = null
        setPronListening(false)
        const blob = new Blob(chunks, { type: mime || 'audio/webm' })
        if (blob.size < 1000) return
        setPronHeard('… transcrevendo seu áudio …')
        try {
          const { data: s } = await supabase.auth.getSession()
          const token = s.session?.access_token
          const r = await fetch('/api/stt', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'x-audio-type': blob.type }, body: blob })
          if (!r.ok) throw new Error('stt ' + r.status)
          const data = await r.json()
          const texto = data.text || ''
          setPronHeard(texto)
          if (texto) avaliarPron(target, texto)
        } catch (e) { setPronHeard(''); alert('Não consegui transcrever agora. Tente de novo. 🎤') }
      }
      mediaRecRef.current = rec
      setPronHeard(''); setPronScore(null); setPronTip('')
      setPronListening(true)
      rec.start()
      // Trava de segurança: para sozinho depois de 15s.
      setTimeout(() => { try { if (mediaRecRef.current === rec && rec.state === 'recording') rec.stop() } catch (e) {} }, 15000)
    } catch (e) {
      sttServidorRef.current = false
      alert('Preciso da permissão do microfone para avaliar sua pronúncia. 🎤')
    }
  }

  function gravarPron(target: string) {
    if (pronListening) {
      if (mediaRecRef.current) { try { mediaRecRef.current.stop() } catch (e) {} ; return }
      recognitionRef.current?.stop(); return
    }
    silenciarVozes() // não gravar a voz do próprio app junto com a do aluno
    // Whisper primeiro (quando configurado); senão, reconhecimento do navegador.
    sttDisponivel().then(ok => { if (ok) gravarPronWhisper(target); else gravarPronNavegador(target) })
  }

  function gravarPronNavegador(target: string) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    setPronHeard(''); setPronScore(null); setPronTip('')
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1
    let lastText = ''
    rec.onresult = (e: any) => {
      // Reconstrói a frase inteira a cada evento (evita repetição de palavras no Android).
      let txt = ''
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript + ' '
      lastText = txt.replace(/\s+/g, ' ').trim()
      setPronHeard(lastText)
    }
    rec.onend = () => { setPronListening(false); if (lastText) avaliarPron(target, lastText) }
    rec.onerror = () => setPronListening(false)
    recognitionRef.current = rec
    setPronListening(true)
    rec.start()
  }

  async function pedirDicaPron(target: string, heard: string) {
    setPronLoadingTip(true); setPronTip('')
    try {
      const res = await callChat({ system: 'Você é um coach de pronúncia de inglês para brasileiros. O aluno leu uma frase em voz alta e um reconhecimento de voz captou o que entendeu. Compare a frase-alvo com o que foi reconhecido e dê UMA dica curta (no máximo 2 frases), específica e encorajadora, em português, sobre o som que provavelmente saiu errado (ex: th, r, h aspirado, vogais curtas/longas, terminação -ed ou -s). Foque na palavra que não bateu. Nunca diga que ouviu o áudio, você só tem o texto reconhecido.', messages: [{ role: 'user', content: `Frase-alvo: "${target}"\nReconhecido pelo microfone: "${heard}"` }] })
      const data = await res.json()
      setPronTip((data.content?.[0]?.text || 'Continue praticando!').trim())
    } catch { setPronTip('Não consegui gerar a dica agora. Tente de novo.') }
    setPronLoadingTip(false)
  }

  const semanaProva = Math.floor(Date.now() / (7 * 86400000))
  const provaPool = (lessons[level] || []).flatMap(l => l.q || [])
  const provaQuestoes: Question[] = (() => {
    if (provaPool.length < 1) return []
    const n = Math.min(20, provaPool.length)
    // Mesmo cuidado do desafio: laço limitado + preenchimento sequencial, para nunca
    // travar quando o pool for múltiplo do passo (foi a causa do congelamento do app).
    const idxs: number[] = []
    let k = (semanaProva * 31 + 7) % provaPool.length
    for (let p = 0; idxs.length < n && p < provaPool.length; p++) { if (!idxs.includes(k)) idxs.push(k); k = (k + 53) % provaPool.length }
    for (let i = 0; idxs.length < n && i < provaPool.length; i++) if (!idxs.includes(i)) idxs.push(i)
    return idxs.map(i => provaPool[i])
  })()

  useEffect(() => {
    try { const p = localStorage.getItem('speakup_prova'); if (p) { const [s, sc] = p.split(':'); if (parseInt(s) === Math.floor(Date.now() / (7 * 86400000))) setProvaScoreSemana(parseInt(sc)) } } catch (e) {}
  }, [])

  function finalizarProva() {
    setProvaResult(true)
    const novoXp = xp + provaAcertos * 2
    setXp(novoXp)
    setProvaScoreSemana(provaAcertos)
    try { localStorage.setItem('speakup_prova', semanaProva + ':' + provaAcertos) } catch (e) {}
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
  }

  useEffect(() => {
    // getSession lê a sessão guardada no aparelho — funciona OFFLINE (getUser exigiria rede,
    // e sem internet expulsaria o aluno para o login).
    supabase.auth.getSession().then(async ({ data: sess }) => {
      const user = sess.session?.user
      if (!user) { router.push('/login'); return }
      const nome = user.user_metadata?.nome || user.email?.split('@')[0] || 'Aluno'
      setUserName(nome.split(' ')[0])
      setUserId(user.id)
      setUserEmail(user.email || '')
      // Troca de conta no mesmo aparelho: o estado local (onboarding, plano do dia, etc.)
      // fica no localStorage do dispositivo. Se o usuário mudou, zera tudo para começar limpo.
      try {
        const prevUid = localStorage.getItem('speakup_uid')
        if (prevUid && prevUid !== user.id) {
          ['speakup_onboarded', 'speakup_licao_dia', 'speakup_vocab_dia', 'speakup_vocab_srs', 'speakup_xpdia', 'speakup_desafio', 'speakup_prova', 'speakup_prof_dia', 'speakup_sim_dia', 'speakup_bau_dia', 'speakup_srs', 'speakup_recorde', 'speakup_conq_vistas', 'speakup_plano_bonus', 'speakup_hist', 'speakup_nivel', 'speakup_nivel_visto', 'speakup_streak_marcos', 'speakup_tempo', 'speakup_missoes', 'speakup_prog_cache', XP_PENDING_KEY].forEach(k => { try { localStorage.removeItem(k) } catch (e) {} })
          setOnboarded(false); setLicaoDiaData(''); setVocabDiaData(''); setVocabSrs({}); setDesafioFeito(false); setSrsData({}); setRecorde(0); setHist({}); setProfDiaData(''); setSimDiaData(''); setXpInicioDia(0); setLevel('A1'); setLicoesConcluidas([]); setPerfilIa({}); setMoedas(0); setStreakFreezes(0); setBauDia(''); setTempoMin(0); setMissoes({ week: 0, claimed: [] })
        }
        localStorage.setItem('speakup_uid', user.id)
      } catch (e) {}
      const { data: progRows, error: progReadError } = await supabase
        .from('progresso')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      let prog = progRows?.[0] || null
      // Sem rede (ou banco fora do ar), usa a última foto do progresso salva no aparelho —
      // o aluno continua estudando offline e o XP pendente sincroniza quando a rede voltar.
      let usandoCache = false
      if (!prog && progReadError) {
        try { const raw = localStorage.getItem('speakup_prog_cache'); if (raw) { prog = JSON.parse(raw); usandoCache = true } } catch (e) {}
        console.log('[XP][Read] Erro ao ler progresso (usando cache local: ' + usandoCache + ')', progReadError)
      }
      // Trial de 2 dias: enquanto profiles.trial_expira estiver no futuro, o aluno usa o app como Premium.
      let emTrial = false
      try {
        const { data: profRows } = await supabase.from('profiles').select('trial_expira').eq('id', user.id).limit(1)
        const texp = profRows?.[0]?.trial_expira
        if (texp) emTrial = new Date(texp).getTime() > Date.now()
      } catch (e) {}
      let pendingXp = 0
      try {
        const rawPending = localStorage.getItem(XP_PENDING_KEY)
        const parsed = rawPending ? JSON.parse(rawPending) : null
        if (parsed && typeof parsed.xp === 'number') pendingXp = parsed.xp
      } catch (e) {}
      if (prog) {
        const dbXp = prog.xp || 0
        const initialXp = Math.max(dbXp, pendingXp)
        setXp(initialXp)
        lastSyncedXpRef.current = usandoCache ? null : dbXp
        setPerfilIa(prog.perfil_ia || {})
        setStreak(prog.streak || 0)
        setLicoesConcluidas(prog.licoes_concluidas || [])
        setIsPremium(BETA_GRATIS || prog.is_premium || emTrial || (usandoCache && !!prog.em_trial_cache))
        setWhatsapp(prog.whatsapp || '')
        setMoedas(prog.moedas || 0)
        setStreakFreezes(prog.streak_freezes || 0)
        if (!usandoCache) {
          // Dias ativos: um marcador por dia de uso, para as métricas de retenção
          // D1/D7/D30 (consultas prontas em retencao.sql). Upsert separado: se a
          // coluna ainda não existir no banco, nada mais é afetado.
          try {
            const dias: string[] = Array.isArray(prog.dias_ativos) ? prog.dias_ativos : []
            if (!dias.includes(hojeStr)) {
              supabase.from('progresso').upsert({ user_id: user.id, dias_ativos: [...dias, hojeStr].slice(-60), updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
            }
          } catch (e) {}
          // Foto local do progresso para o modo offline (só o essencial).
          try { localStorage.setItem('speakup_prog_cache', JSON.stringify({ xp: dbXp, streak: prog.streak || 0, licoes_concluidas: prog.licoes_concluidas || [], moedas: prog.moedas || 0, streak_freezes: prog.streak_freezes || 0, perfil_ia: prog.perfil_ia || {}, is_premium: !!prog.is_premium, em_trial_cache: emTrial, whatsapp: prog.whatsapp || '' })) } catch (e) {}
          const weekNow = Math.floor(Date.now() / (7 * 86400000))
          semNumRef.current = weekNow
          semBaseRef.current = prog.sem_num === weekNow ? (prog.sem_base_xp || 0) : initialXp
          supabase.from('progresso').upsert({ user_id: user.id, nome, sem_num: weekNow, sem_base_xp: semBaseRef.current, sem_xp: Math.max(0, initialXp - semBaseRef.current), updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
          if (!prog.email && user.email) supabase.from('progresso').update({ email: user.email }).eq('user_id', user.id).then(() => {})
        }
      } else {
        // progresso.user_id tem FK -> profiles.id. Sem um profile, criar o progresso (e gravar XP) falha
        // silenciosamente. Cria o profile só se faltar (ignoreDuplicates evita sobrescrever plano/trial de quem já tem).
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          nome: nome,
          plano: 'free',
          ativo: true,
          trial_expira: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }, { onConflict: 'id', ignoreDuplicates: true })
        setIsPremium(true) // conta recém-criada começa com o trial de 2 dias ativo
        const initialXp = pendingXp > 0 ? pendingXp : 0
        setXp(initialXp)
        const { error: insErr } = await supabase.from('progresso').upsert({ user_id: user.id, xp: initialXp, streak: 0, licoes_concluidas: [], is_premium: false, simulacoes_hoje: 0, email: user.email }, { onConflict: 'user_id', ignoreDuplicates: true })
        if (insErr) { console.log('[XP][Init] Falha ao criar progresso', insErr); lastSyncedXpRef.current = 0 }
        else { lastSyncedXpRef.current = initialXp }
      }
      setXpHydrated(true)
    })
  }, [router])

  useEffect(() => {
    if (!userId || !xpHydrated) return
    if (lastSyncedXpRef.current === xp) return
    try {
      localStorage.setItem(XP_PENDING_KEY, JSON.stringify({ xp, updatedAt: Date.now() }))
    } catch (e) {}
    if (xpSaveTimeoutRef.current) clearTimeout(xpSaveTimeoutRef.current)
    xpSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const weekNow = Math.floor(Date.now() / (7 * 86400000))
        if (semNumRef.current !== weekNow) { semNumRef.current = weekNow; semBaseRef.current = xp }
        const semXp = Math.max(0, xp - semBaseRef.current)
        await supabase.from('progresso').upsert({ user_id: userId, xp, sem_num: weekNow, sem_base_xp: semBaseRef.current, sem_xp: semXp, nome: userName, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        lastSyncedXpRef.current = xp
        try {
          const rawPending = localStorage.getItem(XP_PENDING_KEY)
          const parsed = rawPending ? JSON.parse(rawPending) : null
          if (parsed && parsed.xp === xp) localStorage.removeItem(XP_PENDING_KEY)
        } catch (e) {}
      } catch (e) {
        // Keep XP pending locally; next XP change or reload retries sync.
      }
    }, 800)
    return () => {
      if (xpSaveTimeoutRef.current) clearTimeout(xpSaveTimeoutRef.current)
    }
  }, [xp, userId, xpHydrated])

  useEffect(() => { convEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [convMsgs])

  useEffect(() => {
    supabase.from('licoes').select('*').order('ordem').then(({ data }) => {
      if (!data) return
      const grupos: Record<string, Lesson[]> = { beginner: [], intermediate: [], advanced: [] }
      data.forEach((row: any) => {
        const nivel = grupos[row.nivel] ? row.nivel : 'beginner'
        grupos[nivel].push({
          title: row.titulo, sub: row.sub || '', icon: row.icon || '📘', done: false,
          explanation: row.explicacao || '', tip: row.dica || '',
          examples: row.exemplos || [], q: row.questoes || [],
          cefr: /^[A-C][12]$/.test(row.nivel) ? row.nivel : undefined
        })
      })
      setDbLessons(grupos)
    })
  }, [])

  async function salvarProgresso(novoXp: number, novasLicoes: string[], streakInfo?: { novoStreak: number; freezesRestantes: number }) {
    if (!userId) return
    const payload: any = { user_id: userId, xp: novoXp, licoes_concluidas: novasLicoes, ultima_atividade: dataLocal(0), updated_at: new Date().toISOString() }
    if (streakInfo) { payload.streak = streakInfo.novoStreak; payload.streak_freezes = streakInfo.freezesRestantes }
    console.log('[XP][Licao] Antes de gravar no Supabase', { tabela: 'progresso', payload })
    const { error } = await supabase.from('progresso').upsert(payload, { onConflict: 'user_id' })
    if (error) {
      console.log('[XP][Licao] Resposta do Supabase: erro', { tabela: 'progresso', error })
    } else {
      console.log('[XP][Licao] Resposta do Supabase: sucesso', { tabela: 'progresso', userId, xp: novoXp })
    }
  }

  async function logout() { await supabase.auth.signOut(); router.push('/login') }

  // ---- Indicação: se o aluno chegou por um link ?ref=, credita o bônus (1x, servidor valida).
  useEffect(() => {
    if (!xpHydrated || !userId) return
    let ref: string | null = null
    try { ref = localStorage.getItem('speakup_ref') } catch (e) {}
    if (!ref || perfilIa.indicado_por) { if (ref && perfilIa.indicado_por) { try { localStorage.removeItem('speakup_ref') } catch (e) {} } ; return }
    ;(async () => {
      try {
        const { data: s } = await supabase.auth.getSession()
        const token = s.session?.access_token
        if (!token) return
        const r = await fetch('/api/indicacao', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ref }) })
        const data = await r.json()
        // Só descarta o código em resultado definitivo (ok ou recusa). Erro temporário
        // (500/rede) mantém o código para tentar de novo na próxima abertura.
        if (data?.ok || data?.motivo) { try { localStorage.removeItem('speakup_ref') } catch (e) {} }
        if (data?.ok) {
          setPerfilIa((p: any) => ({ ...p, indicado_por: ref }))
          setIsPremium(true)
          setConqNova({ e: '🎁', nome: 'Bônus de indicação: +2 dias de Premium!' })
          try { track('indicacao_resgatada') } catch (e) {}
        }
      } catch (e) {}
    })()
  }, [xpHydrated, userId])

  const linkIndicacao = userId ? `https://speakup-dusky.vercel.app/login?ref=${userId}` : ''
  async function compartilharIndicacao() {
    const texto = `Estou aprendendo inglês no Vonai, um professor de IA feito para brasileiros 🇧🇷 Entra pelo meu link e a gente ganha bônus Premium: ${linkIndicacao}`
    try { track('indicacao_compartilhada') } catch (e) {}
    try { if (navigator.share) { await navigator.share({ text: texto }) } else { await navigator.clipboard.writeText(texto); alert('Link copiado! Manda para os amigos. 📋') } } catch (e) {}
  }

  // ---- Pedido de avaliação na loja: só no "momento feliz" (5 lições ou 3 dias de fogo),
  // uma única vez. 👎 vira feedback privado (protege a nota pública).
  const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
  useEffect(() => {
    if (!xpHydrated) return
    if (doneLessons < 5 && streak < 3) return
    try {
      if (localStorage.getItem('speakup_aval')) return
      const t = setTimeout(() => { setAvalModal(true); try { track('aval_prompt') } catch (e) {} }, 1600)
      return () => clearTimeout(t)
    } catch (e) {}
  }, [xpHydrated, doneLessons, streak])
  function fecharAval(acao: 'avaliou' | 'melhorar' | 'depois') {
    setAvalModal(false)
    try { track('aval_' + acao) } catch (e) {}
    if (acao === 'avaliou') {
      try { localStorage.setItem('speakup_aval', 'avaliou') } catch (e) {}
      try { window.open(PLAY_URL, '_blank') } catch (e) {}
    } else if (acao === 'melhorar') {
      try { localStorage.setItem('speakup_aval', 'feedback') } catch (e) {}
      setFeedbackEnviado(false); setFeedbackModal(true)
    } else {
      // "Agora não": pergunta de novo daqui a alguns dias (marca a data; o efeito só
      // reaparece se a chave sumir — então guardamos com validade de 7 dias).
      try { localStorage.setItem('speakup_aval', 'depois:' + hojeStr) } catch (e) {}
    }
  }
  // Reabre o convite ~7 dias depois de um "agora não".
  useEffect(() => {
    try {
      const v = localStorage.getItem('speakup_aval')
      if (v && v.startsWith('depois:')) {
        const quando = new Date(v.slice(7) + 'T00:00:00').getTime()
        if (Date.now() - quando > 7 * 86400000) localStorage.removeItem('speakup_aval')
      }
    } catch (e) {}
  }, [])

  async function enviarFeedback() {
    const msg = feedbackTxt.trim()
    if (msg.length < 3) { alert('Escreva um pouco mais para enviar. 🙂'); return }
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, email: userEmail, mensagem: msg }) })
      if (!r.ok) throw new Error('falhou')
      setFeedbackEnviado(true); setFeedbackTxt('')
    } catch (e) {
      alert('Não consegui enviar agora. Verifique sua conexão e tente de novo. 🙏')
    }
  }

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.register('/sw.js').then(reg => {
      if (Notification.permission === 'granted') reg.pushManager.getSubscription().then(s => { if (s) setLembretesAtivos(true) })
    }).catch(() => {})
  }, [])

  async function ativarLembretes() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        alert('Este aparelho/navegador não suporta notificações. No iPhone é preciso iOS 16.4+ e abrir o app pelo ícone da tela inicial.'); return
      }
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { alert('Permissão negada (' + perm + '). Vá em Ajustes do aparelho → Vonai → Notificações e permita, depois tente de novo.'); return }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) })
      if (!userId) { alert('Sessão não identificada. Saia e entre de novo na conta, depois ative os lembretes.'); return }
      const { error } = await supabase.from('push_subscriptions').upsert({ user_id: userId, subscription: sub as any, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (error) { alert('Erro ao salvar a inscrição no servidor: ' + error.message); return }
      setLembretesAtivos(true)
      alert('Lembretes ativados! 🔔 Você receberá um aviso por dia para não perder a sequência.')
    } catch (e: any) {
      alert('Falha ao ativar os lembretes: ' + (e && e.message ? e.message : String(e)))
    }
  }

  function answer(i: number) {
    if (answered) return
    setAnswered(true); setSelected(i)
    if (i === lessons[level][lessonIdx].q[qIdx].ans) { licaoComboRef.current++; setXp(x => x + 10); setXpFloat(10); setTimeout(() => setXpFloat(0), 850); tocarSom('acerto'); const respostaCerta = lessons[level][lessonIdx].q[qIdx].opts[lessons[level][lessonIdx].q[qIdx].ans]; if (textoEmIngles(respostaCerta)) setTimeout(() => { try { speakEN(respostaCerta, 9900 + qIdx) } catch (e) {} }, 450) } else { licaoComboRef.current = 0; tocarSom('erro'); licaoErrosRef.current++; registrarErro(lessons[level][lessonIdx].title); guardarErroQ(lessons[level][lessonIdx].q[qIdx], lessons[level][lessonIdx].title) }
  }

  function nextQ() {
    const qs = lessons[level][lessonIdx].q
    if (qIdx + 1 >= qs.length) {
      const titulo = lessons[level][lessonIdx].title
      const ehNova = !licoesConcluidas.includes(titulo)
      const novasLicoes = ehNova ? [...licoesConcluidas, titulo] : licoesConcluidas
      const novoXp = xp + 30
      console.log('[XP][Licao] XP calculado ao concluir lição', {
        xpAnterior: xp,
        ganhoNaConclusao: 30,
        novoXp,
        licao: titulo,
      })
      setLicoesConcluidas(novasLicoes); setXp(novoXp)
      ganharMoedas(ehNova ? 10 : 5)
      if (ehNova) { const val = `${hojeStr}:${licoesHoje + 1}`; try { localStorage.setItem('speakup_licao_dia', val) } catch (e) {} ; setLicaoDiaData(val); registrarDominio(titulo) }
      agendarRevisao(titulo, licaoErrosRef.current === 0)
      const st = calcularStreakHoje()
      aplicarStreak(st)
      salvarProgresso(novoXp, novasLicoes, st)
      try { track('licao_concluida', { licao: titulo, nivel: level }) } catch (e) {}
      const monta = frasesMontaveis(lessons[level][lessonIdx].examples)
      const trad = frasesTraduzir(lessons[level][lessonIdx].examples)
      setBuildIdx(0); setBuildPicked([]); setBuildChecked(false)
      setDitIdx(0); setDitInput(''); setDitChecked(false)
      setTradIdx(0); setTradInput(''); setTradChecked(false)
      const dit = frasesDitado(lessons[level][lessonIdx].examples)
      setView(monta.length ? 'build' : trad.length ? 'traduzir' : dit.length ? 'ditado' : 'finish')
    } else { setQIdx(q => q + 1); setAnswered(false); setSelected(-1); setAjudaTxt(null) }
  }

  // Encerra o reconhecimento de voz de forma limpa: marca como inativo (impede o reinício
  // automático), DESLIGA os handlers para nenhum resultado atrasado reescrever o campo depois
  // do envio, e para a gravação. Usado ao tocar em parar e ao enviar a mensagem/áudio.
  function pararMic() {
    micAtivoRef.current = false
    const rec = recognitionRef.current
    if (rec) { try { rec.onresult = null; rec.onend = null; rec.onerror = null; rec.stop() } catch (e) {} }
    recognitionRef.current = null
    if (mediaRecRef.current) { try { mediaRecRef.current.stop() } catch (e) {} mediaRecRef.current = null }
    setListening(false)
  }

  // Corta qualquer voz tocando antes de abrir o microfone — senão o celular ouve o
  // próprio alto-falante e transcreve a fala do app junto com a do aluno.
  function silenciarVozes() {
    try { window.speechSynthesis?.cancel() } catch (e) {}
    if (ttsAudioRef.current) { try { ttsAudioRef.current.pause() } catch (e) {} ttsAudioRef.current = null }
    setSpeakingId(-1)
  }

  // Ditado por voz compartilhado (chat/simulador). Três camadas anti-repetição:
  // (1) usa e.resultIndex — processa só o que MUDOU, não reconstrói do zero;
  // (2) `finalTranscript` acumula APENAS trechos isFinal, uma única vez cada, e
  //     sobrevive aos reinícios de sessão do Android (não perde nem duplica);
  // (3) colapsarRepeticao() como rede de segurança: mesmo que o motor do celular
  //     re-entregue trechos, blocos repetidos são removidos antes de exibir.
  function ouvirEDigitar(baseInicial: string, aplicar: (texto: string) => void) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    silenciarVozes()
    micAtivoRef.current = true
    setListening(true)
    const prefixo = baseInicial ? baseInicial.replace(/\s+/g, ' ').trim() + ' ' : ''
    let finalTranscript = '' // só finais, acumulados ao longo de TODAS as sessões (mantém espaço no fim)
    // Exibição: colapsa repetições SEM mutar o acumulado (não perde o espaço separador).
    const paraExibir = (interim: string) => colapsarRepeticao((prefixo + finalTranscript + ' ' + interim).replace(/\s+/g, ' ').trim())
    const novaSessao = () => {
      const rec = new SR()
      rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1
      rec.onresult = (e: any) => {
        let interim = ''
        // resultIndex: começa no primeiro resultado que mudou (não reprocessa os antigos).
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const seg = e.results[i][0].transcript
          if (e.results[i].isFinal) finalTranscript += seg + ' '
          else interim += seg + ' '
        }
        aplicar(paraExibir(interim.trim()))
      }
      rec.onerror = (e: any) => {
        if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
          pararMic(); alert('Preciso da permissão do microfone. 🎤\n\nToque no cadeado 🔒 ao lado do endereço (ou em Ajustes do aparelho → Vonai → Microfone) e permita, depois toque no microfone de novo.')
        }
      }
      rec.onend = () => {
        // Só na troca de sessão o acumulado é compactado — e o espaço final é RECOLOCADO
        // para a próxima palavra não colar na anterior.
        const limpo = colapsarRepeticao(finalTranscript.replace(/\s+/g, ' ').trim())
        finalTranscript = limpo ? limpo + ' ' : ''
        if (micAtivoRef.current) { try { novaSessao() } catch (e) { setListening(false) } }
        else { setListening(false); aplicar(colapsarRepeticao((prefixo + finalTranscript).replace(/\s+/g, ' ').trim())) }
      }
      recognitionRef.current = rec
      rec.start()
    }
    novaSessao()
  }

  function micChat() {
    if (listening) { pararMic(); return }
    ouvirEDigitar(chatInput, t => setChatInput(t))
  }

  // Chama /api/chat sempre com o token de login (a rota exige usuário autenticado).
  // Ponte com o app iOS nativo. Expõe o id da conta e, dentro do Capacitor, registra
  // a compra pela Apple usando o SDK nativo do RevenueCat. Inerte na web/Android.
  useEffect(() => {
    if (typeof window === 'undefined') return
    ;(window as any).VONAI_USER_ID = userId || ''
    const nat = (window as any).VonaiNative
    if (nat && typeof nat.setUser === 'function' && userId) { try { nat.setUser(userId) } catch (e) {} }
    // Dentro do app iOS (Capacitor + plugin Purchases): monta a ponte de assinatura.
    const cap = (window as any).Capacitor
    const P = cap?.Plugins?.Purchases
    const rcKey = process.env.NEXT_PUBLIC_RC_APPLE_KEY
    if (!cap?.isNativePlatform?.() || !P || !rcKey || !userId) return
    ;(async () => {
      try {
        await P.configure({ apiKey: rcKey, appUserID: userId })
        ;(window as any).VonaiNative = {
          platform: 'ios',
          subscribe: async (plano: 'mensal' | 'anual') => {
            try {
              const { current } = await P.getOfferings()
              const pkg = plano === 'anual'
                ? (current?.annual || (current?.availablePackages || []).find((x: any) => x?.packageType === 'ANNUAL'))
                : (current?.monthly || (current?.availablePackages || []).find((x: any) => x?.packageType === 'MONTHLY'))
              if (!pkg) { alert('Plano indisponível no momento. Tente de novo em instantes.'); return }
              await P.purchasePackage({ aPackage: pkg })
              window.location.reload() // o webhook do RevenueCat já liberou o Premium no servidor
            } catch (e: any) { if (!e?.userCancelled) alert('Não foi possível concluir a compra. Tente novamente.') }
          },
          restore: async () => { try { await P.restorePurchases(); window.location.reload() } catch (e) {} },
          setUser: (id: string) => { try { P.logIn({ appUserID: id }) } catch (e) {} },
        }
      } catch (e) {}
    })()
  }, [userId])
  // Abre a assinatura: dentro do app iOS usa o pagamento NATIVO da Apple (via RevenueCat);
  // na web/Android abre o checkout do Kiwify. Contrato: window.VonaiNative.subscribe('mensal'|'anual').
  function abrirAssinatura(plano: 'mensal' | 'anual') {
    const nat = (typeof window !== 'undefined') ? (window as any).VonaiNative : null
    if (nat && nat.platform === 'ios' && typeof nat.subscribe === 'function') { try { nat.subscribe(plano) } catch (e) {} ; return }
    window.open(plano === 'mensal' ? KIWIFY_MENSAL : KIWIFY_ANUAL, '_blank')
  }

  async function callChat(payload: any) {
    let token = ''
    try { const { data } = await supabase.auth.getSession(); token = data.session?.access_token || '' } catch (e) {}
    return fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) })
  }

  // Dica do Professor IA dentro de uma lição — ajuda o aluno a raciocinar SEM entregar a resposta.
  async function pedirAjuda() {
    if (answered || ajudaLoading) return
    if (!isPremium && profHoje >= PROF_LIMIT) { setAjudaTxt(`Você usou suas ${PROF_LIMIT} ajudas de hoje com o Professor. 🌟 Vire Premium para ter ajuda sem limites!`); return }
    if (isPremium && profHoje >= PROF_LIMIT_PREMIUM) { setAjudaTxt('Estou um pouco sobrecarregado agora. 😅 Tente de novo daqui a pouco.'); return }
    const q = currentLesson.q[qIdx]
    const novo = `${hojeStr}:${profHoje + 1}`; try { localStorage.setItem('speakup_prof_dia', novo) } catch (e) {} ; setProfDiaData(novo)
    setAjudaLoading(true); setAjudaTxt(null)
    try {
      const res = await callChat({
        system: 'Você é um professor de inglês paciente ajudando um aluno brasileiro DURANTE um exercício. Dê uma DICA curta (máximo 2 frases, em português) que ajude o aluno a raciocinar e chegar à resposta sozinho. NUNCA diga qual opção é a correta nem revele a resposta final. Foque em relembrar a regra ou dar um exemplo parecido.',
        messages: [{ role: 'user', content: `Tópico da lição: ${currentLesson.title}. Regra: ${currentLesson.explanation}. Pergunta: ${q.q}. Opções: ${q.opts.join(' / ')}. Me dê uma dica para eu descobrir sozinho, sem revelar a resposta.` }],
      })
      if (res.status === 429) { setAjudaTxt('Você atingiu o limite de uso de hoje. 🌟 Volte amanhã ou seja Premium para continuar.'); setAjudaLoading(false); return }
      const data = await res.json()
      setAjudaTxt(data.content?.[0]?.text || 'Tente relembrar a regra da explicação. 💡')
    } catch { setAjudaTxt('Erro de conexão. Tente de novo. 💡') }
    setAjudaLoading(false)
  }

  async function sendChat() {
    if (!chatInput.trim() || loadingChat) return
    if (listening) pararMic() // ao enviar o áudio, para de gravar
    try { track('professor_mensagem') } catch (e) {}
    if (!isPremium && profHoje >= PROF_LIMIT) {
      setChatMsgs(m => [...m, { role: 'ai', text: `Você usou suas ${PROF_LIMIT} mensagens de hoje com o Professor IA. 🌟 Vire Premium para conversar sem limites — quantas vezes quiser!` }])
      return
    }
    // Teto de uso justo do Premium (proteção de custo) — silencioso, sem expor o número ao aluno.
    if (isPremium && profHoje >= PROF_LIMIT_PREMIUM) {
      setChatMsgs(m => [...m, { role: 'ai', text: 'Estou um pouco sobrecarregado agora. 😅 Tente de novo daqui a pouco.' }])
      return
    }
    const msg = colapsarRepeticao(chatInput.trim()); setChatInput('')
    const novo = `${hojeStr}:${profHoje + 1}`; try { localStorage.setItem('speakup_prof_dia', novo) } catch (e) {} ; setProfDiaData(novo)
    setChatMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingChat(true)
    try {
      const res = await callChat({ system: 'Você é o professor de inglês pessoal do aluno, simpático e paciente, para brasileiros. Você acompanha esse aluno há tempo e LEMBRA do histórico dele. Responda sempre em português com exemplos em inglês traduzidos. Máximo 4 linhas por resposta. Responda em texto puro, sem formatação markdown (nada de asteriscos, ---, # ou listas com hífen). ' + resumoPerfil(), messages: [{ role: 'user', content: msg }] })
      if (res.status === 429) { setChatMsgs(m => [...m, { role: 'ai', text: 'Você atingiu o limite de uso de hoje. 🌟 Volte amanhã ou seja Premium para continuar.' }]); setLoadingChat(false); return }
      const data = await res.json()
      setChatMsgs(m => [...m, { role: 'ai', text: data.content?.[0]?.text || 'Erro.' }])
    } catch { setChatMsgs(m => [...m, { role: 'ai', text: 'Erro de conexão. Tente novamente.' }]) }
    setLoadingChat(false)
  }

  async function gerarRelatorio() {
    if (loadingReport || convMsgs.length < 2) return
    setLoadingReport(true)
    try {
      const history = convMsgs.map(m => `${m.role === 'ai' ? 'Interlocutor' : 'Aluno'}: ${m.text}`).join('\n')
      const res = await callChat({ system: 'Você avalia a fluência em inglês de um aluno brasileiro com base em uma conversa. Responda APENAS com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois. Formato exato: {"score": número de 0 a 100, "strengths": ["ponto forte 1","ponto forte 2","ponto forte 3"], "improvements": ["o que melhorar 1 com exemplo","o que melhorar 2 com exemplo"], "message": "frase curta de incentivo em português"}. Avalie só as falas do Aluno. Seja encorajador mas honesto.', messages: [{ role: 'user', content: `Avalie esta conversa:\n\n${history}` }] })
      const data = await res.json()
      const txt = (data.content?.[0]?.text || '').replace(/```json/g,'').replace(/```/g,'').trim()
      const rep = JSON.parse(txt)
      setFluencyReport(rep)
    } catch { setFluencyReport({ score: 0, strengths: [], improvements: [], message: 'Não foi possível gerar o relatório. Tente novamente.' }) }
    setLoadingReport(false)
  }

  function compartilharResultado() {
    if (!fluencyReport) return
    const cenario = selectedScenario?.title || 'uma conversa real'
    const texto = `🎯 Acabei de tirar ${fluencyReport.score}/100 de fluência em inglês no Vonai, praticando "${cenario}" com inteligência artificial! 🇬🇧✨\n\nQuer treinar inglês de verdade — conversando, não decorando? Testa aqui 👇\nhttps://speakup-dusky.vercel.app`
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Meu resultado no Vonai', text: texto }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
    }
  }

  // Busca (ou gera) o áudio neural de uma frase e devolve a Response do cache/rede.
  // Compartilhado por speakEN (tocar) e prefetchTTS (aquecer o cache antes do toque).
  async function obterTTS(text: string): Promise<Response | null> {
    if (!ttsServidorRef.current || text.length > 290) return null
    const cache = 'caches' in window ? await caches.open('vonai-tts-v1') : null
    const chave = '/api/tts?t=' + encodeURIComponent(text)
    const hit = cache ? await cache.match(chave) : undefined
    if (hit) return hit
    // dedupe: se a mesma frase já está sendo gerada, não dispara outra chamada
    if (ttsPendentesRef.current.has(chave)) {
      for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 150)); const h2 = cache ? await cache.match(chave) : undefined; if (h2) return h2; if (!ttsPendentesRef.current.has(chave)) break }
      return cache ? (await cache.match(chave)) || null : null
    }
    ttsPendentesRef.current.add(chave)
    try {
      const { data: s } = await supabase.auth.getSession()
      const token = s.session?.access_token
      if (!token) return null
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text }) })
      if (r.ok) { if (cache) { try { await cache.put(chave, r.clone()) } catch (e) {} } return r }
      if (r.status === 501) ttsServidorRef.current = false
      return null
    } finally { ttsPendentesRef.current.delete(chave) }
  }

  // Aquecimento: gera o áudio em segundo plano ANTES do aluno tocar (a voz sai na hora).
  // garantido=true pula o filtro de idioma (para conteúdo que já sabemos ser inglês).
  function prefetchTTS(text: string, garantido = false) {
    if (typeof window === 'undefined' || !text) return
    if (!garantido && !textoEmIngles(text)) return
    try { obterTTS(text).catch(() => {}) } catch (e) {}
  }

  // ---- Pré-carregamento por tela: quando a pergunta/frase aparece, o áudio já começa
  // a ser gerado; no toque (ou no acerto) a voz sai instantânea. ----
  useEffect(() => { // quiz: resposta certa da questão atual
    if (tab !== 'lessons' || view !== 'quiz') return
    const q = lessons[level]?.[lessonIdx]?.q?.[qIdx]
    if (q) prefetchTTS(q.opts[q.ans])
  }, [tab, view, qIdx, lessonIdx, level])
  useEffect(() => { // explicação: exemplos da lição
    if (tab !== 'lessons' || view !== 'explanation') return
    ;(lessons[level]?.[lessonIdx]?.examples || []).slice(0, 3).forEach(ex => prefetchTTS(ex.en, true))
  }, [tab, view, lessonIdx, level])
  useEffect(() => { // ditado: frase atual
    if (tab !== 'lessons' || view !== 'ditado') return
    const alvo = frasesDitado(lessons[level]?.[lessonIdx]?.examples || [])[ditIdx]?.en
    if (alvo) prefetchTTS(alvo, true)
  }, [tab, view, ditIdx, lessonIdx, level])
  useEffect(() => { // listening: áudio atual
    if (tab !== 'listening') return
    const ex = rotaDia(listeningExercises, 12)[lisIdx]
    if (ex) prefetchTTS(ex.en, true)
  }, [tab, lisIdx])
  useEffect(() => { // histórias: linha atual + a próxima
    if (tab !== 'historias' || !histSel) return
    const h = HISTORIAS.find(x => x.id === histSel); if (!h) return
    ;[h.linhas[histPos - 1], h.linhas[histPos]].forEach(l => { if (l) prefetchTTS(l.en, true) })
  }, [tab, histSel, histPos])
  useEffect(() => { // caça-erros: forma certa da armadilha atual
    if (tab !== 'errbr') return
    const qs = rotaDia(ERROS_BR, 5, 77).map(e => ({ ...e, ...embaralharQ({ q: e.q, opts: e.opts, ans: e.ans, exp: e.exp }) }))
    const atual = qs[errQ]
    if (atual) prefetchTTS(atual.opts[atual.ans])
  }, [tab, errQ])

  // Voz do app: neural com cache + pré-carregamento. Se a rede demorar mais de 3s,
  // a voz do navegador assume NA HORA (nada de espera) e o áudio neural fica pronto
  // no cache para a próxima vez.
  async function speakEN(text: string, id: number) {
    if (typeof window === 'undefined') return
    try { window.speechSynthesis?.cancel() } catch (e) {}
    if (ttsAudioRef.current) { try { ttsAudioRef.current.pause() } catch (e) {} ttsAudioRef.current = null }
    if (speakingId === id) { setSpeakingId(-1); return }
    setSpeakingId(id)
    const fim = () => setSpeakingId(s => (s === id ? -1 : s))
    if (ttsServidorRef.current && text.length <= 290) {
      let usouFallback = false
      const timer = setTimeout(() => { usouFallback = true; falarNavegador(text, 0.95, fim) }, 3000)
      try {
        const resp = await obterTTS(text)
        clearTimeout(timer)
        if (usouFallback) return // navegador já está falando; o neural ficou no cache p/ a próxima
        if (resp) {
          const blob = await resp.blob()
          const audio = new Audio(URL.createObjectURL(blob))
          ttsAudioRef.current = audio
          audio.onended = fim; audio.onerror = fim
          await audio.play()
          return
        }
      } catch (e) { clearTimeout(timer); if (usouFallback) return }
    }
    falarNavegador(text, 0.95, fim)
  }

  function falarIngles(text: string, id: number) {
    let t = text.replace(/\*\*/g, '').replace(/\*/g, '')
    // Prioridade: trechos entre aspas (exemplos em ingles)
    const quoted = (t.match(/["“”]([^"“”]+)["“”]/g) || []).map(s => s.replace(/["“”]/g, '').trim()).filter(Boolean)
    if (quoted.length) { speakEN(quoted.join('. '), id); return }
    // Sem aspas: le so os trechos que nao tem cara de portugues
    const ptChars = /[ãõçáéíóúâêôàü]/i
    const ptWords = /\b(voce|que|para|obrigad|desculp|portugu|ola|estou|muito|como|pode|sobre|isso|aqui|agora|frase|exemplo|significa|quando|porque|tambem|vai|nao|sim|mais|fazer|certo|usou|seu|sua|sua|você)\b/i
    const chunks = t.split(/[.!?\n]|\s-\s/).map(s => s.trim()).filter(Boolean)
    const eng = chunks.filter(s => /[a-z]/i.test(s) && !ptChars.test(s) && !ptWords.test(s))
    speakEN(eng.length ? eng.join('. ') : t, id)
  }

  // Microfone do simulador: mesmo motor anti-repetição do chat (ouvirEDigitar).
  function toggleMic(_setter?: unknown) {
    if (listening) { pararMic(); return }
    ouvirEDigitar(convInput, t => setConvInput(t))
  }

  function startScenario(scenario: Scenario) {
    if (!isPremium && simulacoesHoje >= FREE_LIMIT) { setTab('plans'); return }
    setSelectedScenario(scenario); setConvMsgs([{ role: 'ai', text: scenario.opener }]); setConvStarted(true); setConvInput('')
    if (autoVoz) setTimeout(() => falarIngles(scenario.opener, 0), 400)
    const novo = `${hojeStr}:${simulacoesHoje + 1}`
    try { localStorage.setItem('speakup_sim_dia', novo) } catch (e) {} ; setSimDiaData(novo)
    if (userId) supabase.from('progresso').upsert({ user_id: userId, ultima_atividade: hojeStr, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {})
  }

  async function sendConvMsg() {
    if (!convInput.trim() || loadingConv || !selectedScenario) return
    if (listening) pararMic() // ao enviar o áudio, para de gravar
    try { track('simulador_mensagem', { cenario: selectedScenario.title }) } catch (e) {}
    const msg = colapsarRepeticao(convInput.trim()); setConvInput('')
    setConvMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingConv(true)
    try {
      const history = convMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      const res = await callChat({ system: selectedScenario.systemPrompt + ' REGRAS DE FORMATO (obrigatórias): Responda CURTO — no máximo 2 ou 3 frases em inglês, como numa conversa falada de verdade; nada de parágrafos longos. Termine com UMA pergunta curta para manter a conversa. Depois do inglês, escreva uma ÚLTIMA linha que começa exatamente com "[PT]" seguida da tradução em português do que você disse (e, se o aluno cometeu um erro importante, acrescente nessa linha uma correção gentil de uma frase). Texto puro, sem markdown. ' + resumoPerfil(), messages: [...history, { role: 'user', content: msg }] })
      if (res.status === 429) { setConvMsgs(m => [...m, { role: 'ai', text: 'Você atingiu o limite de uso de hoje. Volte amanhã para continuar praticando. 🌟' }]); setLoadingConv(false); return }
      const data = await res.json()
      const resposta = data.content?.[0]?.text || 'Could not respond.'
      // Só o inglês vai para a voz (a linha [PT] é a tradução, não deve ser lida).
      setConvMsgs(m => { if (autoVoz) falarIngles(soIngles(resposta), m.length); return [...m, { role: 'ai', text: resposta }] })
    } catch { setConvMsgs(m => [...m, { role: 'ai', text: 'Connection error. Please try again.' }]) }
    setLoadingConv(false)
  }

  const blue = '#1E63C7'; const blueDark = '#103D77'; const blueLight = '#EAF1FC'
  const green = '#16A34A'; const greenLight = '#E3F3EA'
  const purple = '#534AB7'; const purpleLight = '#EEEDFE'
  const gold = '#B8860B'; const goldLight = '#FFF8E1'
  const semanaVocab = Math.floor(Date.now() / (7 * 86400000))
  const embaralharSemana = (arr: any[]) => { const a = [...arr]; let s = semanaVocab + 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t } return a }
  // Rotação DIÁRIA determinística: mesma seleção para todos os alunos, muda à meia-noite. off = deslocamento por categoria.
  const diaAtual = Math.floor(Date.now() / 86400000)
  const rotaDia = (arr: any[], n: number, off = 0) => { const a = [...arr]; let s = (diaAtual + off) * 131 + 7; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t } return n > 0 ? a.slice(0, n) : a }
  const vocabBaseCat = vocabCat === 'all' ? vocab : vocab.filter(v => v.cat === vocabCat)
  const filteredVocab = embaralharSemana(vocabModo === 'revisar' ? vocabBaseCat.filter(v => vocabSrs[v.en] !== 'sabe') : vocabBaseCat)
  const vocabDominadas = vocab.filter(v => vocabSrs[v.en] === 'sabe').length
  const vocabRevisar = vocab.length - vocabDominadas
  const marcarVocab = (en: string, estado: string) => { try { localStorage.setItem('speakup_vocab_dia', hojeStr) } catch (e) {} ; setVocabDiaData(hojeStr); setVocabSrs(prev => { const next = { ...prev, [en]: estado }; try { localStorage.setItem('speakup_vocab_srs', JSON.stringify(next)) } catch (e) {} ; return next }) }
  const vocabFeitoHoje = vocabDiaData === hojeStr
  const OBJETIVO_PADRAO = 'Conversar 30 minutos em inglês sem usar português'
  function salvarPerfil(novo: any) { setPerfilIa(novo); if (userId) supabase.from('progresso').upsert({ user_id: userId, perfil_ia: novo, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(() => {}) }
  function registrarErro(topico: string) {
    const fracos = Array.from(new Set([...(perfilIa.topicos_fracos || []), topico])).slice(-12)
    salvarPerfil({ ...perfilIa, topicos_fracos: fracos, objetivo: perfilIa.objetivo || OBJETIVO_PADRAO })
  }
  function registrarDominio(topico: string) {
    const dominados = Array.from(new Set([...(perfilIa.dominados || []), topico])).slice(-20)
    const fracos = (perfilIa.topicos_fracos || []).filter((t: string) => t !== topico)
    salvarPerfil({ ...perfilIa, dominados, topicos_fracos: fracos, objetivo: perfilIa.objetivo || OBJETIVO_PADRAO, resumo_ultima_sessao: `Concluiu a lição "${topico}".`, atualizado_em: hojeStr })
  }
  // ----- Revisão Inteligente (SRS) -----
  // Intervalos em dias por "caixa": acertou sobe de caixa (revisa mais tarde); errou volta pra caixa 0.
  const SRS_INTERVALOS = [1, 2, 4, 8, 16]
  function agendarRevisao(titulo: string, acertou: boolean) {
    setSrsData(prev => {
      const atual = prev[titulo] || { box: 0, due: hojeStr }
      const box = acertou ? Math.min(atual.box + 1, SRS_INTERVALOS.length - 1) : 0
      const due = dataLocal(-SRS_INTERVALOS[box])
      const next = { ...prev, [titulo]: { box, due } }
      try { localStorage.setItem('speakup_srs', JSON.stringify(next)) } catch (e) {}
      return next
    })
  }
  // ----- Banco de erros reais: as questões que o aluno errou voltam na Revisão -----
  // Retrieval practice de verdade: errou → entra na fila; acertou 2x na revisão → sai.
  function guardarErroQ(quest: Question, licao: string) {
    try {
      const raw = localStorage.getItem('speakup_erros_qs')
      let lista: any[] = raw ? JSON.parse(raw) : []
      const ix = lista.findIndex(e => e.q === quest.q)
      if (ix >= 0) lista[ix].ok = 0
      else lista.push({ q: quest.q, opts: quest.opts, ans: quest.ans, exp: quest.exp, ctx: quest.ctx, licao, ok: 0 })
      lista = lista.slice(-30)
      localStorage.setItem('speakup_erros_qs', JSON.stringify(lista))
    } catch (e) {}
  }
  function resolverErroQ(qTexto: string, acertou: boolean) {
    try {
      const raw = localStorage.getItem('speakup_erros_qs')
      let lista: any[] = raw ? JSON.parse(raw) : []
      const ix = lista.findIndex(e => e.q === qTexto)
      if (ix < 0) return
      if (acertou) { lista[ix].ok = (lista[ix].ok || 0) + 1; if (lista[ix].ok >= 2) lista.splice(ix, 1) }
      else lista[ix].ok = 0
      localStorage.setItem('speakup_erros_qs', JSON.stringify(lista))
    } catch (e) {}
  }
  const errosQs: any[] = (() => { try { const raw = localStorage.getItem('speakup_erros_qs'); return raw ? JSON.parse(raw) : [] } catch (e) { return [] } })()
  // Lições concluídas cuja revisão já venceu (due <= hoje) e que ainda existem.
  const todasLicoes = Object.values(lessons).flat()
  const revisoesDevidas = Object.keys(srsData)
    .filter(t => srsData[t].due <= hojeStr && todasLicoes.some(l => l.title === t))
  // Monta até 6 questões: primeiro os ERROS REAIS do aluno (até 3), depois as lições
  // com revisão vencida (1-2 por lição), determinístico por dia.
  const revisaoQuestions: (Question & { _erro?: boolean })[] = (() => {
    const qs: (Question & { _erro?: boolean })[] = []
    for (const e of errosQs.slice(0, 3)) qs.push({ q: e.q, opts: e.opts, ans: e.ans, exp: e.exp, ctx: e.ctx, _erro: true })
    for (const titulo of revisoesDevidas) {
      const lic = todasLicoes.find(l => l.title === titulo)
      const pool = (lic?.q || []).filter(p => !qs.some(x => x.q === p.q))
      if (!pool.length) continue
      const k = daySeed % pool.length
      qs.push(pool[k])
      if (pool.length > 1 && qs.length < 6) qs.push(pool[(k + 1) % pool.length])
      if (qs.length >= 6) break
    }
    return qs.slice(0, 6)
  })()
  function finalizarRevisao() {
    setRevResult(true)
    const acertouTudo = revAcertos >= Math.ceil(revisaoQuestions.length * 0.6)
    // Promove/reagenda todas as lições que estavam devidas conforme o desempenho geral.
    revisoesDevidas.forEach(t => agendarRevisao(t, acertouTudo))
    const novoXp = xp + revAcertos * 3
    setXp(novoXp)
    try { track('revisao_concluida', { acertos: revAcertos, total: revisaoQuestions.length }) } catch (e) {}
  }

  const SONS_NOME: Record<string, string> = { th: 'o som "th" (think/this)', 'ed-final': 'a terminação "-ed" dos verbos', 'h-aspirado': 'o "h" aspirado (house/hot)', 'r-ingles': 'o "r" inglês', 'i-longo': 'vogais longas vs curtas (sheep/ship)', w: 'o som do "w" (wine≠vine)', 's-inicial': 'palavras começando com "s" + consoante (school)', oo: 'os sons de "oo" (food/book)' }
  function resumoPerfil(): string {
    const p = perfilIa || {}
    const partes: string[] = [`Aluno: ${userName || 'estudante'} (nível ${level}, ${xp} XP, sequência de ${streak} dias, ${doneLessons} lições concluídas).`]
    partes.push(`Objetivo do aluno: ${p.objetivo || OBJETIVO_PADRAO}.`)
    if (p.topicos_fracos?.length) partes.push(`Pontos em que o aluno erra e precisa de reforço: ${p.topicos_fracos.slice(-6).join('; ')}.`)
    if (p.dominados?.length) partes.push(`Tópicos que o aluno já domina: ${p.dominados.slice(-4).join('; ')}. Última lição concluída: ${p.dominados[p.dominados.length - 1]}.`)
    if (p.sons_dificeis?.length) partes.push(`Sons de pronúncia em que o aluno tem dificuldade: ${p.sons_dificeis.map((s: string) => SONS_NOME[s] || s).join('; ')}.`)
    partes.push('Use esse histórico para personalizar: cite a lição ou o erro específico do aluno quando fizer sentido, elogie o progresso real e foque nos pontos fracos. Não invente dados que não estão aqui.')
    partes.push('O aluno é brasileiro: fique de olho nos erros clássicos de brasileiro (traduzir "ter anos" como "have years" em vez de "be ... years old", esquecer o "s" da 3ª pessoa, confundir make/do, in/on/at, falsos cognatos como pretend/actually/push) e corrija com carinho quando aparecerem.')
    return partes.join(' ')
  }
  const metaDiaria = perfilIa.meta_diaria || 50
  function concluirOnboarding(nivel?: string, irNivelamento?: boolean) {
    salvarPerfil({ ...perfilIa, objetivo: onbObj || OBJETIVO_PADRAO, meta_diaria: onbMeta })
    if (nivel) { setLevel(nivel); try { localStorage.setItem('speakup_nivel', nivel) } catch (e) {} }
    try { localStorage.setItem('speakup_onboarded', '1') } catch (e) {}
    setOnboarded(true)
    if (irNivelamento) { setNivIdx(0); setNivScore([0, 0, 0, 0, 0, 0]); setNivSel(-1); setNivAns(false); setNivResult(null); setTab('nivelamento') }
  }
  const onbOpt: CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 14, padding: '14px 16px', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit' }
  const onbBack: CSSProperties = { background: 'none', border: 'none', color: '#BCD6F2', fontSize: 14, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' }
  const mostrarOnboarding = xpHydrated && isNovo && !perfilIa.objetivo && !onboarded
  const currentLesson = lessons[level][lessonIdx]

  // ⏳ Enquanto o progresso não chega do banco, mostra skeletons em vez de números zerados.
  if (!xpHydrated) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', background: 'var(--color-background-tertiary)' }}>
        <div style={{ width: '100%', maxWidth: 430, minHeight: '100dvh', background: 'var(--color-background-secondary)' }}>
          <div style={{ background: `linear-gradient(160deg, #2E72D6, ${blueDark})`, padding: '18px 16px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mascote size={30} /><span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Von<span style={{ background: '#FFD98A', color: '#7A5A12', padding: '0 6px', borderRadius: 6 }}>ai</span></span></div>
              <div className="su-skel" style={{ height: 26, width: 88, borderRadius: 20, background: 'rgba(255,255,255,0.25)' }} />
            </div>
            <div className="su-skel" style={{ height: 148, borderRadius: 18, background: 'rgba(255,255,255,0.18)' }} />
          </div>
          <div style={{ padding: 16 }}>
            <Skel h={78} r={16} mb={12} />
            <Skel h={64} r={16} mb={12} />
            <Skel h={64} r={16} mb={12} />
            <Skel h={150} r={16} mb={12} />
            <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--color-text-secondary)' }}>Carregando seu progresso…</div>
          </div>
        </div>
      </div>
    )
  }

  // 🔒 PAYWALL DURO: acabou o trial de 2 dias e não é Premium -> bloqueia o app até assinar.
  if (xpHydrated && !isPremium) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', background: 'var(--color-background-tertiary)' }}>
        <div style={{ width: '100%', maxWidth: 430, fontFamily: 'inherit', background: 'var(--color-background-tertiary)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: `linear-gradient(135deg, ${gold}, #DAA520)`, padding: '44px 20px 30px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><IcBadge e="⭐" color={gold} onDark box={58} size={30} /></div>
            <div style={{ fontSize: 23, fontWeight: 800, color: '#fff' }}>Seu teste grátis terminou</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 1.5 }}>Assine o <b>Vonai Premium</b> para continuar aprendendo inglês, do zero à fluência.</div>
          </div>
          <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#ffffff', borderRadius: 14, border: '0.5px solid #e5eaef', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16212c', marginBottom: 12 }}>Com o Premium você tem:</div>
              {[['📖', 'Todas as lições, do A1 ao C2'], ['🤖', 'Professor de IA ilimitado'], ['🎭', 'Conversas ilimitadas'], ['📊', 'Relatório de evolução'], ['🎯', 'Trilha personalizada']].map(([ic, t], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 4 ? 10 : 0 }}>
                  <span style={{ fontSize: 17 }}><Ic e={ic} /></span>
                  <span style={{ fontSize: 13.5, color: '#16212c' }}>{t}</span>
                  <span style={{ marginLeft: 'auto', color: green }}><Ic e="✓" /></span>
                </div>
              ))}
            </div>
            <button onClick={() => abrirAssinatura('mensal')} style={{ width: '100%', padding: 15, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>Assinar plano mensal — R$29,90/mês</button>
            <button onClick={() => abrirAssinatura('anual')} style={{ width: '100%', padding: 15, background: gold, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Assinar plano anual — {isIOSNative ? 'R$289,90' : 'R$289,80'}/ano 🔥</button>
            <div style={{ fontSize: 12, color: green, textAlign: 'center', fontWeight: 600, marginTop: 8 }}>No anual você economiza R$69 por ano</div>
            <div style={{ fontSize: 12, color: '#5c6b7a', textAlign: 'center', lineHeight: 1.5, marginTop: 12 }}>{isIOSNative ? 'Pagamento seguro pela App Store · Cancele quando quiser' : 'Pagamento seguro via Kiwify · Pix, cartão ou boleto'}</div>
            {!isIOSNative && <div style={{ fontSize: 12, color: '#8a5a00', textAlign: 'center', lineHeight: 1.5, marginTop: 12, background: goldLight, borderRadius: 10, padding: '10px 12px' }}>⚠️ Importante: pague com o <b>mesmo e-mail</b> que você usou pra criar sua conta no Vonai.</div>}
            {isIOSNative
              ? <button onClick={() => (window as any).VonaiNative?.restore?.()} style={{ width: '100%', padding: 12, marginTop: 16, background: '#fff', color: blue, border: `1px solid ${blue}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Restaurar compras</button>
              : <button onClick={() => window.location.reload()} style={{ width: '100%', padding: 12, marginTop: 16, background: '#fff', color: blue, border: `1px solid ${blue}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Já assinei — atualizar</button>}
            <button onClick={logout} style={{ width: '100%', padding: 12, marginTop: 10, background: 'none', color: '#8a97a5', border: 'none', fontSize: 13, cursor: 'pointer' }}>Sair da conta</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', background: 'var(--color-background-tertiary)' }}>
    <div style={{ width: '100%', maxWidth: 430, fontFamily: 'inherit', background: 'var(--color-background-tertiary)', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.10)' }}>

      <style>{`
        @keyframes su_fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes su_slide { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes su_pop { 0% { transform: scale(0.4); opacity: 0 } 60% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes su_dot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-4px) } }
        @keyframes su_pulse { 0% { box-shadow: 0 0 0 0 rgba(226,75,74,0.5) } 70% { box-shadow: 0 0 0 9px rgba(226,75,74,0) } 100% { box-shadow: 0 0 0 0 rgba(226,75,74,0) } }
        @keyframes su_bounce { 0% { transform: scale(0) rotate(-15deg); opacity: 0 } 50% { transform: scale(1.3) rotate(8deg) } 70% { transform: scale(0.9) rotate(-4deg) } 100% { transform: scale(1) rotate(0); opacity: 1 } }
        @keyframes su_bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes su_xppop { 0% { transform: scale(0) translateY(20px); opacity: 0 } 60% { transform: scale(1.2) translateY(0) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes su_confetti { 0% { transform: translateY(-20px) rotate(0); opacity: 1 } 100% { transform: translateY(320px) rotate(420deg); opacity: 0 } }
        @keyframes su_risefade { 0% { transform: translateY(14px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
        @keyframes su_float { 0% { transform: translate(-50%, 0) scale(0.6); opacity: 0 } 25% { transform: translate(-50%, -20px) scale(1.15); opacity: 1 } 100% { transform: translate(-50%, -90px) scale(1); opacity: 0 } }
        @keyframes su_eq { 0%, 100% { transform: scaleY(0.3) } 50% { transform: scaleY(1) } }
      `}</style>

      {xpFloat > 0 && (
        <div style={{ position: 'fixed', top: '38%', left: '50%', zIndex: 250, pointerEvents: 'none', background: '#16A34A', color: '#fff', fontWeight: 800, fontSize: 22, padding: '8px 20px', borderRadius: 24, boxShadow: '0 6px 18px rgba(22,163,74,0.4)', animation: 'su_float 0.85s ease-out forwards' }}>+{xpFloat} XP</div>
      )}

      {bauReward !== null && (
        <div onClick={() => setBauReward(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320, textAlign: 'center', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', animation: 'su_pop 0.4s ease' }}>
            <div style={{ fontSize: 60, animation: 'su_bounce 0.6s ease' }}>🎁</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#16212c', marginTop: 8 }}>Baú aberto!</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#E0A62E', marginTop: 10 }}>+{bauReward} 🪙</div>
            <div style={{ fontSize: 13, color: '#5c6b7a', marginTop: 8 }}>Volte amanhã para o próximo baú!</div>
            <button onClick={() => setBauReward(null)} style={{ width: '100%', padding: 13, marginTop: 20, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Show! 🎉</button>
          </div>
        </div>
      )}

      {lojaModal && (
        <div onClick={() => setLojaModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', width: '100%', maxWidth: 430, boxSizing: 'border-box', boxShadow: '0 -8px 30px rgba(0,0,0,0.25)', animation: 'su_slide 0.25s ease' }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: '#d7dde4', margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#16212c' }}>Loja</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E0A62E' }}>{moedas} 🪙</div>
            </div>
            <div style={{ fontSize: 13, color: '#5c6b7a', marginBottom: 16 }}>Use suas moedas para não perder o progresso.</div>
            <div style={{ background: '#f2f5f8', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 34 }}>🛡️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#16212c' }}>Proteção de sequência</div>
                <div style={{ fontSize: 12, color: '#5c6b7a', marginTop: 2 }}>Se faltar um dia, sua sequência não zera. Você tem: <b>{streakFreezes}/2</b></div>
              </div>
              <button onClick={comprarStreakFreeze} disabled={moedas < 50 || streakFreezes >= 2} style={{ background: moedas >= 50 && streakFreezes < 2 ? blue : '#e5eaef', color: moedas >= 50 && streakFreezes < 2 ? '#fff' : '#8a97a4', border: 'none', borderRadius: 20, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: moedas >= 50 && streakFreezes < 2 ? 'pointer' : 'default', flexShrink: 0 }}>{streakFreezes >= 2 ? 'Máx.' : '50 🪙'}</button>
            </div>
            <button onClick={() => setLojaModal(false)} style={{ width: '100%', padding: 12, marginTop: 14, background: 'none', color: '#5c6b7a', border: 'none', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Fechar</button>
          </div>
        </div>
      )}

      <div key={tab} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, animation: 'su_screen 0.28s ease' }}>

      {tab === 'home' && (
        <div>
          <div style={{ background: `linear-gradient(160deg, #2E72D6, ${blueDark})`, padding: 'calc(env(safe-area-inset-top) + 14px) 16px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}><Mascote size={24} /></div>
                <span style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>Von<span style={{ background: '#FFD98A', color: '#103D77', borderRadius: 7, padding: '1px 6px', marginLeft: 2 }}>ai</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <div onClick={() => setLojaModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,201,122,0.18)', border: '1px solid rgba(245,201,122,0.5)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer' }}><span style={{ fontSize: 13 }}>🪙</span><span style={{ fontSize: 13, fontWeight: 700, color: '#FFD98A' }}>{moedas}</span></div>
                <button onClick={alternarTema} aria-label="Alternar modo escuro" title="Modo claro/escuro" style={{ background: blueDark, border: 'none', borderRadius: 8, padding: '6px 9px', color: '#85B7EB', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>{temaEscuro ? '☀️' : '🌙'}</button>
                <button onClick={logout} style={{ background: blueDark, border: 'none', borderRadius: 8, padding: '6px 11px', color: '#85B7EB', fontSize: 12, cursor: 'pointer' }}>Sair</button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#B5D4F4' }}>{saudacao},</div><div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{userName} {isPremium && <span style={{ fontSize: 11, background: gold, color: '#fff', padding: '2px 7px', borderRadius: 20, marginLeft: 6 }}>PRO <Ic e="⭐" /></span>}</div>
            </div>
            {(() => {
              const lvlArr = lessons[level] || []
              const lvlDone = lvlArr.filter(l => licoesConcluidas.includes(l.title)).length
              const lvlPct = lvlArr.length ? Math.round(lvlDone / lvlArr.length * 100) : 0
              const C = 188.5
              const nv = nivelDeXp(xp)
              return (
              <div style={{ background: blueDark, borderRadius: 20, padding: 18 }}>
                {isNovo && <div style={{ textAlign: 'center', marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Bem-vindo ao Vonai! <Ic e="🎉" /></div><div style={{ fontSize: 12, color: '#BCD6F2', lineHeight: 1.5 }}>Comece sua primeira lição e ganhe seus primeiros 10 XP.</div></div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                    <svg width="76" height="76" viewBox="0 0 76 76">
                      <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="7" />
                      <circle cx="38" cy="38" r="30" fill="none" stroke="#4ADE80" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * lvlPct / 100} ${C}`} transform="rotate(-90 38 38)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{level}</div>
                      <div style={{ fontSize: 10, color: '#9DBBDD', marginTop: 2 }}>{lvlPct}%</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#BCD6F2', marginBottom: 9 }}>Seu progresso no nível {level}</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{xpShown}</div><div style={{ fontSize: 10, color: '#9DBBDD', marginTop: 3 }}>XP</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: xpHoje > 0 ? '#4ADE80' : '#fff', lineHeight: 1 }}>+{xpHoje}</div><div style={{ fontSize: 10, color: '#9DBBDD', marginTop: 3 }}>hoje</div></div>
                      <div><div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{doneLessons}</div><div style={{ fontSize: 10, color: '#9DBBDD', marginTop: 3 }}>lições</div></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,166,35,0.16)', borderRadius: 12, padding: '9px 12px', marginBottom: 14 }}>
                  <Ic e="🔥" c="#F5A623" s={22} />
                  <div style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: 600 }}>{streak} {streak === 1 ? 'dia' : 'dias'} de sequência</div>
                  {recorde > 0 && <div style={{ fontSize: 12, color: '#F5C97A', fontWeight: 600 }}><Ic e="🏆" /> recorde {recorde}</div>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}><Ic e="⭐" c="#FFD98A" /> Nível {nv.nivel}</div>
                    <div style={{ fontSize: 11, color: '#BCD6F2', fontWeight: 600 }}>faltam {nv.need - nv.into} XP</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg,#FFD98A,#F5A623)', height: '100%', width: `${nv.pct}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}><Ic e="🎯" /> Meta de hoje</div>
                  <div style={{ fontSize: 11, color: xpHoje >= metaDiaria ? '#4ADE80' : '#BCD6F2', fontWeight: 600 }}>{xpHoje}/{metaDiaria} XP {xpHoje >= metaDiaria && <Ic e="✓" />}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: xpHoje >= metaDiaria ? '#4ADE80' : '#F5A623', height: '100%', width: `${Math.min(100, Math.round(xpHoje / metaDiaria * 100))}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
                {isNovo && <button onClick={() => setTab('lessons')} style={{ width: '100%', marginTop: 16, background: '#F5A623', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Começar minha jornada <Ic e="→" /></button>}
              </div>
              )
            })()}
          </div>
          <div style={{ padding: '16px', marginTop: 8 }}>
            {/* COACH: o professor fala com o aluno — dados reais, tom de treinador. */}
            {(() => {
              const cen = rotaDia(scenarios, 1)[0]
              const xpHoje = Math.max(0, xp - xpInicioDia)
              const faltaMeta = Math.max(0, metaDiaria - xpHoje)
              const linhas: string[] = []
              if (isNovo) {
                linhas.push(`Oi, ${userName}! Eu sou o Vô, seu professor particular de inglês — disponível 24h por dia. 👋`)
                linhas.push('Seu primeiro passo leva 3 minutinhos. Vamos fazer juntos?')
              } else {
                if (licoesHoje === 0 && streak > 0) linhas.push(`Seu fogo de ${streak} ${streak === 1 ? 'dia' : 'dias'} está esperando — uma lição segura ele. 🔥`)
                else if (faltaMeta > 0) linhas.push(`Faltam só ${faltaMeta} XP para a meta de hoje. Você consegue!`)
                else linhas.push(`Meta de hoje batida com ${xpHoje} XP! 🎉 Daqui pra frente é lucro.`)
                if (streak >= 3 && streak >= recorde) linhas.push(`Você está no seu RECORDE: ${streak} dias seguidos. Bora esticar essa marca?`)
                else if (recorde > 1 && streak === recorde - 1) linhas.push(`Amanhã você iguala seu recorde de ${recorde} dias. Não pare agora!`)
                if (cen) linhas.push(`Preparei uma conversa sobre "${cen.title}" para hoje. Topa treinar comigo?`)
              }
              const irPrimeiraLicao = () => { const arr = lessons[level] || []; const idx = arr.findIndex(l => !licoesConcluidas.includes(l.title)); setLessonIdx(Math.max(0, idx)); setQIdx(0); setAnswered(false); setSelected(-1); setAjudaTxt(null); licaoErrosRef.current = 0; licaoComboRef.current = 0; setView('explanation'); setTab('lessons'); try { track('coach_primeira_licao') } catch (e) {} }
              return (
                <div style={{ background: 'linear-gradient(135deg, #6A5ACD, #4B3FBF)', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0 6px 18px rgba(75,63,191,0.3)', animation: 'su_risefade 0.5s ease both' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'su_bob 2.4s ease-in-out infinite', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}><Mascote size={44} prof humor="feliz" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#D6CFFF', letterSpacing: 0.5 }}>VÔ · SEU PROFESSOR PARTICULAR</span>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 10.5, color: '#B9AFF5' }}>online</span>
                      </div>
                      {linhas.map((l, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.14)', borderRadius: i === 0 ? '4px 14px 14px 14px' : 14, padding: '9px 13px', color: '#fff', fontSize: 13.5, lineHeight: 1.5, marginTop: 8, animation: `su_risefade 0.45s ease ${0.2 + i * 0.5}s both` }}>{l}</div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', animation: `su_risefade 0.45s ease ${0.3 + linhas.length * 0.5}s both` }}>
                        {isNovo ? (
                          <button onClick={irPrimeiraLicao} style={{ flex: 1, minWidth: 200, padding: '12px 16px', background: '#fff', color: '#4B3FBF', border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>📖 Fazer minha primeira lição</button>
                        ) : (<>
                          <button onClick={() => { if (cen) { startScenario(cen); setTab('speak') } else setTab('speak'); try { track('coach_conversa_dia') } catch (e) {} }} style={{ flex: 1, minWidth: 150, padding: '11px 14px', background: '#fff', color: '#4B3FBF', border: 'none', borderRadius: 24, fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>🎭 Conversar agora</button>
                          <button onClick={() => setTab('ai')} style={{ padding: '11px 14px', background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 24, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>💬 Tirar dúvida</button>
                        </>)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
            <div onClick={() => { setTab('liga'); carregarLiga() }} style={{ background: 'linear-gradient(135deg, #2E72D6, #103D77)', borderRadius: 16, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 30 }}>🏆</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Liga da semana</div><div style={{ fontSize: 12, color: '#B5D4F4', marginTop: 2 }}>Dispute o topo do ranking com outros alunos</div></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 20 }}>Ver <Ic e="→" /></span>
            </div>
            {histDone.length < HISTORIAS.length && (
              <div onClick={() => { setHistSel(null); setTab('historias') }} style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', borderRadius: 16, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 30 }}>📖</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Histórias</div><div style={{ fontSize: 12, color: '#DDD6FE', marginTop: 2 }}>Mini-novelas com áudio e perguntas · {histDone.length}/{HISTORIAS.length} concluídas</div></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 20 }}>Ler <Ic e="→" /></span>
              </div>
            )}
            {!errbrFeito && (
              <div onClick={() => { setErrQ(0); setErrSel(-1); setErrAns(false); setErrAcertos(0); setErrResult(false); setTab('errbr'); try { track('errosbr_aberto') } catch (e) {} }} style={{ background: 'linear-gradient(135deg, #059669, #B45309)', borderRadius: 16, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 30 }}>🇧🇷</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Caça-Erros do Brasileiro</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>5 armadilhas que todo brasileiro cai — escape delas hoje</div></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 20 }}>Jogar <Ic e="→" /></span>
              </div>
            )}
            {(revisoesDevidas.length > 0 || errosQs.length > 0) && (
              <div onClick={() => { setRevQ(0); setRevSel(-1); setRevAns(false); setRevAcertos(0); setRevResult(false); setTab('revisao') }} style={{ background: 'linear-gradient(135deg, #16A34A, #0F7A38)', borderRadius: 16, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <IcBadge e="🧠" color="#0F7A38" onDark box={44} size={24} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Revisão Inteligente</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{errosQs.length > 0 ? `${errosQs.length} ${errosQs.length === 1 ? 'erro seu esperando revanche' : 'erros seus esperando revanche'}` : `${revisoesDevidas.length} ${revisoesDevidas.length === 1 ? 'lição pronta' : 'lições prontas'} pra fixar de vez`}</div></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.22)', padding: '4px 10px', borderRadius: 20 }}>Revisar <Ic e="→" /></span>
              </div>
            )}
            {(() => {
              const proxL = lessons[level]?.find(l => !l.done)
              const tasks = [
                { icon: '📖', titulo: 'Lição de hoje', sub: proxL ? proxL.title : 'Revisar o nível', feito: licoesHoje > 0, acao: () => setTab('lessons') },
                { icon: '🧠', titulo: 'Vocabulário', sub: `${vocabRevisar} palavras`, feito: vocabFeitoHoje, acao: () => { setVocabModo('revisar'); setTab('vocab') } },
                { icon: '🎭', titulo: 'Simulador', sub: 'Falar com a IA', feito: simulacoesHoje > 0, acao: () => setTab('speak') },
                { icon: '🔥', titulo: 'Desafio do dia', sub: '5 perguntas', feito: desafioFeito, acao: () => { setDesQ(0); setDesSel(-1); setDesAns(false); setDesAcertos(0); setDesResult(false); setTab('desafio') } },
              ]
              const feitos = tasks.filter(t => t.feito).length
              const tudo = feitos === tasks.length
              return (
                <div style={{ background: blueDark, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}><Ic e="🎯" /> Seu plano de hoje</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: tudo ? '#4ADE80' : '#BCD6F2' }}>{feitos}/{tasks.length}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: tudo ? '#4ADE80' : (streak > 0 && feitos === 0) ? '#FFD98A' : '#9DBBDD', marginBottom: 12, fontWeight: (streak > 0 && feitos === 0) ? 600 : 400 }}>{tudo ? 'Mandou bem! Plano de hoje completo 🎉' : (streak > 0 && feitos === 0) ? `🔥 Não perca sua sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'} — faça 1 tarefa!` : `Meta: ${perfilIa.objetivo || OBJETIVO_PADRAO}`}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {tasks.map((t, i) => (
                      <div key={i} onClick={t.feito ? undefined : t.acao} style={{ background: t.feito ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, cursor: t.feito ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 92 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.feito ? '#16A34A' : 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.feito ? <Ic e="✓" s={17} c="#fff" /> : <Ic e={t.icon} s={18} c="#fff" />}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.2, textDecoration: t.feito ? 'line-through' : 'none', opacity: t.feito ? 0.75 : 1 }}>{t.titulo}</div>
                        <div style={{ fontSize: 10.5, color: '#9DBBDD', lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            {(() => {
              const weekNow = Math.floor(Date.now() / (7 * 86400000))
              const claimed = missoes.week === weekNow ? missoes.claimed : []
              const semXpAtual = Math.max(0, xp - semBaseRef.current)
              const diasSemana = Object.keys(hist).filter(d => Math.floor(new Date(d + 'T00:00:00').getTime() / (7 * 86400000)) === weekNow && (hist[d] || 0) > 0).length
              const lista = [
                { id: 'xp', e: '⚡', nome: 'Ganhe 150 XP na semana', cur: Math.min(semXpAtual, 150), alvo: 150, reward: 40 },
                { id: 'dias', e: '📅', nome: 'Estude em 5 dias diferentes', cur: Math.min(diasSemana, 5), alvo: 5, reward: 60 },
                { id: 'streak', e: '🔥', nome: 'Alcance 7 dias de sequência', cur: Math.min(streak, 7), alvo: 7, reward: 50 },
              ]
              const feitas = lista.filter(m => claimed.includes(m.id)).length
              return (
                <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}><Ic e="🎯" c={purple} /> Missões da semana</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: feitas === lista.length ? green : 'var(--color-text-secondary)' }}>{feitas}/{lista.length}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lista.map(m => {
                      const pct = Math.round(m.cur / m.alvo * 100)
                      const completa = m.cur >= m.alvo
                      const resgatada = claimed.includes(m.id)
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: resgatada ? 'rgba(22,163,74,0.14)' : 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e={m.e} s={19} c={resgatada ? green : '#6A5ACD'} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 5 }}>{m.nome}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, background: 'var(--color-background-secondary)', borderRadius: 5, height: 7, overflow: 'hidden' }}><div style={{ background: completa ? green : '#6A5ACD', height: '100%', width: `${pct}%`, borderRadius: 5, transition: 'width 0.4s' }} /></div>
                              <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', fontWeight: 600, minWidth: 42, textAlign: 'right' }}>{m.cur}/{m.alvo}</div>
                            </div>
                          </div>
                          {resgatada ? (
                            <div style={{ fontSize: 11, fontWeight: 700, color: green, flexShrink: 0 }}><Ic e="✓" /> feito</div>
                          ) : completa ? (
                            <button onClick={() => claimMissao(m.id, m.reward)} style={{ flexShrink: 0, background: 'linear-gradient(135deg,#E0A62E,#B9861F)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>+{m.reward} 🪙</button>
                          ) : (
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', flexShrink: 0 }}>+{m.reward} 🪙</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
            {!isPremium && (
              <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #B8860B, #DAA520)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <IcBadge e="⭐" color={gold} onDark box={44} size={24} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Seja Premium <Ic e="✨" /></div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>IA ilimitada · Conversação por voz · Plano personalizado</div></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>R$29,90/mês <Ic e="→" /></div>
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '2px 2px 10px' }}>Explorar</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div onClick={() => { setView('levels'); setTab('lessons') }} style={{ background: blueLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="📖" color={blue} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: blueDark }}>Lições</div>
                <div style={{ fontSize: 11, color: blue }}>Trilha por nível</div>
              </div>
              <div onClick={() => setTab('speak')} style={{ background: purpleLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="🎭" color={purple} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#3C3489' }}>Simulador</div>
                <div style={{ fontSize: 11, color: purple }}>{scenarios.length} cenários</div>
              </div>
              <div onClick={() => setTab('ai')} style={{ background: '#FAEEDA', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="🤖" color="#B45309" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#633806' }}>Professor IA</div>
                <div style={{ fontSize: 11, color: '#854F0B' }}>Tira-dúvidas 24h</div>
              </div>
              <div onClick={() => setTab('vocab')} style={{ background: greenLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="📚" color={green} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#27500A' }}>Vocabulário</div>
                <div style={{ fontSize: 11, color: green }}>{vocab.length} palavras</div>
              </div>
              <div onClick={() => { setPronCat(null); setPronIdx(0); setPronHeard(''); setPronScore(null); setPronTip(''); setTab('pronuncia') }} style={{ background: '#EDE9FE', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="🎤" color="#6A5ACD" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#4B3FBF' }}>Pronúncia</div>
                <div style={{ fontSize: 11, color: '#6A5ACD' }}>Fale e receba dicas</div>
              </div>
              <div onClick={() => { setProvaQ(0); setProvaSel(-1); setProvaAns(false); setProvaAcertos(0); setProvaResult(false); setProvaNivelEscolhido(false); setTab('prova') }} style={{ background: '#FDECEC', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="📝" color="#C0392B" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#9B2D2D' }}>Prova Semanal</div>
                <div style={{ fontSize: 11, color: '#C0392B' }}>{provaScoreSemana !== null ? `Nota: ${provaScoreSemana}/20` : '20 questões'}</div>
              </div>
              <div onClick={() => { setNivIdx(0); setNivScore([0,0,0,0,0,0]); setNivSel(-1); setNivAns(false); setNivResult(null); setTab('nivelamento') }} style={{ background: '#E8F4FB', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="📊" color="#0F6FA8" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0B3A52' }}>Teste de nível</div>
                <div style={{ fontSize: 11, color: '#0F6FA8' }}>Descubra seu nível</div>
              </div>
              <div onClick={() => setTab('evolucao')} style={{ background: '#EAF1FC', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <IcBadge e="📈" color={blue} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: blueDark }}>Evolução</div>
                <div style={{ fontSize: 11, color: blue }}>Métricas e conquistas</div>
              </div>
            </div>
            {!lembretesAtivos && (
              <div onClick={ativarLembretes} style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', borderRadius: 12, padding: 16, marginTop: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e="🔔" s={22} c="#fff" /></div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Ativar lembretes diários</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Receba um aviso pra não quebrar sua sequência</div></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A', background: '#fff', padding: '5px 12px', borderRadius: 20, flexShrink: 0 }}>Ativar</div>
              </div>
            )}
            {lembretesAtivos && (
              <div style={{ background: '#E3F3EA', borderRadius: 12, padding: '12px 14px', marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Ic e="🔔" s={20} c="#16A34A" />
                <div style={{ flex: 1, fontSize: 13, color: '#15803D', fontWeight: 600 }}>Lembretes diários ativados <Ic e="✓" /></div>
              </div>
            )}
            {bauDia !== hojeStr && (
              <div onClick={abrirBau} style={{ background: 'linear-gradient(135deg, #E0A62E, #B9861F)', borderRadius: 16, padding: 14, marginTop: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 14px rgba(224,166,46,0.35)' }}>
                <div style={{ fontSize: 34, animation: 'su_bob 1.6s ease-in-out infinite' }}>🎁</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Baú do dia</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>Toque para abrir e ganhar moedas 🪙</div></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7a5a10', background: '#FFD98A', padding: '5px 12px', borderRadius: 20 }}>Abrir</span>
              </div>
            )}
            <div onClick={compartilharIndicacao} style={{ background: 'linear-gradient(135deg, #F97362, #D8432A)', borderRadius: 16, padding: 14, marginTop: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 14px rgba(216,67,42,0.3)' }}>
              <div style={{ fontSize: 28 }}>🎁</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Convide um amigo</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}>Ele ganha +2 dias Premium, você ganha 100 🪙{(perfilIa.indicacoes || 0) > 0 ? ` · ${perfilIa.indicacoes} ${perfilIa.indicacoes === 1 ? 'amigo trazido' : 'amigos trazidos'}` : ''}</div></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#B23415', background: '#fff', padding: '4px 12px', borderRadius: 20 }}>Enviar</span>
            </div>
            {(() => {
              const conquistas = conquistasDef
              const ganhas = conquistas.filter(c => c.ok).length
              // Na home mostra só 4: as conquistadas primeiro, completando com as próximas
              // a desbloquear (o resto fica em "ver tudo", na aba Evolução).
              const amostra = [...conquistas].sort((a, b) => (a.ok === b.ok ? 0 : a.ok ? -1 : 1)).slice(0, 4)
              return (
                <div onClick={() => setTab('evolucao')} style={{ background: 'var(--color-background-primary)', borderRadius: 12, border: '0.5px solid var(--color-border-tertiary)', padding: 12, marginTop: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}><Ic e="🏅" /> Conquistas</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: blue }}>{ganhas}/{conquistas.length} · ver tudo <Ic e="→" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {amostra.map((c, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto', borderRadius: '50%', background: c.ok ? goldLight : 'var(--color-background-secondary)', border: c.ok ? `1.5px solid ${gold}` : '1px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ filter: c.ok ? 'none' : 'grayscale(1)', opacity: c.ok ? 1 : 0.4 }}><Ic e={c.e} s={19} c={c.ok ? gold : undefined} /></span>
                          {c.ok && <span style={{ position: 'absolute', right: -2, bottom: -2, width: 15, height: 15, borderRadius: '50%', background: '#16A34A', border: '2px solid var(--color-background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="✓" s={8} c="#fff" /></span>}
                        </div>
                        <div style={{ fontSize: 9, color: c.ok ? gold : 'var(--color-text-secondary)', fontWeight: c.ok ? 600 : 400, marginTop: 4, lineHeight: 1.15 }}>{c.nome}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            <div style={{ textAlign: 'center', marginTop: 20, paddingBottom: 4 }}>
              <span onClick={() => { setFeedbackEnviado(false); setFeedbackModal(true) }} style={{ fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Vonai · enviar feedback <Ic e="💬" /></span>
            </div>
          </div>
        </div>
      )}

      {feedbackModal && (
        <div onClick={() => setFeedbackModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxWidth: 430, boxSizing: 'border-box', animation: 'su_slide 0.25s ease', boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}>
            {feedbackEnviado ? (
              <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}><Ic e="🎉" c="#16A34A" /></div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#16212c', marginBottom: 6 }}>Feedback enviado!</div>
                <div style={{ fontSize: 13, color: '#5c6b7a', lineHeight: 1.5, marginBottom: 18 }}>Obrigado por ajudar a melhorar o Vonai. 💙</div>
                <button onClick={() => setFeedbackModal(false)} style={{ width: '100%', padding: 13, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Fechar</button>
              </div>
            ) : (<>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}><Ic e="💬" c={blue} /></span>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#16212c' }}>Enviar feedback</div>
              </div>
              <div style={{ fontSize: 13, color: '#5c6b7a', lineHeight: 1.5, marginBottom: 14 }}>Encontrou um problema ou tem uma sugestão? Conta pra gente — a sua opinião ajuda demais.</div>
              <textarea value={feedbackTxt} onChange={e => setFeedbackTxt(e.target.value)} placeholder="Escreva aqui seu feedback, sugestão ou problema..." rows={5} style={{ width: '100%', padding: '12px 14px', border: '1px solid #e4e9ef', borderRadius: 12, fontSize: 14, background: '#f2f5f8', color: '#16212c', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              <button onClick={enviarFeedback} style={{ width: '100%', padding: 14, marginTop: 12, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Enviar <Ic e="→" /></button>
              <button onClick={() => setFeedbackModal(false)} style={{ width: '100%', padding: 10, marginTop: 8, background: 'none', color: 'var(--color-text-secondary)', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            </>)}
          </div>
        </div>
      )}

      {avalModal && (
        <div onClick={() => fecharAval('depois')} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, width: '100%', maxWidth: 430, boxSizing: 'border-box', animation: 'su_slide 0.25s ease', boxShadow: '0 -8px 40px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>⭐</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#16212c', marginBottom: 6 }}>Você está curtindo o Vonai?</div>
            <div style={{ fontSize: 13, color: '#5c6b7a', lineHeight: 1.5, marginBottom: 18 }}>Já são {doneLessons} {doneLessons === 1 ? 'lição' : 'lições'}{streak > 1 ? ` e ${streak} dias de sequência` : ''} — sua avaliação ajuda outros brasileiros a encontrarem o app. 💙</div>
            <button onClick={() => fecharAval('avaliou')} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #2E72D6, #185FA5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>⭐ Avaliar na Play Store</button>
            <button onClick={() => fecharAval('melhorar')} style={{ width: '100%', padding: 12, background: '#f2f5f8', color: '#16212c', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>Tenho uma sugestão de melhoria</button>
            <button onClick={() => fecharAval('depois')} style={{ width: '100%', padding: 10, background: 'none', color: '#8896a6', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Agora não</button>
          </div>
        </div>
      )}

      {mostrarOnboarding && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: `linear-gradient(160deg, #2E72D6, ${blueDark})`, display: 'flex', padding: 24, overflowY: 'auto' }}>
          <div key={onbStep} style={{ maxWidth: 420, margin: 'auto', width: '100%', color: '#fff', animation: 'su_screen 0.32s ease' }}>
            {onbStep === 0 && (<>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Bem-vindo ao Vonai! <Ic e="🎉" /></div>
              <div style={{ fontSize: 15, color: '#D6E6FA', marginBottom: 22 }}>Qual é o seu principal objetivo com o inglês?</div>
              {[{ e: '✈️', t: 'Me virar em viagens', o: 'Me virar em viagens no exterior' }, { e: '💼', t: 'Trabalho e carreira', o: 'Usar inglês no trabalho e na carreira' }, { e: '💬', t: 'Conversar com fluência', o: 'Conversar com fluência em inglês' }, { e: '🎓', t: 'Estudos e provas', o: 'Passar em provas e estudar em inglês' }].map(op => (
                <button key={op.t} onClick={() => { setOnbObj(op.o); setOnbStep(1) }} style={onbOpt}><span style={{ fontSize: 24, marginRight: 12 }}>{op.e}</span> {op.t}</button>
              ))}
            </>)}
            {onbStep === 1 && (<>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Quanto tempo por dia? <Ic e="⏳" /></div>
              <div style={{ fontSize: 15, color: '#D6E6FA', marginBottom: 22 }}>Escolha uma meta diária realista — dá pra mudar depois.</div>
              {[{ e: '☕', t: 'Casual', d: '~5 min por dia', m: 20 }, { e: '🎯', t: 'Regular', d: '~10 min por dia', m: 50 }, { e: '🔥', t: 'Sério', d: '~15 min por dia', m: 80 }, { e: '🚀', t: 'Intenso', d: '20+ min por dia', m: 120 }].map(op => (
                <button key={op.t} onClick={() => { setOnbMeta(op.m); setOnbStep(2) }} style={onbOpt}><span style={{ fontSize: 24, marginRight: 12 }}>{op.e}</span><span style={{ flex: 1, textAlign: 'left' }}>{op.t}<span style={{ display: 'block', fontSize: 12, color: '#BCD6F2', fontWeight: 400 }}>{op.d}</span></span></button>
              ))}
              <button onClick={() => setOnbStep(0)} style={onbBack}>← Voltar</button>
            </>)}
            {onbStep === 2 && (<>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Qual é o seu nível? <Ic e="📊" /></div>
              <div style={{ fontSize: 15, color: '#D6E6FA', marginBottom: 22 }}>Assim começamos você no ponto certo da trilha.</div>
              <button onClick={() => concluirOnboarding('A1')} style={onbOpt}><span style={{ fontSize: 24, marginRight: 12 }}>🌱</span> Sou iniciante</button>
              <button onClick={() => concluirOnboarding('A2')} style={onbOpt}><span style={{ fontSize: 24, marginRight: 12 }}>🌿</span> Já sei um pouco</button>
              <button onClick={() => concluirOnboarding(undefined, true)} style={onbOpt}><span style={{ fontSize: 24, marginRight: 12 }}>📊</span> Fazer teste de nível (2 min)</button>
              <button onClick={() => setOnbStep(1)} style={onbBack}>← Voltar</button>
            </>)}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
              {[0, 1, 2].map(s => <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: s === onbStep ? '#fff' : 'rgba(255,255,255,0.35)' }} />)}
            </div>
          </div>
        </div>
      )}

      {conqNova && (
        <div onClick={() => setConqNova(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320, textAlign: 'center', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {['#F5A623', '#534AB7', '#16A34A', '#2E72D6', '#E24B4A', '#DAA520', '#16A34A', '#6A5ACD'].map((cor, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, left: `${8 + i * 11}%`, width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1.4 + (i % 4) * 0.3}s ease-in ${(i % 5) * 0.12}s forwards` }} />
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: gold, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conquista desbloqueada!</div>
            <div style={{ width: 88, height: 88, margin: '0 auto 16px', borderRadius: '50%', background: goldLight, border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, animation: 'su_bounce 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}><Ic e={conqNova.e} /></div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#16212c', marginBottom: 6 }}>{conqNova.nome}</div>
            <div style={{ fontSize: 13, color: '#5c6b7a', marginBottom: 22, lineHeight: 1.5 }}>Mais uma medalha na sua coleção. Continue assim! <Ic e="🔥" /></div>
            <button onClick={() => setConqNova(null)} style={{ width: '100%', padding: 13, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Continuar <Ic e="→" /></button>
          </div>
        </div>
      )}

      {zapModal && (
        <div onClick={() => setZapModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-background-primary)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxWidth: 440, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 26 }}><Ic e="📲" /></span>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>Receba dicas no WhatsApp</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>Dicas de inglês e lembretes do seu desafio diário, direto no seu WhatsApp.</div>
            <input value={whatsappInput} onChange={e => setWhatsappInput(e.target.value)} placeholder="(00) 00000-0000" inputMode="tel" style={{ width: '100%', padding: 13, borderRadius: 10, border: '1px solid var(--color-border-tertiary)', fontSize: 15, marginBottom: 10, boxSizing: 'border-box' }} />
            <button onClick={async () => { if (await salvarWhatsapp()) setZapModal(false) }} style={{ width: '100%', padding: 14, background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>{whatsapp ? 'Atualizar número' : 'Quero receber'}</button>
            <button onClick={() => setZapModal(false)} style={{ width: '100%', padding: 12, background: 'none', color: 'var(--color-text-secondary)', border: 'none', fontSize: 14, cursor: 'pointer' }}>Agora não</button>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6, textAlign: 'center', lineHeight: 1.4 }}>Ao informar, você concorda em receber mensagens. Cancele quando quiser.</div>
          </div>
        </div>
      )}

      {tab === 'prova' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #C0392B, #9B2D2D)', padding: '20px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📝" color="#C0392B" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Prova Semanal · {level}</div></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>20 questões do seu nível · muda toda semana</div>
          </div>
          <div style={{ padding: 16 }}>
            {!provaNivelEscolhido ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Qual nível você quer testar?</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>Escolha o nível da sua prova desta semana. Você pode testar qualquer um.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {([['A1', 'Iniciante', '🌱', '#16A34A'], ['A2', 'Básico', '🌿', '#16A34A'], ['B1', 'Intermediário', '💬', '#2E72D6'], ['B2', 'Intermediário+', '🗣️', '#2E72D6'], ['C1', 'Avançado', '🎯', '#7C3AED'], ['C2', 'Domínio', '🏆', '#7C3AED']] as const).map(([lv, nome, ic, col]) => (
                    <button key={lv} onClick={() => { setLevel(lv); setProvaNivelEscolhido(true); setProvaQ(0); setProvaSel(-1); setProvaAns(false); setProvaAcertos(0); setProvaResult(false) }} style={{ width: '100%', textAlign: 'left', padding: 14, borderRadius: 14, border: level === lv ? `1.5px solid ${col}` : '0.5px solid var(--color-border-tertiary)', borderLeft: `5px solid ${col}`, background: level === lv ? col + '12' : 'var(--color-background-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}><span style={{ width: 44, height: 44, borderRadius: 12, background: col + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e={ic} c={col} s={22} /></span><span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{lv} · {nome}</span><span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>20 questões</span></span><span style={{ color: col }}><Ic e="→" c={col} /></span></button>
                  ))}
                </div>
              </div>
            ) : provaQuestoes.length < 1 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>Sem questões suficientes neste nível ainda.</div>
            ) : !provaResult ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#C0392B', fontWeight: 700, background: '#FDECEC', padding: '4px 12px', borderRadius: 20 }}>Questão {provaQ + 1} de {provaQuestoes.length}</span>
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}><Ic e="✓" c="#16A34A" /> {provaAcertos} acertos</span>
                </div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 8, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg,#E24B4A,#C0392B)', height: '100%', width: `${provaQ / provaQuestoes.length * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {provaQuestoes[provaQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #C0392B', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{provaQuestoes[provaQ].ctx}</div>) : null}
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4, position: 'relative' }}>
                  {provaQuestoes[provaQ].q}
                  {provaAns && provaSel === provaQuestoes[provaQ].ans && (
                    <div style={{ position: 'absolute', top: -10, right: -4, pointerEvents: 'none' }}>
                      {['#16A34A', '#4ADE80', '#F5A623', '#2E72D6', '#DB2777', '#7C3AED'].map((cor, i) => (
                        <span key={i} style={{ position: 'absolute', top: 0, right: i * 10, width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1 + (i % 3) * 0.25}s ease-in ${(i % 4) * 0.05}s forwards` }} />
                      ))}
                    </div>
                  )}
                </div>
                {provaAns && (
                  <div style={{ textAlign: 'center', marginBottom: 12, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                    {provaSel === provaQuestoes[provaQ].ans ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E3F3EA', color: '#16A34A', fontSize: 15, fontWeight: 700, padding: '8px 18px', borderRadius: 24 }}><span style={{ animation: 'su_bounce 0.6s ease' }}>🎉</span> Acertou! <Ic e="✓" c={green} /></span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBEAE8', color: '#C0392B', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 24 }}>Quase! A resposta certa está em verde 👇</span>
                    )}
                  </div>
                )}
                {provaQuestoes[provaQ].opts.map((opt: string, i: number) => {
                  const correta = provaAns && i === provaQuestoes[provaQ].ans
                  const errada = provaAns && i === provaSel && i !== provaQuestoes[provaQ].ans
                  return (
                    <button key={i} onClick={() => { if (provaAns) return; setProvaSel(i); setProvaAns(true); tocarSom(i === provaQuestoes[provaQ].ans ? 'acerto' : 'erro'); if (i === provaQuestoes[provaQ].ans) setProvaAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #16A34A' : errada ? '2px solid #C0392B' : (provaSel === i ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)'), background: correta ? '#E3F3EA' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: provaAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s, border 0.2s' }}><span>{opt}</span>{correta ? <span style={{ flexShrink: 0, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}><Ic e="✓" c={green} /></span> : errada ? <span style={{ flexShrink: 0 }}><Ic e="✗" c="#C0392B" /></span> : null}</button>
                  )
                })}
                {provaAns && provaQuestoes[provaQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}><Ic e="💡" /> {provaQuestoes[provaQ].exp}</div>)}
                <button disabled={!provaAns} onClick={() => { if (provaQ < provaQuestoes.length - 1) { setProvaQ(provaQ + 1); setProvaSel(-1); setProvaAns(false) } else { finalizarProva() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !provaAns ? 'var(--color-background-secondary)' : '#C0392B', color: !provaAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !provaAns ? 'default' : 'pointer' }}>{provaQ < provaQuestoes.length - 1 ? <>Próxima <Ic e="→" /></> : <>Finalizar prova <Ic e="🎯" /></>}</button>
              </div>
            ) : (() => {
              const pct = Math.round(provaAcertos / provaQuestoes.length * 100)
              const corNota = pct >= 80 ? '#16A34A' : pct >= 50 ? '#E08A1E' : '#C0392B'
              const circ = 2 * Math.PI * 52
              return (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Mascote size={64} humor={pct >= 50 ? 'comemora' : 'triste'} /></div>
                {/* Anel de nota */}
                <div style={{ position: 'relative', width: 128, height: 128, margin: '10px auto' }}>
                  <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="52" stroke="var(--color-background-secondary)" strokeWidth="11" fill="none" />
                    <circle cx="64" cy="64" r="52" stroke={corNota} strokeWidth="11" fill="none" strokeLinecap="round" strokeDasharray={`${circ * pct / 100} ${circ}`} transform="rotate(-90 64 64)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{provaAcertos}/{provaQuestoes.length}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: corNota, marginTop: 3 }}>{pct}%</div>
                  </div>
                </div>
                <div style={{ display: 'inline-block', fontSize: 15, color: '#fff', fontWeight: 700, background: 'linear-gradient(135deg,#F5A623,#E08A1E)', padding: '6px 18px', borderRadius: 20, marginTop: 4 }}>+{provaAcertos * 2} XP</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 320, margin: '14px auto 0' }}>{provaAcertos >= 16 ? 'Excelente! Você domina este nível. Que tal subir um nível?' : provaAcertos >= 10 ? 'Bom resultado! Continue praticando para fixar.' : 'Continue estudando as lições deste nível e tente na próxima semana.'}</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
              )
            })()}
          </div>
        </div>
      )}

      {tab === 'pronuncia' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #6A5ACD, #4B3FBF)', padding: '20px 16px 24px' }}>
            <button onClick={() => { if (pronCat) { setPronCat(null) } else { setTab('home') } }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🎤" color={purple} onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Treino de Pronúncia</div></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{pronCat ? 'Leia em voz alta e receba dicas da IA' : 'Escolha um som para treinar'}</div>
          </div>
          <div style={{ padding: 16 }}>
            {!pronCat ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', background: purpleLight, borderRadius: 20, padding: '5px 12px', marginBottom: 2 }}><Ic e="🔄" c={purple} s={14} /><span style={{ fontSize: 12, color: purple, fontWeight: 600 }}>Frases novas todo dia em cada som</span></div>
                {pronCategorias.map((c, idx) => { const pc = ['#2E72D6','#7C3AED','#0EA5A5','#E8590C','#DB2777','#16A34A','#4F46E5','#CA8A04','#0284C7','#DC2626','#C026D3','#0D9488','#EA580C','#4B3FBF','#059669','#B45309'][idx % 16]; return (
                  <div key={c.id} onClick={() => { setPronCat(c.id); setPronIdx(0); setPronHeard(''); setPronScore(null); setPronTip('') }} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', borderLeft: `4px solid ${pc}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 48, height: 48, background: pc + '1A', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e={c.icon} c={pc} s={24} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{c.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{c.desc}</div>
                    </div>
                    <div style={{ fontSize: 18 }}><Ic e="→" c={pc} /></div>
                  </div>
                )})}
              </div>
            ) : (() => {
              const cat = pronCategorias.find(c => c.id === pronCat)!
              // 5 frases do dia sorteadas dentro do som escolhido; o offset por categoria evita que todos os sons rodem igual.
              const fdia = rotaDia(cat.frases, 5, cat.id.split('').reduce((a: number, ch: string) => a + ch.charCodeAt(0), 0))
              const frase = fdia[pronIdx]
              const palavras = frase.en.split(' ')
              const heardSet = pronHeard.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean)
              return (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 14 }}><Ic e={cat.icon} /> {cat.label} · Frase {pronIdx + 1} de {fdia.length} <span style={{ color: purple, fontWeight: 600 }}>· 🔄 muda todo dia</span></div>
                  <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, border: '0.5px solid var(--color-border-tertiary)', padding: 20, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 }}>
                      {palavras.map((w: string, i: number) => {
                        const clean = w.toLowerCase().replace(/[^a-z0-9']/g, '')
                        const sim = pronScore === null ? -1 : melhorSim(clean, heardSet)
                        const cor = pronScore === null ? 'var(--color-text-primary)' : sim >= 0.75 ? '#16A34A' : sim >= 0.5 ? '#E08A1E' : '#C0392B'
                        return <span key={i} style={{ color: cor }}>{w}{i < palavras.length - 1 ? ' ' : ''}</span>
                      })}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{frase.pt}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <button onClick={() => ouvirPron(frase.en)} style={{ flex: 1, padding: 14, background: purpleLight, color: '#3C3489', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}><Ic e="🔊" /> Ouvir</button>
                    <button onClick={() => falarNavegador(frase.en, 0.55)} title="Ouvir bem devagar" style={{ padding: '14px 16px', background: purpleLight, color: '#3C3489', border: 'none', borderRadius: 12, fontSize: 15, cursor: 'pointer', flexShrink: 0 }}><Ic e="🐢" /></button>
                    <button onClick={() => gravarPron(frase.en)} style={{ flex: 1, padding: 14, background: pronListening ? '#C0392B' : purple, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#fff', animation: pronListening ? 'su_pulse 1.2s infinite' : 'none' }}>{pronListening ? <><Ic e="⏹️" /> Parar e avaliar</> : <><Ic e="🎤" /> Falar</>}</button>
                  </div>
                  {pronScore !== null && (
                    <div style={{ background: 'var(--color-background-secondary)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>O microfone entendeu:</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: pronScore >= 80 ? '#16A34A' : pronScore >= 50 ? '#E08A1E' : '#C0392B' }}>{pronScore}%</div>
                      </div>
                      <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-primary)', marginBottom: 12 }}>"{pronHeard || '...'}"</div>
                      {pronScore >= 90 && <div style={{ background: '#E3F3EA', borderRadius: 10, padding: 12, fontSize: 13, color: '#16A34A', fontWeight: 600, textAlign: 'center' }}><Ic e="🎉" /> {pronScore === 100 ? 'Perfeito! Pronúncia certeira!' : 'Muito bom! Quase perfeito!'}</div>}
                      {pronScore >= 70 && pronScore < 90 && <div style={{ background: '#FEF3E2', borderRadius: 10, padding: 12, fontSize: 13, color: '#E08A1E', fontWeight: 600, textAlign: 'center' }}><Ic e="👍" /> Boa! Ajuste as palavras em laranja.</div>}
                      {pronScore < 90 && (() => {
                        // Dica local instantânea: acha a pior palavra e vê se ela tem um som clássico de brasileiro.
                        const pior = palavras.map((w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '')).filter(Boolean)
                          .map((w: string) => ({ w, s: melhorSim(w, heardSet) })).filter((d: any) => d.s < 0.75).sort((a: any, b: any) => a.s - b.s)[0]
                        const som = pior ? SONS_BR.find(p => p.re.test(pior.w)) : null
                        return som ? <div style={{ background: '#FEF3E2', borderRadius: 10, padding: 12, fontSize: 13, color: '#8A5A10', lineHeight: 1.5, marginBottom: 8 }}><Ic e="🇧🇷" /> <b>Na palavra “{pior.w}”:</b> {som.dica}</div> : null
                      })()}
                      {pronLoadingTip && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}><Ic e="💡" /> Analisando sua pronúncia...</div>}
                      {pronTip && <div style={{ background: purpleLight, borderRadius: 10, padding: 12, fontSize: 13, color: '#3C3489', lineHeight: 1.5 }}><Ic e="💡" /> {pronTip}</div>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button disabled={pronIdx === 0} onClick={() => { setPronIdx(pronIdx - 1); setPronHeard(''); setPronScore(null); setPronTip('') }} style={{ flex: 1, padding: 13, background: 'var(--color-background-secondary)', color: pronIdx === 0 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: pronIdx === 0 ? 'default' : 'pointer' }}><Ic e="←" /> Anterior</button>
                    <button onClick={() => { if (pronIdx < fdia.length - 1) { setPronIdx(pronIdx + 1); setPronHeard(''); setPronScore(null); setPronTip('') } else { setPronCat(null) } }} style={{ flex: 1, padding: 13, background: purple, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{pronIdx < fdia.length - 1 ? <>Próxima <Ic e="→" /></> : <>Concluir <Ic e="✓" /></>}</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {tab === 'desafio' && (
        <div>
          <div style={{ background: `linear-gradient(135deg, #F5A623, #E08A1E)`, padding: '20px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🔥" color="#E08A1E" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Desafio do Dia</div></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Acerte tudo e mantenha seu streak vivo</div>
          </div>
          <div style={{ padding: 16 }}>
            {desafioQuestions.length < 5 ? (
              <div>
                <Skel h={14} w={120} r={8} mb={14} />
                <Skel h={54} r={14} mb={12} />
                <Skel h={54} r={14} mb={12} />
                <Skel h={54} r={14} mb={12} />
                <Skel h={54} r={14} />
              </div>
            ) : !desResult ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Pergunta {desQ + 1} de 5</div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#F5A623', height: '100%', width: `${desQ / 5 * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {desafioQuestions[desQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #F5A623', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{desafioQuestions[desQ].ctx}</div>) : null}
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4, position: 'relative' }}>
                  {desafioQuestions[desQ].q}
                  {desAns && desSel === desafioQuestions[desQ].ans && (
                    <div style={{ position: 'absolute', top: -10, right: -4, pointerEvents: 'none' }}>
                      {['#16A34A', '#4ADE80', '#F5A623', '#2E72D6', '#DB2777', '#7C3AED'].map((cor, i) => (
                        <span key={i} style={{ position: 'absolute', top: 0, right: i * 10, width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1 + (i % 3) * 0.25}s ease-in ${(i % 4) * 0.05}s forwards` }} />
                      ))}
                    </div>
                  )}
                </div>
                {desAns && (
                  <div style={{ textAlign: 'center', marginBottom: 12, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                    {desSel === desafioQuestions[desQ].ans ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E3F3EA', color: '#16A34A', fontSize: 15, fontWeight: 700, padding: '8px 18px', borderRadius: 24 }}><span style={{ animation: 'su_bounce 0.6s ease' }}>🎉</span> Acertou! <Ic e="✓" c={green} /></span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FBEAE8', color: '#C0392B', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 24 }}>Quase! A resposta certa está em verde 👇</span>
                    )}
                  </div>
                )}
                {desafioQuestions[desQ].opts.map((opt: string, i: number) => {
                  const correta = desAns && i === desafioQuestions[desQ].ans
                  const errada = desAns && i === desSel && i !== desafioQuestions[desQ].ans
                  return (
                    <button key={i} onClick={() => { if (desAns) return; setDesSel(i); setDesAns(true); tocarSom(i === desafioQuestions[desQ].ans ? 'acerto' : 'erro'); if (i === desafioQuestions[desQ].ans) setDesAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #16A34A' : errada ? '2px solid #C0392B' : (desSel === i ? '2px solid #F5A623' : '1px solid var(--color-border-tertiary)'), background: correta ? '#E3F3EA' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: desAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s, border 0.2s' }}><span>{opt}</span>{correta ? <span style={{ flexShrink: 0, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}><Ic e="✓" c={green} /></span> : errada ? <span style={{ flexShrink: 0 }}><Ic e="✗" c="#C0392B" /></span> : null}</button>
                  )
                })}
                {desAns && desafioQuestions[desQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}><Ic e="💡" /> {desafioQuestions[desQ].exp}</div>)}
                <button disabled={!desAns} onClick={() => { if (desQ < 4) { setDesQ(desQ + 1); setDesSel(-1); setDesAns(false) } else { finalizarDesafio() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !desAns ? 'var(--color-background-secondary)' : '#F5A623', color: !desAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !desAns ? 'default' : 'pointer' }}>{desQ < 4 ? <>Próxima <Ic e="→" /></> : <>Ver resultado <Ic e="🎯" /></>}</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 56 }}><Ic e={desAcertos === 5 ? '🏆' : desAcertos >= 3 ? '🎉' : '💪'} /></div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>Você acertou {desAcertos}/5</div>
                <div style={{ fontSize: 16, color: '#E08A1E', fontWeight: 700, marginTop: 6 }}>+{desAcertos * 5} XP <Ic e="🔥" /></div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 300, margin: '14px auto 0' }}>{desAcertos === 5 ? <>Perfeito! Você está afiado hoje. <Ic e="🌟" /></> : 'Bom trabalho! Volte amanhã para manter seu streak vivo.'}</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'historias' && (() => {
        const h = HISTORIAS.find(x => x.id === histSel)
        if (!h) {
          return (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', padding: '20px 16px 24px' }}>
                <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📖" color="#4C1D95" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Histórias</div></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Mini-novelas com áudio: leia, ouça e responda · {histDone.length}/{HISTORIAS.length} concluídas</div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HISTORIAS.map(ht => {
                  const feita = histDone.includes(ht.id)
                  const nc = ht.nivel.startsWith('A') ? '#16A34A' : '#2E72D6'
                  return (
                    <div key={ht.id} onClick={() => abrirHistoria(ht.id)} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderLeft: `4px solid ${feita ? '#16A34A' : '#7C3AED'}`, borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: 30, flexShrink: 0 }}>{ht.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{ht.titulo}</div>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: nc, background: nc + '1A', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>{ht.nivel}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>{ht.desc}</div>
                      </div>
                      {feita ? <Ic e="✓" c="#16A34A" s={20} /> : <Ic e="→" c="#7C3AED" s={18} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        const reveladas = h.linhas.slice(0, histPos)
        const qPendIdx = h.qs.findIndex((qq, qi) => qq.after === histPos - 1 && histAns[qi] === undefined)
        const qPend = qPendIdx >= 0 ? h.qs[qPendIdx] : null
        const acabou = histPos >= h.linhas.length && h.qs.every((_, qi) => histAns[qi] !== undefined)
        const acertos = h.qs.filter((qq, qi) => histAns[qi] === qq.ans).length
        return (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', padding: '16px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setHistSel(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0 }}><Ic e="←" /></button>
                <div style={{ fontSize: 24 }}>{h.icon}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{h.titulo}</div></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 12 }}>{h.nivel}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 6, height: 6, overflow: 'hidden', marginTop: 10 }}><div style={{ background: '#C4B5FD', height: '100%', width: `${Math.round(histPos / h.linhas.length * 100)}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Toque numa frase para ver a tradução · toque no 🔊 para ouvir de novo</div>
              {reveladas.map((l, i) => (
                l.who === '' ? (
                  <div key={i} onClick={() => setHistPt(p => ({ ...p, [i]: !p[i] }))} style={{ textAlign: 'center', padding: '4px 18px', cursor: 'pointer', animation: i === histPos - 1 ? 'su_fade 0.4s ease' : 'none' }}>
                    <div style={{ fontSize: 13.5, fontStyle: 'italic', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{l.en}</div>
                    {histPt[i] && <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 3 }}>{l.pt}</div>}
                  </div>
                ) : (
                  <div key={i} style={{ maxWidth: '92%', alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end', animation: i === histPos - 1 ? 'su_fade 0.4s ease' : 'none' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#7C3AED', marginBottom: 3, marginLeft: 4 }}>{l.who}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                      <div onClick={() => setHistPt(p => ({ ...p, [i]: !p[i] }))} style={{ padding: '10px 14px', borderRadius: i % 2 === 0 ? '14px 14px 14px 4px' : '14px 14px 4px 14px', fontSize: 14.5, lineHeight: 1.55, background: i % 2 === 0 ? 'var(--color-background-primary)' : '#EEEDFE', color: 'var(--color-text-primary)', border: '0.5px solid var(--color-border-tertiary)', cursor: 'pointer' }}>
                        {l.en}
                        {histPt[i] && <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 5, borderTop: '0.5px dashed #C4B5FD', paddingTop: 5 }}>{l.pt}</div>}
                      </div>
                      <button onClick={() => speakEN(l.en, 9500 + i)} aria-label="Ouvir frase" style={{ width: 28, height: 28, borderRadius: '50%', background: speakingId === 9500 + i ? '#7C3AED' : '#EEEDFE', color: speakingId === 9500 + i ? '#fff' : '#7C3AED', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="🔊" s={13} c={speakingId === 9500 + i ? '#fff' : '#7C3AED'} /></button>
                    </div>
                  </div>
                )
              ))}
              {qPend && (
                <div style={{ background: '#FEF3E2', borderRadius: 14, padding: 14, animation: 'su_fade 0.4s ease' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', marginBottom: 6 }}>🤔 ENTENDEU A HISTÓRIA?</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#16212c', marginBottom: 10 }}>{qPend.q}</div>
                  {qPend.opts.map((o, oi) => (
                    <button key={oi} onClick={() => { setHistAns(a => ({ ...a, [qPendIdx]: oi })); tocarSom(oi === qPend.ans ? 'acerto' : 'erro') }} style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 8, borderRadius: 10, border: '1px solid #F5D9A8', background: '#fff', color: '#16212c', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
                  ))}
                </div>
              )}
              {!qPend && h.qs.map((qq, qi) => (histAns[qi] !== undefined && qq.after === histPos - 1) ? (
                <div key={'fb' + qi} style={{ background: histAns[qi] === qq.ans ? '#E3F3EA' : '#FCEBEB', borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 1.5, color: histAns[qi] === qq.ans ? '#27500A' : '#791F1F' }}>
                  {histAns[qi] === qq.ans ? '✅ Isso!' : `❌ Era: "${qq.opts[qq.ans]}".`} <span style={{ color: '#5c6b7a' }}>{qq.exp}</span>
                </div>
              ) : null)}
              {!qPend && !acabou && (
                <button onClick={() => { const prox = h.linhas[histPos]; setHistPos(p => p + 1); if (prox) speakEN(prox.en, 9500 + histPos) }} style={{ width: '100%', padding: 14, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>Continuar <Ic e="→" /></button>
              )}
              {acabou && !histFim && (
                <button onClick={() => finalizarHistoria(h, acertos)} style={{ width: '100%', padding: 14, background: '#16A34A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>Concluir história <Ic e="🎯" /></button>
              )}
              {histFim && (
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                  <div style={{ fontSize: 50 }}>{acertos === h.qs.length ? '🏆' : '🎉'}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 6 }}>Fim! Você entendeu {acertos}/{h.qs.length}</div>
                  <div style={{ fontSize: 15, color: '#7C3AED', fontWeight: 700, marginTop: 4 }}>+{10 + acertos * 5} XP · +10 🪙</div>
                  <button onClick={() => setHistSel(null)} style={{ width: '100%', padding: 14, marginTop: 16, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Outras histórias <Ic e="→" /></button>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {tab === 'errbr' && (() => {
        const qs = rotaDia(ERROS_BR, 5, 77).map(e => ({ ...e, ...embaralharQ({ q: e.q, opts: e.opts, ans: e.ans, exp: e.exp }) }))
        const atual = qs[errQ]
        return (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #B45309)', padding: '20px 16px 24px' }}>
              <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ fontSize: 30 }}>🇧🇷</div><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Caça-Erros do Brasileiro</div></div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>As armadilhas clássicas de quem fala português — 5 novas por dia</div>
            </div>
            <div style={{ padding: 16 }}>
              {!errResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Armadilha {errQ + 1} de {qs.length}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#E1F5EE', padding: '3px 10px', borderRadius: 12 }}>{atual.cat}</span>
                  </div>
                  <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#059669', height: '100%', width: `${errQ / qs.length * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{atual.q}</div>
                  {atual.opts.map((opt: string, i: number) => {
                    const correta = errAns && i === atual.ans
                    const errada = errAns && i === errSel && i !== atual.ans
                    return (
                      <button key={i} onClick={() => { if (errAns) return; setErrSel(i); setErrAns(true); tocarSom(i === atual.ans ? 'acerto' : 'erro'); if (i === atual.ans) setErrAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #16A34A' : errada ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)', background: correta ? '#E3F3EA' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: errAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}><span>{opt}</span>{correta ? <Ic e="✓" c={green} /> : errada ? <Ic e="✗" c="#C0392B" /> : null}</button>
                    )
                  })}
                  {errAns && (<div style={{ background: '#FEF3E2', borderRadius: 12, padding: 13, marginBottom: 12, fontSize: 13, color: '#8A5A10', lineHeight: 1.55 }}><Ic e="🇧🇷" /> {atual.exp}</div>)}
                  {errAns && textoEmIngles(atual.opts[atual.ans]) && (
                    <button onClick={() => speakEN(atual.opts[atual.ans], 9200 + errQ)} style={{ width: '100%', padding: 11, background: '#E1F5EE', color: '#0F6E56', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}><Ic e="🔊" /> Ouvir a forma certa</button>
                  )}
                  <button disabled={!errAns} onClick={() => { if (errQ < qs.length - 1) { setErrQ(errQ + 1); setErrSel(-1); setErrAns(false) } else { finalizarErrosBr() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !errAns ? 'var(--color-background-secondary)' : '#059669', color: !errAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !errAns ? 'default' : 'pointer' }}>{errQ < qs.length - 1 ? <>Próxima <Ic e="→" /></> : <>Ver resultado <Ic e="🎯" /></>}</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 12 }}>
                  <div style={{ fontSize: 56 }}>{errAcertos === qs.length ? '🏆' : errAcertos >= 3 ? '🎉' : '💪'}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>Você escapou de {errAcertos}/{qs.length} armadilhas</div>
                  <div style={{ fontSize: 16, color: '#059669', fontWeight: 700, marginTop: 6 }}>+{errAcertos * 5} XP · +{5 + errAcertos} 🪙</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 300, margin: '14px auto 0' }}>{errAcertos === qs.length ? 'Perfeito! Nenhuma armadilha te pegou hoje. 🌟' : 'Essas pegadinhas derrubam até quem é avançado. Amanhã tem 5 novas!'}</div>
                  <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {tab === 'revisao' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #16A34A, #0F7A38)', padding: '20px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🧠" color="#0F7A38" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Revisão Inteligente</div></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Relembre o que você aprendeu, na hora certa de fixar</div>
          </div>
          <div style={{ padding: 16 }}>
            {revisaoQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30 }}>
                <div style={{ fontSize: 48 }}><Ic e="✅" /></div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 10 }}>Nada para revisar agora!</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5, maxWidth: 300, margin: '6px auto 0' }}>Conclua lições e elas voltam aqui nos dias certos para você não esquecer.</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            ) : !revResult ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Revisão {revQ + 1} de {revisaoQuestions.length}</div>
                  {revisaoQuestions[revQ]._erro && <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309', background: '#FEF3E2', padding: '3px 10px', borderRadius: 12 }}>🎯 Você errou essa — hora da revanche</span>}
                </div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#16A34A', height: '100%', width: `${revQ / revisaoQuestions.length * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {revisaoQuestions[revQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #16A34A', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{revisaoQuestions[revQ].ctx}</div>) : null}
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{revisaoQuestions[revQ].q}</div>
                {revisaoQuestions[revQ].opts.map((opt: string, i: number) => {
                  const correta = revAns && i === revisaoQuestions[revQ].ans
                  const errada = revAns && i === revSel && i !== revisaoQuestions[revQ].ans
                  return (
                    <button key={i} onClick={() => { if (revAns) return; setRevSel(i); setRevAns(true); const ok = i === revisaoQuestions[revQ].ans; if (ok) setRevAcertos(a => a + 1); tocarSom(ok ? 'acerto' : 'erro'); if (revisaoQuestions[revQ]._erro) resolverErroQ(revisaoQuestions[revQ].q, ok) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #16A34A' : errada ? '2px solid #C0392B' : (revSel === i ? '2px solid #16A34A' : '1px solid var(--color-border-tertiary)'), background: correta ? '#E3F3EA' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: revAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400 }}>{opt}{correta ? <> <Ic e="✓" /></> : errada ? <> <Ic e="✗" /></> : ''}</button>
                  )
                })}
                {revAns && revisaoQuestions[revQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}><Ic e="💡" /> {revisaoQuestions[revQ].exp}</div>)}
                <button disabled={!revAns} onClick={() => { if (revQ < revisaoQuestions.length - 1) { setRevQ(revQ + 1); setRevSel(-1); setRevAns(false) } else { finalizarRevisao() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !revAns ? 'var(--color-background-secondary)' : '#16A34A', color: !revAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !revAns ? 'default' : 'pointer' }}>{revQ < revisaoQuestions.length - 1 ? <>Próxima <Ic e="→" /></> : <>Ver resultado <Ic e="🎯" /></>}</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 56 }}><Ic e={revAcertos === revisaoQuestions.length ? '🏆' : revAcertos >= revisaoQuestions.length * 0.6 ? '🎉' : '💪'} /></div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>Você acertou {revAcertos}/{revisaoQuestions.length}</div>
                <div style={{ fontSize: 16, color: '#16A34A', fontWeight: 700, marginTop: 6 }}>+{revAcertos * 3} XP <Ic e="🧠" /></div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 300, margin: '14px auto 0' }}>{revAcertos >= revisaoQuestions.length * 0.6 ? <>Boa! Essas lições vão voltar mais pra frente, mais espaçadas. <Ic e="🌟" /></> : 'Sem problema — vamos revisar isso de novo em breve para fixar de vez.'}</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'nivelamento' && (
        <div>
          <div style={{ background: `linear-gradient(160deg, #2E72D6, ${blueDark})`, padding: '20px 16px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -12, top: 4, opacity: 0.13, pointerEvents: 'none' }}><Ic e="📊" c="#fff" s={108} /></div>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12, position: 'relative' }}><Ic e="←" /></button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', position: 'relative' }}>Teste de Nivelamento</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 4, position: 'relative' }}>Descubra onde começar — leva 2 minutos</div>
            {nivResult === null && <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 6, height: 7, overflow: 'hidden', marginTop: 14, position: 'relative' }}><div style={{ background: '#4ADE80', height: '100%', width: `${Math.round(nivIdx / placementQuestions.length * 100)}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>}
          </div>
          <div style={{ padding: 16 }}>
            {nivResult === null ? (() => {
              const q = placementQuestions[nivIdx]
              const ti: [string, string] = ({ G: ['Gramática', '#2E72D6'], V: ['Vocabulário', '#7C3AED'], L: ['Compreensão', '#0D9488'] } as Record<string, [string, string]>)[q.tipo] || ['Questão', '#2E72D6']
              return (
              <div style={{ animation: 'su_fade 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: blue, fontWeight: 700, background: blueLight, padding: '4px 12px', borderRadius: 20 }}>Pergunta {nivIdx + 1} de {placementQuestions.length}</span>
                  <span style={{ fontSize: 11, color: ti[1], fontWeight: 700, background: ti[1] + '1A', padding: '4px 11px', borderRadius: 20 }}>{ti[0]}</span>
                </div>
                {q.ctx && (
                  <div style={{ background: blueLight, borderLeft: `3px solid ${blue}`, borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 14, color: blueDark, lineHeight: 1.5, fontStyle: 'italic' }}>{q.ctx}</div>
                )}
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4, position: 'relative' }}>
                  {q.q}
                  {nivAns && nivSel === q.ans && (
                    <div style={{ position: 'absolute', top: -10, right: -4, display: 'flex', gap: 3, pointerEvents: 'none' }}>
                      {['#16A34A', '#4ADE80', '#F5A623', '#2E72D6', '#DB2777', '#7C3AED'].map((cor, i) => (
                        <span key={i} style={{ position: 'absolute', top: 0, right: i * 10, width: 8, height: 8, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1 + (i % 3) * 0.25}s ease-in ${(i % 4) * 0.05}s forwards` }} />
                      ))}
                    </div>
                  )}
                </div>
                {nivAns && (
                  <div style={{ textAlign: 'center', marginBottom: 12, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                    {nivSel === q.ans ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: greenLight, color: '#16A34A', fontSize: 15, fontWeight: 700, padding: '8px 18px', borderRadius: 24 }}><span style={{ animation: 'su_bounce 0.6s ease' }}>🎉</span> Acertou! <Ic e="✓" c={green} /></span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FCEBEB', color: '#C0392B', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 24 }}>Quase! Veja a resposta certa em verde 👇</span>
                    )}
                  </div>
                )}
                {q.opts.map((opt: string, i: number) => {
                  const acertou = nivAns && i === q.ans
                  const errou = nivAns && i === nivSel && i !== q.ans
                  return (
                  <button key={i} disabled={nivAns} onClick={() => { if (nivAns) return; setNivSel(i); setNivAns(true); tocarSom(i === q.ans ? 'acerto' : 'erro') }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: acertou ? '2px solid #16A34A' : errou ? '2px solid #C0392B' : nivSel === i ? `2px solid ${blue}` : '0.5px solid var(--color-border-tertiary)', background: acertou ? greenLight : errou ? '#FCEBEB' : nivSel === i ? blueLight : 'var(--color-background-primary)', color: acertou ? '#27500A' : errou ? '#791F1F' : 'var(--color-text-primary)', fontSize: 15, cursor: nivAns ? 'default' : 'pointer', fontWeight: (acertou || errou || nivSel === i) ? 600 : 400, boxShadow: (nivAns || nivSel === i) ? 'none' : '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s, border 0.2s' }}><span>{opt}</span>{acertou && <span style={{ flexShrink: 0, animation: 'su_pop 0.4s cubic-bezier(0.16,1,0.3,1)' }}><Ic e="✓" c={green} /></span>}{errou && <span style={{ flexShrink: 0 }}><Ic e="✗" c="#C0392B" /></span>}</button>
                  )
                })}
                <button disabled={!nivAns} onClick={() => {
                  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                  const newScore = [...nivScore]
                  if (nivSel === q.ans) newScore[levels.indexOf(q.lvl)] += 1
                  setNivScore(newScore)
                  if (nivIdx < placementQuestions.length - 1) { setNivIdx(nivIdx + 1); setNivSel(-1); setNivAns(false) }
                  else {
                    let rec = 'C2'
                    for (let i = 0; i < 6; i++) { if (newScore[i] < 3) { rec = levels[i]; break } }
                    setNivResult(rec); setLevel(rec)
                    try { localStorage.setItem('speakup_nivel', rec) } catch (e) {}
                  }
                }} style={{ width: '100%', padding: 15, marginTop: 8, background: !nivAns ? 'var(--color-background-secondary)' : blue, color: !nivAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !nivAns ? 'default' : 'pointer' }}>{nivIdx < placementQuestions.length - 1 ? <>Próxima <Ic e="→" /></> : <>Ver meu nível <Ic e="🎯" /></>}</button>
              </div>
              ) })() : (() => {
              const lc = ['A1', 'A2'].includes(nivResult) ? '#16A34A' : ['B1', 'B2'].includes(nivResult) ? '#2E72D6' : '#7C3AED'
              const nome = ({ A1: 'Iniciante', A2: 'Básico', B1: 'Intermediário', B2: 'Intermediário+', C1: 'Avançado', C2: 'Domínio' } as Record<string, string>)[nivResult]
              return (
              <div style={{ textAlign: 'center', paddingTop: 8, animation: 'su_fade 0.4s ease' }}>
                <div style={{ fontSize: 54, marginBottom: 4, animation: 'su_bounce 0.7s cubic-bezier(0.16,1,0.3,1)' }}><Ic e="🎯" c={lc} /></div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Seu nível recomendado é</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: '50%', background: lc + '18', border: `3px solid ${lc}`, margin: '12px 0 6px', animation: 'su_pop 0.5s ease' }}><span style={{ fontSize: 38, fontWeight: 800, color: lc }}>{nivResult}</span></div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{nome}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lv => { const on = lv === nivResult; const c = ['A1', 'A2'].includes(lv) ? '#16A34A' : ['B1', 'B2'].includes(lv) ? '#2E72D6' : '#7C3AED'; return (
                    <span key={lv} style={{ fontSize: 12.5, fontWeight: on ? 800 : 600, color: on ? '#fff' : 'var(--color-text-secondary)', background: on ? c : 'var(--color-background-secondary)', border: on ? 'none' : '0.5px solid var(--color-border-tertiary)', padding: '7px 11px', borderRadius: 10, transform: on ? 'scale(1.12)' : 'none' }}>{lv}</span>
                  )})}
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 18, lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>Vamos te colocar no ponto certo para evoluir mais rápido. Você pode mudar de nível quando quiser na aba Lições.</div>
                <button onClick={() => setTab('lessons')} style={{ width: '100%', padding: 15, marginTop: 24, background: lc, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: `0 6px 18px ${lc}44` }}>Começar no nível {nivResult} <Ic e="→" /></button>
                <button onClick={() => { setNivIdx(0); setNivScore([0,0,0,0,0,0]); setNivSel(-1); setNivAns(false); setNivResult(null) }} style={{ width: '100%', padding: 13, marginTop: 10, background: 'none', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Refazer teste</button>
              </div>
              ) })()}
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${gold}, #DAA520)`, padding: '28px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><IcBadge e="⭐" color={gold} onDark box={52} size={28} /></div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Vonai Premium</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>Alcance a fluência sem limites</div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>O que você ganha com o Premium:</div>
              {[['🎭', 'Simulações ilimitadas', 'Pratique todos os 12 cenários sem limite diário'], ['🤖', 'Professor IA ilimitado', 'Tire dúvidas sem restrições'], ['📖', 'Todas as lições, do A1 ao C2', 'Centenas de lições, do básico ao avançado'], ['📊', 'Relatório de evolução', 'Acompanhe seu progresso semanal'], ['🎯', 'Trilha personalizada', 'IA monta seu plano de 90 dias'], ['🔓', 'Novos cenários em breve', 'Acesso antecipado a conteúdo novo']].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 5 ? 12 : 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}><Ic e={icon} /></span>
                  <div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div></div>
                  <span style={{ marginLeft: 'auto', fontSize: 16, color: green, flexShrink: 0 }}><Ic e="✓" /></span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: `2px solid ${blue}`, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Plano Mensal</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Cancele quando quiser</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: blue }}>R$29,90</div><div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>/mês</div></div>
              </div>
              <button onClick={() => abrirAssinatura('mensal')} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Assinar mensalmente <Ic e="→" /></button>
            </div>
            <div style={{ background: goldLight, borderRadius: 14, border: `2px solid ${gold}`, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: gold, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderBottomLeftRadius: 10 }}><Ic e="🔥" /> MELHOR OFERTA</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Plano Anual</div><div style={{ fontSize: 12, color: green, marginTop: 2, fontWeight: 500 }}>Economize R$69/ano</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: gold }}>{isIOSNative ? 'R$289,90' : 'R$289,80'}</div><div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>/ano · {isIOSNative ? 'R$24,16' : 'R$24,15'}/mês</div></div>
              </div>
              <button onClick={() => abrirAssinatura('anual')} style={{ width: '100%', padding: 14, background: gold, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Assinar anualmente <Ic e="→" /></button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>{isIOSNative ? 'Pagamento seguro pela App Store · Cancele a qualquer momento' : 'Pagamento seguro via Kiwify · Pix, cartão ou boleto · Cancele a qualquer momento'}</div>
            {isIOSNative && <button onClick={() => (window as any).VonaiNative?.restore?.()} style={{ width: '100%', padding: 12, marginTop: 12, background: 'none', color: blue, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Restaurar compras</button>}
          </div>
        </div>
      )}

      {tab === 'speak' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {!convStarted ? (
            <>
              <div style={{ background: purple, padding: '20px 16px 16px' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Simulador de Conversas</div>
                <div style={{ fontSize: 13, color: '#AFA9EC', marginTop: 2 }}>Pratique situações reais em inglês</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)', borderRadius: 20, padding: '4px 12px', marginTop: 8 }}><Ic e="🔄" c="#fff" s={13} /><span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Cenários em destaque mudam todo dia</span></div>
                {!isPremium && <div style={{ fontSize: 12, color: '#AFA9EC', marginTop: 6 }}>{simulacoesHoje}/{FREE_LIMIT} simulações usadas hoje</div>}
              </div>
              {!isPremium && simulacoesHoje >= FREE_LIMIT && (
                <div onClick={() => setTab('plans')} style={{ margin: 16, background: `linear-gradient(135deg, ${gold}, #DAA520)`, borderRadius: 16, padding: 18, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 30, marginBottom: 6 }}><Ic e="🔥" c="#fff" /></div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Você está pegando o jeito!</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 6, lineHeight: 1.5 }}>Você já fez suas {FREE_LIMIT} conversas de hoje. Vire Premium e pratique sem limites — quantas vezes quiser, todos os dias.</div>
                  <div style={{ display: 'inline-block', marginTop: 14, background: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 24 }}>Conversar sem limites <Ic e="→" /></div>
                </div>
              )}
              <div style={{ padding: 16, flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Escolha um cenário e converse com IA. Você receberá feedback imediato sobre seu inglês.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rotaDia(scenarios, 0, 3).map((s, idx) => {
                    const bloqueado = !isPremium && idx >= FREE_LIMIT
                    const grads = ['linear-gradient(135deg,#6A5ACD,#4B3FBF)', 'linear-gradient(135deg,#2E72D6,#185FA5)', 'linear-gradient(135deg,#16A34A,#0F7A38)', 'linear-gradient(135deg,#E0891E,#C26A0A)', 'linear-gradient(135deg,#DB4A8B,#A83271)', 'linear-gradient(135deg,#0EA5A5,#0B7E7E)', 'linear-gradient(135deg,#EF6C4D,#C74A2E)', 'linear-gradient(135deg,#7C6FE0,#5B43C9)', 'linear-gradient(135deg,#2FA8D6,#1B7FA8)', 'linear-gradient(135deg,#E0A62E,#C2860A)']
                    const g = grads[idx % grads.length]
                    return (
                      <div key={s.id} onClick={() => !bloqueado ? startScenario(s) : setTab('plans')} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: bloqueado ? 0.6 : 1 }}>
                        <div style={{ width: 52, height: 52, background: bloqueado ? '#e8e8e8' : g, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: bloqueado ? 'none' : '0 3px 8px rgba(0,0,0,0.16)' }}><Ic e={bloqueado ? '🔒' : s.icon} c={bloqueado ? undefined : '#fff'} /></div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#5F5E5A', fontWeight: 500, marginBottom: 4 }}><Ic e="💡" /> Dicas:</div>
                      {selectedScenario.tips.map((tip, i) => <div key={i} style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 2 }}>• {tip}</div>)}
                    </div>
                    <button onClick={() => { const novo = !autoVoz; setAutoVoz(novo); try { localStorage.setItem('speakup_autovoz', novo ? '1' : '0') } catch (e) {} }} style={{ flexShrink: 0, background: autoVoz ? purple : 'var(--color-background-primary)', color: autoVoz ? '#fff' : '#5F5E5A', border: autoVoz ? 'none' : '1px solid var(--color-border-tertiary)', borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><Ic e="🔊" c={autoVoz ? '#fff' : '#5F5E5A'} /> Voz {autoVoz ? 'ON' : 'OFF'}</button>
                  </div>
                </div>
              )}
              <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                {convMsgs.map((m, i) => {
                  const parts = m.role === 'ai' ? separaPT(m.text) : { en: m.text, pt: '' }
                  return (
                  <div key={i} style={{ maxWidth: '88%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {m.role === 'ai' && <div style={{ fontSize: 10, color: purple, fontWeight: 500, marginBottom: 4, marginLeft: 2 }}><Ic e={selectedScenario?.icon} /> {selectedScenario?.title}</div>}
                    <div style={{ padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: m.role === 'user' ? purple : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
                      {m.role === 'ai' ? <TextoIA text={parts.en} /> : m.text}
                      {m.role === 'ai' && parts.pt && <div style={{ marginTop: 8, paddingTop: 8, borderTop: '0.5px dashed var(--color-border-tertiary)', fontSize: 12.5, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>🇧🇷 {parts.pt}</div>}
                    </div>
                    {m.role === 'ai' && <button onClick={() => falarIngles(parts.en, i)} style={{ marginTop: 5, marginLeft: 2, background: speakingId === i ? purple : purpleLight, color: speakingId === i ? '#fff' : purple, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === i ? <><Ic e="⏸️" /> Parar</> : <><Ic e="🔊" /> Ouvir</>}</button>}
                  </div>
                  )
                })}
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
        </div>
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
                {fluencyReport.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#16A34A', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#633806', marginBottom: 10 }}><Ic e="📈" /> O que melhorar</div>
                {fluencyReport.improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#854F0B', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: purpleLight, borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#3C3489', fontWeight: 500, lineHeight: 1.5 }}><Ic e="💜" /> {fluencyReport.message}</div>
              </div>
              {!isPremium && (
                <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #2E72D6, #185FA5)', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer' }}>
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

      {tab === 'lessons' && (
        <div>
          <div style={{ background: blue, padding: '20px 16px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Lições</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 2 }}>Sua jornada até a fluência</div>
          </div>
          <div style={{ padding: 16 }}>
            {view === 'levels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([['A1', 'A1 · Iniciante', 'Sobrevivência: o essencial do dia a dia', '#E3F3EA', '#16A34A', '🌱'], ['A2', 'A2 · Básico', 'Cotidiano: passado, futuro, comparar', '#E3F3EA', '#16A34A', '🌿'], ['B1', 'B1 · Intermediário', 'Independência: conversar e opinar', '#E6F1FB', '#185FA5', '💬'], ['B2', 'B2 · Intermediário+', 'Fluência: expressar ideias complexas', '#E6F1FB', '#185FA5', '🗣️'], ['C1', 'C1 · Avançado', 'Proficiência: precisão e nuance', '#EEEDFE', '#534AB7', '🎯'], ['C2', 'C2 · Domínio', 'Nível quase nativo', '#EEEDFE', '#534AB7', '🏆']] as const).map(([l, name, desc, bg, color, icon]) => (
                  <div key={l} onClick={() => { setLevel(l); setView('list') }} style={{ background: 'var(--color-background-primary)', border: level === l ? `1.5px solid ${color}` : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}><Ic e={icon} c={color} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{name}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div></div>
                    {level === l && <div style={{ background: bg, borderRadius: 6, padding: '3px 8px', fontSize: 11, color, fontWeight: 500 }}>Atual</div>}
                  </div>
                ))}
              </div>
            )}
            {view === 'list' && (() => {
              const lvl = lessons[level]
              const nextIdx = lvl.findIndex(l => !licoesConcluidas.includes(l.title))
              const allDone = nextIdx === -1
              const feitasNivel = lvl.filter(l => licoesConcluidas.includes(l.title)).length
              return (
                <div>
                  <button onClick={() => setView('levels')} style={{ background: 'none', border: 'none', color: blue, cursor: 'pointer', marginBottom: 14, fontSize: 14, padding: 0 }}><Ic e="←" /> Voltar</button>
                  <div style={{ background: allDone ? goldLight : metaFeitaHoje ? greenLight : blueLight, borderRadius: 14, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ fontSize: 22 }}><Ic e={allDone ? '🏆' : metaFeitaHoje ? '✅' : '🎯'} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: allDone ? gold : metaFeitaHoje ? green : blue }}>{allDone ? 'Nível concluído!' : metaFeitaHoje ? `Meta de hoje concluída (${LIMITE_DIA_LICOES}/${LIMITE_DIA_LICOES})` : `Lições de hoje · ${licoesHoje}/${LIMITE_DIA_LICOES}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{allDone ? `Você terminou as ${lvl.length} lições deste nível 🎉` : metaFeitaHoje ? 'Volte amanhã para liberar mais — é assim que o aprendizado fixa.' : `Você pode concluir até ${LIMITE_DIA_LICOES} lições por dia.`}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 700, whiteSpace: 'nowrap' }}>{feitasNivel}/{lvl.length}</div>
                  </div>
                  <div>
                    {lvl.map((l, i) => {
                      const done = licoesConcluidas.includes(l.title)
                      const isNext = i === nextIdx
                      const liberada = isNext && !metaFeitaHoje
                      const unlocked = done || liberada
                      const amanha = isNext && metaFeitaHoje
                      const isLast = i === lvl.length - 1
                      const nodeColor = done ? green : liberada ? blue : '#C2C7CE'
                      const nodeBg = done ? greenLight : liberada ? blueLight : 'var(--color-background-secondary)'
                      return (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: nodeBg, border: `2px solid ${nodeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: nodeColor, fontWeight: 700 }}>{done ? <Ic e="✓" /> : unlocked ? (i + 1) : <Ic e="🔒" />}</div>
                            {!isLast && <div style={{ flex: 1, width: 2, background: done ? green : '#E2E5E9', minHeight: 16 }} />}
                          </div>
                          <div onClick={() => { if (!unlocked) return; setLessonIdx(i); setView('explanation') }} style={{ flex: 1, minWidth: 0, marginBottom: 14, background: 'var(--color-background-primary)', border: liberada ? `1.5px solid ${blue}` : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 13, display: 'flex', alignItems: 'center', gap: 11, cursor: unlocked ? 'pointer' : 'default', opacity: unlocked ? 1 : 0.6 }}>
                            <div style={{ width: 40, height: 40, background: done ? greenLight : liberada ? blueLight : 'var(--color-background-secondary)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, filter: unlocked ? 'none' : 'grayscale(1)' }}><Ic e={l.icon} /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{l.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{done ? 'Concluída · toque para revisar' : liberada ? `${l.sub} · ${l.q.length} exercícios` : amanha ? 'Liberada amanhã' : 'Conclua a anterior'}</div>
                            </div>
                            {done ? <span style={{ fontSize: 16 }}><Ic e="✅" /></span> : liberada ? <span style={{ background: blue, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>Começar</span> : <span style={{ fontSize: 15, color: '#C2C7CE', flexShrink: 0 }}><Ic e="🔒" /></span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
            {view === 'explanation' && (
              <div>
                <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: blue, cursor: 'pointer', marginBottom: 14, fontSize: 14, padding: 0 }}><Ic e="←" /> Voltar</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: blueLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}><Ic e={currentLesson.icon} /></div>
                  <div><div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{currentLesson.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{currentLesson.q.length} exercícios</div></div>
                </div>
                <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: blue, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Explicação</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{currentLesson.explanation}</div>
                </div>
                <div style={{ background: '#FAEEDA', borderRadius: 14, padding: 14, marginBottom: 12, display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}><Ic e="💡" /></span>
                  <div style={{ fontSize: 13, color: '#633806', lineHeight: 1.6 }}>{currentLesson.tip}</div>
                </div>
                <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: blue, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Exemplos</div>
                  {currentLesson.examples.map((ex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < currentLesson.examples.length - 1 ? 12 : 0, paddingBottom: i < currentLesson.examples.length - 1 ? 12 : 0, borderBottom: i < currentLesson.examples.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
                      <button onClick={() => speakEN(ex.en, 8500 + i)} aria-label="Ouvir exemplo" style={{ width: 34, height: 34, borderRadius: '50%', background: speakingId === 8500 + i ? blue : blueLight, color: speakingId === 8500 + i ? '#fff' : blue, border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: speakingId === 8500 + i ? 'su_pulse 1.2s infinite' : 'none' }}><Ic e="🔊" s={15} c={speakingId === 8500 + i ? '#fff' : blue} /></button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: blue, marginBottom: 3 }}>{ex.en}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{ex.pt}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setQIdx(0); setAnswered(false); setSelected(-1); setAjudaTxt(null); licaoErrosRef.current = 0; licaoComboRef.current = 0; setView('quiz') }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Começar exercícios <Ic e="→" /></button>
              </div>
            )}
            {view === 'quiz' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setView('explanation')} style={{ width: 36, height: 36, border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--color-text-secondary)', flexShrink: 0 }}><Ic e="←" /></button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>{currentLesson.q.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIdx ? blue : i === qIdx ? '#85B7EB' : 'var(--color-background-secondary)' }} />)}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{currentLesson.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: blue, fontWeight: 500, background: blueLight, padding: '3px 8px', borderRadius: 6 }}>{qIdx + 1}/{currentLesson.q.length}</div>
                </div>
                {currentLesson.q[qIdx].ctx && <div style={{ background: '#F1EFE8', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{currentLesson.q[qIdx].ctx}</div>}
                <div style={{ background: blueLight, borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative' }}>
                  <div style={{ fontSize: 17, fontWeight: 500, color: '#042C53', lineHeight: 1.4 }}>{currentLesson.q[qIdx].q}</div>
                  {answered && selected === currentLesson.q[qIdx].ans && (
                    <div style={{ position: 'absolute', top: -8, right: 6, pointerEvents: 'none' }}>
                      {['#16A34A', '#4ADE80', '#F5A623', '#2E72D6', '#DB2777', '#7C3AED', '#FFD98A', '#E24B4A'].map((cor, ci) => (
                        <span key={ci} style={{ position: 'absolute', top: 0, right: ci * 9, width: 8, height: 8, borderRadius: ci % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1 + (ci % 4) * 0.25}s ease-in ${(ci % 5) * 0.06}s forwards` }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {currentLesson.q[qIdx].opts.map((o, i) => {
                    const isCorrect = answered && i === currentLesson.q[qIdx].ans
                    const isWrong = answered && i === selected && i !== currentLesson.q[qIdx].ans
                    return (
                      <div key={i} onClick={() => answer(i)} style={{ border: isCorrect ? '1.5px solid #639922' : isWrong ? '1.5px solid #E24B4A' : '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: isCorrect ? '#27500A' : isWrong ? '#791F1F' : 'var(--color-text-primary)', background: isCorrect ? greenLight : isWrong ? '#FCEBEB' : 'var(--color-background-primary)', cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {o}
                        {isCorrect && <span style={{ width: 22, height: 22, background: green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}><Ic e="✓" c="#fff" /></span>}
                        {isWrong && <span style={{ width: 22, height: 22, background: '#E24B4A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}><Ic e="✗" c="#fff" /></span>}
                      </div>
                    )
                  })}
                </div>
                {!answered && (
                  <button onClick={pedirAjuda} disabled={ajudaLoading} style={{ width: '100%', padding: '11px', background: '#EEEDFE', color: '#4B3FBF', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: ajudaLoading ? 'default' : 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}><Mascote size={20} prof /> {ajudaLoading ? 'Pensando...' : 'Pedir ajuda ao professor'}</button>
                )}
                {ajudaTxt && !answered && (
                  <div style={{ background: '#EEEDFE', border: '1px solid #D9D6F7', borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', gap: 10 }}>
                    <div style={{ flexShrink: 0 }}><Mascote size={26} prof /></div>
                    <div style={{ fontSize: 13, color: '#3A3273', lineHeight: 1.55 }}>{ajudaTxt}</div>
                  </div>
                )}
                {answered && (
                  <div style={{ background: selected === currentLesson.q[qIdx].ans ? greenLight : '#FCEBEB', borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', gap: 10, animation: 'su_pop 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                    <span style={{ flexShrink: 0 }}><Mascote size={30} humor={selected === currentLesson.q[qIdx].ans ? 'comemora' : 'triste'} /></span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: selected === currentLesson.q[qIdx].ans ? '#27500A' : '#633806', marginBottom: 2 }}>{selected === currentLesson.q[qIdx].ans ? (licaoComboRef.current >= 2 ? <>Correto! <span style={{ background: '#F5A623', color: '#fff', fontWeight: 800, fontSize: 11.5, padding: '2px 9px', borderRadius: 12, marginLeft: 4 }}>🔥 {licaoComboRef.current} seguidas!</span></> : 'Correto!') : 'Quase lá!'}</div>
                      <div style={{ fontSize: 13, color: selected === currentLesson.q[qIdx].ans ? green : '#854F0B', lineHeight: 1.5 }}>{currentLesson.q[qIdx].exp}</div>
                    </div>
                  </div>
                )}
                {answered && <button onClick={nextQ} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Próxima <Ic e="→" /></button>}
              </div>
            )}
            {view === 'build' && (() => {
              const exs = frasesMontaveis(currentLesson?.examples || [])
              const target = (exs[buildIdx]?.en || '').trim()
              const toks = target.split(/\s+/).filter(Boolean)
              const order = (() => { const a = toks.map((_, i) => i); let s = 0; for (let k = 0; k < target.length; k++) s = (s * 31 + target.charCodeAt(k)) >>> 0; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t } return a })()
              const answer = buildPicked.map(i => toks[i]).join(' ')
              const correto = answer === toks.join(' ')
              const cheio = buildPicked.length === toks.length && toks.length > 0
              const ultima = buildIdx >= exs.length - 1
              return (
                <div style={{ animation: 'su_fade 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#6A5ACD', fontWeight: 700, background: '#EEEDFE', padding: '4px 12px', borderRadius: 20 }}><Ic e="🧩" /> Montar a frase · {buildIdx + 1}/{exs.length}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Traduza para o inglês tocando nas palavras na ordem certa:</div>
                  <div style={{ background: blueLight, borderRadius: 12, padding: '13px 15px', marginBottom: 14 }}><div style={{ fontSize: 16, fontWeight: 600, color: blueDark }}>{exs[buildIdx]?.pt}</div></div>
                  <div style={{ minHeight: 54, border: `1.5px dashed ${buildChecked ? (correto ? '#16A34A' : '#E24B4A') : 'var(--color-border-tertiary)'}`, borderRadius: 12, padding: 10, marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start', background: 'var(--color-background-secondary)' }}>
                    {buildPicked.length === 0 && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', alignSelf: 'center' }}>Toque nas palavras abaixo…</span>}
                    {buildPicked.map((i, idx) => (
                      <button key={idx} onClick={() => { if (!buildChecked) setBuildPicked(p => p.filter(x => x !== i)) }} style={{ background: buildChecked ? (correto ? '#E3F3EA' : '#FCEBEB') : 'var(--color-background-primary)', color: buildChecked ? (correto ? '#27500A' : '#791F1F') : 'var(--color-text-primary)', border: `1px solid ${buildChecked ? (correto ? '#97C459' : '#E24B4A') : 'var(--color-border-tertiary)'}`, borderRadius: 10, padding: '7px 12px', fontSize: 15, cursor: buildChecked ? 'default' : 'pointer', fontFamily: 'inherit' }}>{toks[i]}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                    {order.map((i, k) => { const usado = buildPicked.includes(i); return (
                      <button key={k} disabled={usado || buildChecked} onClick={() => setBuildPicked(p => [...p, i])} style={{ background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 10, padding: '9px 13px', fontSize: 15, cursor: usado || buildChecked ? 'default' : 'pointer', opacity: usado ? 0.32 : 1, fontFamily: 'inherit', boxShadow: usado ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>{toks[i]}</button>
                    )})}
                  </div>
                  {buildChecked && (
                    <div style={{ background: correto ? '#E3F3EA' : '#FCEBEB', borderRadius: 12, padding: 13, marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: correto ? '#16A34A' : '#C0392B' }}>{correto ? '✅ Perfeito!' : '❌ Quase!'}</div>
                      {!correto && <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', marginTop: 5 }}>Resposta: <b>{target}</b></div>}
                    </div>
                  )}
                  {!buildChecked ? (
                    <button disabled={!cheio} onClick={() => { setBuildChecked(true); if (answer === toks.join(' ')) { setXp(x => x + 5); setXpFloat(5); setTimeout(() => setXpFloat(0), 850); tocarSom('acerto') } else tocarSom('erro') }} style={{ width: '100%', padding: 14, background: cheio ? '#6A5ACD' : 'var(--color-background-secondary)', color: cheio ? '#fff' : 'var(--color-text-secondary)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: cheio ? 'pointer' : 'default' }}>Verificar</button>
                  ) : (
                    <button onClick={() => { if (!ultima) { setBuildIdx(buildIdx + 1); setBuildPicked([]); setBuildChecked(false) } else { const trad = frasesTraduzir(currentLesson?.examples || []); const dit = frasesDitado(currentLesson?.examples || []); if (trad.length) { setTradIdx(0); setTradInput(''); setTradChecked(false); setView('traduzir') } else if (dit.length) { setDitIdx(0); setDitInput(''); setDitChecked(false); setView('ditado') } else setView('finish') } }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{ultima ? <>Continuar <Ic e="→" /></> : <>Próxima frase <Ic e="→" /></>}</button>
                  )}
                </div>
              )
            })()}
            {view === 'traduzir' && (() => {
              const exs = frasesTraduzir(currentLesson?.examples || [])
              const alvo = (exs[tradIdx]?.en || '').trim()
              const normT = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim()
              const acertou = tradChecked && normT(tradInput) === normT(alvo)
              const ultima = tradIdx >= exs.length - 1
              return (
                <div style={{ animation: 'su_fade 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#B4530A', fontWeight: 700, background: '#FBEEDD', padding: '4px 12px', borderRadius: 20 }}><Ic e="✍️" /> Traduza · {tradIdx + 1}/{exs.length}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Escreva em inglês, de cabeça (sem áudio):</div>
                  <div style={{ background: blueLight, borderRadius: 12, padding: '13px 15px', marginBottom: 14 }}><div style={{ fontSize: 16, fontWeight: 600, color: blueDark }}>{exs[tradIdx]?.pt}</div></div>
                  <textarea value={tradInput} onChange={e => setTradInput(e.target.value)} disabled={tradChecked} rows={2} placeholder="Escreva aqui em inglês..."
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: `1.5px solid ${tradChecked ? (acertou ? '#16A34A' : '#E24B4A') : 'var(--color-border-tertiary)'}`, borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', resize: 'none', marginBottom: 14 }} />
                  {tradChecked && (
                    <div style={{ background: acertou ? '#E3F3EA' : '#FCEBEB', borderRadius: 12, padding: 13, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, marginTop: 2 }}><Mascote size={30} humor={acertou ? 'comemora' : 'triste'} /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: acertou ? '#16A34A' : '#C0392B' }}>{acertou ? '✅ Isso! +5 XP' : '👀 Quase!'}</div>
                        {!acertou && <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', marginTop: 5 }}>Resposta: <b>{alvo}</b></div>}
                        <button onClick={() => speakEN(alvo, 8700 + tradIdx)} style={{ marginTop: 8, background: 'none', border: 'none', color: blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}><Ic e="🔊" /> Ouvir</button>
                      </div>
                    </div>
                  )}
                  {!tradChecked ? (
                    <button disabled={!tradInput.trim()} onClick={() => { setTradChecked(true); if (normT(tradInput) === normT(alvo)) { setXp(x => x + 5); setXpFloat(5); setTimeout(() => setXpFloat(0), 850); tocarSom('acerto') } else tocarSom('erro') }} style={{ width: '100%', padding: 14, background: tradInput.trim() ? '#C2610C' : 'var(--color-background-secondary)', color: tradInput.trim() ? '#fff' : 'var(--color-text-secondary)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: tradInput.trim() ? 'pointer' : 'default' }}>Verificar</button>
                  ) : (
                    <button onClick={() => { if (!ultima) { setTradIdx(tradIdx + 1); setTradInput(''); setTradChecked(false) } else { const dit = frasesDitado(currentLesson?.examples || []); if (dit.length) { setDitIdx(0); setDitInput(''); setDitChecked(false); setView('ditado') } else setView('finish') } }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{ultima ? <>Continuar <Ic e="→" /></> : <>Próxima <Ic e="→" /></>}</button>
                  )}
                </div>
              )
            })()}
            {view === 'ditado' && (() => {
              const exs = frasesDitado(currentLesson?.examples || [])
              const alvo = (exs[ditIdx]?.en || '').trim()
              const normD = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim()
              const acertou = ditChecked && normD(ditInput) === normD(alvo)
              const ultima = ditIdx >= exs.length - 1
              return (
                <div style={{ animation: 'su_fade 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: '#0D9488', fontWeight: 700, background: '#E1F5EE', padding: '4px 12px', borderRadius: 20 }}><Ic e="🎧" /> Ditado · {ditIdx + 1}/{exs.length}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>Toque para ouvir e escreva em inglês o que você entendeu:</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
                    <button onClick={() => speakEN(alvo, 8800 + ditIdx)} style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 30, boxShadow: '0 6px 16px rgba(15,110,86,0.35)', animation: speakingId === 8800 + ditIdx ? 'su_pulse 1.2s infinite' : 'none' }}><Ic e="🔊" c="#fff" s={30} /></button>
                    <button onClick={() => falarNavegador(alvo, 0.55)} title="Ouvir devagar" style={{ width: 52, height: 52, borderRadius: '50%', background: '#E1F5EE', color: '#0F6E56', border: 'none', cursor: 'pointer', fontSize: 20, alignSelf: 'flex-end' }}><Ic e="🐢" /></button>
                  </div>
                  <textarea value={ditInput} onChange={e => setDitInput(e.target.value)} disabled={ditChecked} rows={2} placeholder="Escreva aqui em inglês..."
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: `1.5px solid ${ditChecked ? (acertou ? '#16A34A' : '#E24B4A') : 'var(--color-border-tertiary)'}`, borderRadius: 12, fontSize: 16, fontFamily: 'inherit', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', resize: 'none', marginBottom: 14 }} />
                  {ditChecked && (
                    <div style={{ background: acertou ? '#E3F3EA' : '#FCEBEB', borderRadius: 12, padding: 13, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, marginTop: 2 }}><Mascote size={30} humor={acertou ? 'comemora' : 'triste'} /></span>
                      <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: acertou ? '#16A34A' : '#C0392B' }}>{acertou ? '✅ Ouvido certeiro! +5 XP' : '👂 Quase!'}</div>
                      {!acertou && <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', marginTop: 5 }}>Era: <b>{alvo}</b></div>}
                      <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 4 }}>{exs[ditIdx]?.pt}</div>
                      </div>
                    </div>
                  )}
                  {!ditChecked ? (
                    <button disabled={!ditInput.trim()} onClick={() => { setDitChecked(true); if (normD(ditInput) === normD(alvo)) { setXp(x => x + 5); setXpFloat(5); setTimeout(() => setXpFloat(0), 850); tocarSom('acerto') } else tocarSom('erro') }} style={{ width: '100%', padding: 14, background: ditInput.trim() ? '#0D9488' : 'var(--color-background-secondary)', color: ditInput.trim() ? '#fff' : 'var(--color-text-secondary)', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: ditInput.trim() ? 'pointer' : 'default' }}>Verificar</button>
                  ) : (
                    <button onClick={() => { if (!ultima) { setDitIdx(ditIdx + 1); setDitInput(''); setDitChecked(false) } else setView('finish') }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{ultima ? <>Concluir lição <Ic e="🎯" /></> : <>Próxima <Ic e="→" /></>}</button>
                  )}
                </div>
              )
            })()}
            {view === 'finish' && (
              <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {['#F5A623', '#534AB7', '#16A34A', '#2E72D6', '#E24B4A', '#DAA520', '#16A34A', '#6A5ACD'].map((cor, i) => (
                    <div key={i} style={{ position: 'absolute', top: 0, left: `${8 + i * 11}%`, width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1.4 + (i % 4) * 0.3}s ease-in ${(i % 5) * 0.12}s forwards` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Mascote size={84} humor="comemora" /></div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, animation: 'su_risefade 0.5s ease 0.2s both' }}>Lição concluída!</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 10, animation: 'su_risefade 0.5s ease 0.32s both' }}>Você ganhou</div>
                <div style={{ display: 'inline-block', fontSize: 36, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #F5A623, #E08A1E)', padding: '8px 28px', borderRadius: 30, marginBottom: 24, boxShadow: '0 6px 18px rgba(239,159,39,0.4)', animation: 'su_xppop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' }}>+30 XP</div>
                {!lembretesAtivos && (
                  <div style={{ background: blueLight, borderRadius: 14, padding: 14, marginBottom: 14, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, animation: 'su_risefade 0.5s ease 0.5s both' }}>
                    <div style={{ fontSize: 26, flexShrink: 0 }}><Ic e="🔔" c={blue} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: blueDark }}>Não deixe o fogo apagar</div>
                      <div style={{ fontSize: 12, color: blue, marginTop: 2 }}>Um lembrete por dia para manter sua sequência viva.</div>
                    </div>
                    <button onClick={() => { ativarLembretes(); try { track('lembretes_prompt_finish') } catch (e) {} }} style={{ flexShrink: 0, background: blue, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Ativar</button>
                  </div>
                )}
                <div style={{ animation: 'su_risefade 0.5s ease 0.6s both' }}>
                  <button onClick={async () => {
                    const texto = `Estou aprendendo inglês com um professor de IA no Vonai 🇧🇷 Já concluí ${doneLessons} ${doneLessons === 1 ? 'lição' : 'lições'}${streak > 1 ? ` e estou há ${streak} dias seguidos` : ''}! Vem estudar comigo: https://speakup-dusky.vercel.app`
                    try { track('compartilhou_licao') } catch (e) {}
                    try { if (navigator.share) { await navigator.share({ text: texto }) } else { await navigator.clipboard.writeText(texto); alert('Texto copiado! Cole onde quiser compartilhar. 📋') } } catch (e) {}
                  }} style={{ width: '100%', padding: 13, background: 'var(--color-background-primary)', color: blue, border: `1.5px solid ${blue}`, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit' }}>📣 Compartilhar meu progresso</button>
                </div>
                <div style={{ animation: 'su_risefade 0.5s ease 0.6s both' }}>
                  <button onClick={() => { setView('list'); setAnswered(false); setSelected(-1) }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Continuar aprendendo <Ic e="→" /></button>
                  <button onClick={() => setTab('home')} style={{ width: '100%', padding: 14, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>Voltar ao início</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'dict' && (
        <DictTab dictCat={dictCat} setDictCat={setDictCat} />
      )}

      {tab === 'vocab' && (
        <div style={{ background: 'var(--color-background-secondary)', minHeight: '100vh' }}>
          <div style={{ background: `linear-gradient(135deg, #2E72D6, ${blueDark})`, padding: '20px 16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📚" color={blue} onDark box={36} /><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Vocabulário</div></div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>Toque no card para revelar a tradução</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,255,255,0.18)', padding: '6px 13px', borderRadius: 20 }}>
              <span style={{ fontSize: 14 }}><Ic e="🔄" /></span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Novas palavras toda semana</span>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {[['all', '🗂️ Todos'], ['basic', '👋 Essenciais'], ['travel', '✈️ Viagem'], ['work', '💼 Trabalho'], ['food', '🍽️ Comida'], ['home', '🏠 Casa'], ['verbs', '⚡ Verbos'], ['feelings', '😊 Sentimentos'], ['daily', '📅 Dia a dia'], ['health', '🏥 Saúde'], ['tech', '💻 Tecnologia'], ['shopping', '🛒 Compras'], ['weather', '🌤️ Clima'], ['family', '👨‍👩‍👧 Família'], ['nature', '🌳 Natureza'], ['city', '🏙️ Cidade']].map(([cat, label]) => (
                <button key={cat} onClick={() => setVocabCat(cat)} style={{ padding: '7px 14px', border: vocabCat === cat ? 'none' : '0.5px solid var(--color-border-tertiary)', borderRadius: 20, background: vocabCat === cat ? (catColor[cat] || blue) : 'var(--color-background-primary)', color: vocabCat === cat ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: vocabCat === cat ? 600 : 400 }}><IcLabel label={label} /></button>
              ))}
            </div>
            <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}><Ic e="🧠" /> {vocabDominadas}/{vocab.length} palavras dominadas</div>
                <div style={{ fontSize: 11, color: green, fontWeight: 600 }}>{Math.round(vocabDominadas / vocab.length * 100)}%</div>
              </div>
              <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 7, overflow: 'hidden' }}><div style={{ background: '#639922', height: '100%', width: `${Math.round(vocabDominadas / vocab.length * 100)}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setVocabModo('all')} style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: vocabModo === 'all' ? blue : 'var(--color-background-primary)', color: vocabModo === 'all' ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: vocabModo === 'all' ? 600 : 400, cursor: 'pointer', border: vocabModo === 'all' ? 'none' : '0.5px solid var(--color-border-tertiary)' }}>Todas ({vocabBaseCat.length})</button>
              <button onClick={() => setVocabModo('revisar')} style={{ flex: 1, padding: '8px 0', borderRadius: 10, background: vocabModo === 'revisar' ? '#F5A623' : 'var(--color-background-primary)', color: vocabModo === 'revisar' ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, fontWeight: vocabModo === 'revisar' ? 600 : 400, cursor: 'pointer', border: vocabModo === 'revisar' ? 'none' : '0.5px solid var(--color-border-tertiary)' }}><Ic e="🔁" /> Revisar ({vocabRevisar})</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
              {filteredVocab.map((v, i) => {
                const cc = catColor[v.cat] || blue
                const known = vocabSrs[v.en] === 'sabe'
                const flip = flipped[i]
                const spk = speakingId === 5000 + i
                return (
                <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))} style={{ background: known ? '#F1F8ED' : flip ? cc + '12' : '#fff', border: `1px solid ${known ? '#9BCB6B' : flip ? cc + '4D' : 'var(--color-border-tertiary)'}`, borderLeft: `5px solid ${known ? '#639922' : cc}`, borderRadius: 16, padding: '12px 13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 10.5, background: cc + '1A', color: cc, padding: '3px 9px', borderRadius: 12, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic e={catEmoji[v.cat]} c={cc} s={12} /> {catNome[v.cat]}</span>
                    <button onClick={e => { e.stopPropagation(); speakEN(v.en, 5000 + i) }} style={{ background: spk ? cc : cc + '14', color: spk ? '#fff' : cc, border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: spk ? 'su_pulse 1.2s infinite' : 'none' }}><Ic e="🔊" s={14} /></button>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>{v.en}</div>
                  {flip ? (<><div style={{ color: cc, marginTop: 5, fontSize: 14.5, fontWeight: 700 }}>{v.pt}</div><div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.45, background: cc + '0F', padding: '7px 10px', borderRadius: 10, borderLeft: `2px solid ${cc}66` }}>"{v.ex}"</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button onClick={e => { e.stopPropagation(); marcarVocab(v.en, 'revisar') }} style={{ flex: 1, padding: '7px 0', borderRadius: 9, border: 'none', background: vocabSrs[v.en] === 'revisar' ? '#F5A623' : 'rgba(239,159,39,0.16)', color: vocabSrs[v.en] === 'revisar' ? '#fff' : '#854F0B', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Ic e="🔁" /> Revisar</button>
                    <button onClick={e => { e.stopPropagation(); marcarVocab(v.en, 'sabe') }} style={{ flex: 1, padding: '7px 0', borderRadius: 9, border: 'none', background: known ? '#639922' : 'rgba(99,153,34,0.16)', color: known ? '#fff' : '#27500A', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Ic e="✓" /> Já sei</button>
                  </div></>) : (<div style={{ fontSize: 11, color: cc, marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Toque para ver <Ic e="→" c={cc} s={12} /></div>)}
                </div>
              )})}
            </div>
            {filteredVocab.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}><Ic e="🎉" /></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Tudo dominado por aqui!</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>Você marcou todas as palavras desta categoria como "já sei". Troque de categoria ou volte para "Todas".</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'trilha' && (() => {
        const ordem = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        const nivelInfo: Record<string, { nome: string; cor: string; bg: string }> = { A1: { nome: 'A1 · Iniciante', cor: '#16A34A', bg: '#E3F3EA' }, A2: { nome: 'A2 · Básico', cor: '#16A34A', bg: '#E3F3EA' }, B1: { nome: 'B1 · Intermediário', cor: '#185FA5', bg: '#E6F1FB' }, B2: { nome: 'B2 · Intermediário+', cor: '#185FA5', bg: '#E6F1FB' }, C1: { nome: 'C1 · Avançado', cor: '#534AB7', bg: '#EEEDFE' }, C2: { nome: 'C2 · Domínio', cor: '#534AB7', bg: '#EEEDFE' } }
        let atualLvl: string | null = null, atualIdx = -1
        for (const lv of ordem) { const a = lessons[lv] || []; const idx = a.findIndex(l => !licoesConcluidas.includes(l.title)); if (idx !== -1) { atualLvl = lv; atualIdx = idx; break } }
        const pct = totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0
        return (
          <div style={{ background: 'linear-gradient(180deg, #DFF3D6 0%, #C4E7B6 55%, #AEDDA0 100%)', minHeight: '100vh' }}>
            <div style={{ background: `linear-gradient(135deg, #2E72D6, ${blueDark})`, padding: '20px 16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🗺️" color={blue} onDark box={36} /><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Sua trilha</div></div>
              <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>{doneLessons} de {totalLessons} lições · do A1 ao C2</div>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 6, height: 8, overflow: 'hidden', marginTop: 12 }}><div style={{ background: '#4ADE80', height: '100%', width: `${pct}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
            </div>
            <div style={{ padding: 16 }}>
              {atualLvl === null && <div style={{ textAlign: 'center', padding: '20px 0 28px', color: '#16A34A', fontWeight: 600, fontSize: 15 }}><Ic e="🏆" /> Você concluiu toda a trilha! Parabéns!</div>}
              {ordem.map(lv => {
                const arr = lessons[lv] || []
                if (!arr.length) return null
                const info = nivelInfo[lv]
                const feitasNivel = arr.filter(l => licoesConcluidas.includes(l.title)).length
                return (
                  <div key={lv} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 20px' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border-tertiary)' }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: info.cor, background: info.bg, padding: '6px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>{info.nome} · {feitasNivel}/{arr.length}</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border-tertiary)' }} />
                    </div>
                    {arr.map((l, i) => {
                      const done = licoesConcluidas.includes(l.title)
                      const isAtual = lv === atualLvl && i === atualIdx
                      const liberada = isAtual && !metaFeitaHoje
                      const unlocked = done || liberada
                      const dx = Math.round(Math.sin(i * 0.8) * 58)
                      const base = done ? 'linear-gradient(135deg,#34D06A,#16A34A)' : liberada ? 'linear-gradient(135deg,#3E86E8,#2E72D6)' : '#E4E7EC'
                      const shadow = done ? '#15803D' : liberada ? '#103D77' : '#CBD1DA'
                      const glow = liberada ? ', 0 0 0 6px rgba(46,114,214,0.18)' : done ? ', 0 0 0 5px rgba(22,163,74,0.14)' : ''
                      return (
                        <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                          <div aria-hidden style={{ position: 'absolute', top: 2, [dx > 0 ? 'left' : 'right']: 18, fontSize: 30, opacity: 0.7, pointerEvents: 'none', userSelect: 'none' }}>{['🌳', '🌲', '🌿', '🌸'][i % 4]}</div>
                          <div style={{ transform: `translateX(${dx}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100, position: 'relative', zIndex: 1 }}>
                            {liberada && <div style={{ background: '#fff', border: `2px solid ${blue}`, color: blue, fontSize: 10.5, fontWeight: 700, padding: '3px 11px', borderRadius: 20, marginBottom: 7, boxShadow: '0 2px 6px rgba(0,0,0,0.12)', animation: 'su_bob 1.4s ease-in-out infinite' }}>COMECE!</div>}
                            <div onClick={() => { if (!unlocked) return; setLevel(lv); setLessonIdx(i); setView('explanation'); setTab('lessons') }} style={{ position: 'relative', width: 62, height: 62, borderRadius: '50%', background: base, boxShadow: `0 5px 0 ${shadow}${glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: unlocked ? 'pointer' : 'default', animation: liberada ? 'su_bob 1.4s ease-in-out infinite' : 'none' }}>
                              <Ic e={l.icon} c={unlocked ? '#fff' : '#9AA3AF'} s={27} />
                              {done && <span style={{ position: 'absolute', right: -3, bottom: 0, width: 21, height: 21, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}><Ic e="✓" s={12} c="#16A34A" /></span>}
                              {!unlocked && <span style={{ position: 'absolute', right: -3, bottom: 0, width: 21, height: 21, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}><Ic e="🔒" s={11} c="#9AA3AF" /></span>}
                            </div>
                            <div style={{ fontSize: 10.5, color: unlocked ? '#1C3A24' : '#5B6B60', fontWeight: isAtual ? 700 : 600, marginTop: 8, textAlign: 'center', lineHeight: 1.15, maxWidth: 100, background: 'rgba(255,255,255,0.82)', padding: '3px 8px', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>{l.title}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD98A,#E0A62E)', boxShadow: '0 5px 0 #B9861F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="🏆" s={30} /></div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 8 }}>Fluência C2</div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {tab === 'listening' && (() => {
        // Seleção diária: 12 áudios sorteados por dia (muda à meia-noite), variados entre os níveis.
        const lisDia = rotaDia(listeningExercises, 12)
        const fim = lisIdx >= lisDia.length
        // embaralharQ é determinístico (semente = texto da pergunta), então a alternativa
        // certa varia mas fica estável entre renders — antes a resposta era sempre a "A" (ans:0).
        const ex = embaralharQ(fim ? lisDia[0] : lisDia[lisIdx])
        return (
          <div style={{ background: 'linear-gradient(180deg, #E9F2FB 0%, #D3E7F5 55%, #C1DDF1 100%)', minHeight: '100vh' }}>
            <div style={{ background: `linear-gradient(135deg, #2E72D6, ${blueDark})`, padding: '20px 16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🎧" color={blue} onDark box={36} /><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Listening</div></div>
              <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>Ouça o áudio e entenda o que foi dito</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)', borderRadius: 20, padding: '4px 12px', marginTop: 10 }}><Ic e="🔄" c="#fff" s={13} /><span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Novos áudios todo dia</span></div>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 6, height: 7, overflow: 'hidden', marginTop: 12 }}><div style={{ background: '#4ADE80', height: '100%', width: `${Math.round(Math.min(lisIdx, lisDia.length) / lisDia.length * 100)}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
            </div>
            <div style={{ padding: 16 }}>
              {fim ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}><Ic e="🎧" /></div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Treino concluído!</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>Você acertou <b style={{ color: green }}>{lisScore}</b> de {lisDia.length}.</div>
                  <button onClick={() => { setLisIdx(0); setLisSel(-1); setLisAns(false); setLisScore(0) }} style={{ padding: '12px 28px', background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Treinar de novo <Ic e="🔁" /></button>
                </div>
              ) : (
                <>
                  {(() => { const playing = speakingId === 7000 + lisIdx; const lc = String(ex.nivel).startsWith('A') ? '#16A34A' : String(ex.nivel).startsWith('B') ? '#2E72D6' : '#7C3AED'; return (<>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: blue, fontWeight: 700, background: blueLight, padding: '4px 12px', borderRadius: 20 }}>{lisIdx + 1}/{lisDia.length}</div>
                    <div style={{ fontSize: 11, color: lc, fontWeight: 700, background: lc + '1A', padding: '4px 12px', borderRadius: 20 }}>Nível {ex.nivel}</div>
                  </div>
                  <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 18, padding: '26px 24px', textAlign: 'center', marginBottom: 16, boxShadow: '0 4px 16px rgba(46,114,214,0.12)' }}>
                    <div onClick={() => speakEN(ex.en, 7000 + lisIdx)} style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #2E72D6, #6A5ACD)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 8px 22px rgba(74,63,191,0.35)', animation: playing ? 'su_pulse 1.2s infinite' : 'none' }}>
                      {playing ? (<div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 38 }}>{[0,1,2,3,4].map(b => <span key={b} style={{ width: 5, height: 34, background: '#fff', borderRadius: 3, animation: `su_eq 0.7s ease-in-out ${b * 0.12}s infinite` }} />)}</div>) : <Ic e="🔊" c="#fff" s={38} />}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 14, fontWeight: 500 }}>{lisAns ? 'Ouça de novo se quiser' : 'Toque para ouvir · quantas vezes precisar'}</div>
                    <button onClick={() => falarNavegador(ex.en, 0.55)} style={{ marginTop: 10, background: blueLight, color: blueDark, border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><Ic e="🐢" /> Ouvir devagar</button>
                    {lisAns && <div style={{ marginTop: 16, padding: '13px 15px', background: blueLight, borderRadius: 12, textAlign: 'left', borderLeft: `4px solid ${blue}` }}><div style={{ fontSize: 14.5, fontWeight: 700, color: blueDark }}>"{ex.en}"</div><div style={{ fontSize: 13, color: blue, marginTop: 5 }}>{ex.pt}</div></div>}
                  </div>
                  </>) })()}
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>{ex.q}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {ex.opts.map((o: string, i: number) => {
                      const correct = lisAns && i === ex.ans
                      const wrong = lisAns && i === lisSel && i !== ex.ans
                      return (
                        <div key={i} onClick={() => { if (lisAns) return; setLisSel(i); setLisAns(true); if (i === ex.ans) { setLisScore(s => s + 1); setXp(x => x + 10); tocarSom('acerto') } else tocarSom('erro') }} style={{ border: correct ? '1.5px solid #639922' : wrong ? '1.5px solid #E24B4A' : '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: correct ? '#27500A' : wrong ? '#791F1F' : 'var(--color-text-primary)', background: correct ? greenLight : wrong ? '#FCEBEB' : 'var(--color-background-primary)', cursor: lisAns ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{o}{correct && <span style={{ flexShrink: 0 }}><Ic e="✓" c={green} /></span>}</div>
                      )
                    })}
                  </div>
                  {lisAns && <button onClick={() => { setLisIdx(i => i + 1); setLisSel(-1); setLisAns(false) }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{lisIdx + 1 >= lisDia.length ? 'Ver resultado' : 'Próxima'} <Ic e="→" /></button>}
                </>
              )}
            </div>
          </div>
        )
      })()}

      {tab === 'evolucao' && (() => {
        const dias = Object.keys(hist).sort().slice(-7)
        const maxXp = Math.max(1, ...dias.map(d => hist[d] || 0))
        const ganhas = conquistasDef.filter(c => c.ok).length
        const nvE = nivelDeXp(xp)
        const metaSemanal = metaDiaria * 5
        const semXpAtual = Math.max(0, xp - semBaseRef.current)
        const fluencia = totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0
        const tempoTxt = tempoMin >= 60 ? `${Math.floor(tempoMin / 60)}h${tempoMin % 60 ? ' ' + (tempoMin % 60) + 'min' : ''}` : `${tempoMin}min`
        const metricas = [
          { e: '🧠', v: vocabDominadas, l: 'palavras aprendidas', c: green },
          { e: '⭐', v: nvE.need - nvE.into, l: `XP p/ o nível ${nvE.nivel + 1}`, c: '#B8860B' },
          { e: '🔥', v: streak, l: 'dias consecutivos', c: '#E08A1E' },
          { e: '🎯', v: `${semXpAtual}/${metaSemanal}`, l: 'meta semanal (XP)', c: blue },
          { e: '📈', v: `${fluencia}%`, l: 'fluência estimada', c: purple },
          { e: '⏰', v: tempoTxt, l: 'tempo estudado', c: '#6A5ACD' },
        ]
        return (
          <div style={{ background: 'var(--color-background-secondary)', minHeight: '100vh' }}>
            <div style={{ background: `linear-gradient(135deg, #2E72D6, ${blueDark})`, padding: '20px 16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📈" color={blue} onDark box={36} /><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Sua evolução</div></div>
              <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>Nível {level} · rumo a: {perfilIa.objetivo || OBJETIVO_PADRAO}</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ background: `linear-gradient(135deg, #4B3FBF, #6A5ACD)`, borderRadius: 16, padding: 16, marginBottom: 14, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}><Ic e="⭐" c="#FFD98A" /> Nível {nvE.nivel}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>faltam {nvE.need - nvE.into} XP p/ o nível {nvE.nivel + 1}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 6, height: 9, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg,#FFD98A,#F5A623)', height: '100%', width: `${nvE.pct}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
                <div style={{ fontSize: 12.5, marginTop: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.95)' }}>O cérebro adora progresso. Você já domina <b>{vocabDominadas}</b> {vocabDominadas === 1 ? 'palavra' : 'palavras'} e concluiu <b>{doneLessons}</b> {doneLessons === 1 ? 'lição' : 'lições'}. Continue! <Ic e="🚀" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                {metricas.map((m, i) => (
                  <div key={i} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18 }}><Ic e={m.e} c={m.c} /></div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 3 }}>{m.v}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}><Ic e="📈" c={blue} /> XP nos últimos dias</div>
                {dias.length <= 1 ? (
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Continue estudando! Seu gráfico de evolução aparece conforme você usa o app dia após dia.</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
                    {dias.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{hist[d]}</div>
                        <div style={{ width: '100%', maxWidth: 30, background: i === dias.length - 1 ? blue : '#B5D4F4', borderRadius: 6, height: `${Math.max(6, Math.round((hist[d] || 0) / maxXp * 80))}px` }} />
                        <div style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>{d.slice(8, 10)}/{d.slice(5, 7)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '2px 2px 12px' }}><Ic e="🏅" /> Conquistas · {ganhas}/{conquistasDef.length}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14 }}>
                {(conqExpand ? conquistasDef : conquistasDef.slice(0, 4)).map((c, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 44, height: 44, margin: '0 auto', borderRadius: '50%', background: c.ok ? goldLight : 'var(--color-background-secondary)', border: c.ok ? `1.5px solid ${gold}` : '1px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ filter: c.ok ? 'none' : 'grayscale(1)', opacity: c.ok ? 1 : 0.4 }}><Ic e={c.e} s={21} c={c.ok ? gold : undefined} /></span>
                      {c.ok && <span style={{ position: 'absolute', right: -2, bottom: -2, width: 16, height: 16, borderRadius: '50%', background: '#16A34A', border: '2px solid var(--color-background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="✓" s={9} c="#fff" /></span>}
                    </div>
                    <div style={{ fontSize: 9.5, color: c.ok ? gold : 'var(--color-text-secondary)', fontWeight: c.ok ? 600 : 400, marginTop: 5, lineHeight: 1.15 }}>{c.nome}</div>
                  </div>
                ))}
              </div>
              {conquistasDef.length > 4 && (
                <button onClick={() => setConqExpand(v => !v)} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, color: blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{conqExpand ? 'Ver menos' : `Ver tudo (${conquistasDef.length})`}</button>
              )}
            </div>
          </div>
        )
      })()}

      {tab === 'liga' && (
        <div style={{ background: 'var(--color-background-secondary)', minHeight: '100vh' }}>
          <div style={{ background: 'linear-gradient(135deg, #E0A62E, #B9861F)', padding: '20px 16px 18px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 26 }}>🏆</span><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Liga da semana</div></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 3 }}>Quem mais ganhou XP nesta semana. Zera toda semana!</div>
          </div>
          <div style={{ padding: 16 }}>
            {ligaLoading ? (
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'center', marginBottom: 18 }}>
                  <Skel h={92} w={92} r={16} /><Skel h={116} w={98} r={16} /><Skel h={78} w={92} r={16} />
                </div>
                {[0, 1, 2, 3, 4].map(i => <Skel key={i} h={48} r={12} mb={8} />)}
              </div>
            ) : ligaData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48 }}>🏅</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 10 }}>O ranking está começando!</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5, maxWidth: 300, margin: '6px auto 0' }}>Ganhe XP fazendo lições e desafios para aparecer aqui. Volte em breve!</div>
              </div>
            ) : (
              <div>
                {/* Pódio top 3: 2º · 1º · 3º */}
                {(() => {
                  const top = [ligaData[1], ligaData[0], ligaData[2]]
                  const alturas = [86, 112, 72]
                  const medalhas = ['🥈', '🥇', '🥉']
                  const cores = ['#B4B2A9', '#E0A62E', '#C77B4A']
                  return (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'center', marginBottom: 20, paddingTop: 8 }}>
                      {top.map((u, k) => u ? (
                        <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                          <div style={{ width: 46, height: 46, borderRadius: '50%', background: u.nome === userName ? blue : 'var(--color-background-primary)', border: `2.5px solid ${cores[k]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: u.nome === userName ? '#fff' : cores[k], marginBottom: -12, zIndex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{(u.nome || 'A').charAt(0).toUpperCase()}</div>
                          <div style={{ width: '100%', height: alturas[k], background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '14px 14px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8, boxShadow: '0 3px 10px rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: 20 }}>{medalhas[k]}</div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-text-primary)', maxWidth: 88, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{u.nome || 'Aluno'}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: cores[k] }}>{u.sem_xp} XP</div>
                          </div>
                        </div>
                      ) : <div key={k} style={{ width: 100 }} />)}
                    </div>
                  )
                })()}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ligaData.slice(3).map((u, j) => {
                    const i = j + 3
                    const isMe = u.nome === userName
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: isMe ? blueLight : 'var(--color-background-primary)', border: isMe ? `1.5px solid ${blue}` : '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '11px 14px' }}>
                        <div style={{ width: 26, textAlign: 'center', fontSize: 13, fontWeight: 700, color: isMe ? blue : 'var(--color-text-secondary)' }}>{i + 1}</div>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? blue : 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: isMe ? '#fff' : 'var(--color-text-secondary)', flexShrink: 0 }}>{(u.nome || 'A').charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: isMe ? 700 : 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nome || 'Aluno'}{isMe ? ' (você)' : ''}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#E0A62E', flexShrink: 0 }}>{u.sem_xp} XP</div>
                      </div>
                    )
                  })}
                </div>
                {(() => { const meIdx = ligaData.findIndex(u => u.nome === userName); return meIdx >= 0 && (
                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: 'var(--color-text-secondary)' }}>Você está em <b style={{ color: blue }}>{meIdx + 1}º</b> de {ligaData.length} nesta semana <Ic e="🔥" /></div>
                ) })()}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'linear-gradient(180deg, #F0EEFB 0%, #E6EAFB 60%, #DCE4FA 100%)' }}>
          <div style={{ background: `linear-gradient(135deg, #2E72D6, ${blueDark})`, padding: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => falarIngles('Hi! Ready to practice your English with me?', 9100)} title="Toque para me ouvir" style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', fontSize: 26, animation: 'su_bob 2.2s ease-in-out infinite' }}><Mascote size={32} prof /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>Vô, seu professor de IA</div>
              <div style={{ fontSize: 12, color: '#B5D4F4', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />Online · responde na hora</div>
              {!isPremium && <div style={{ fontSize: 11, color: profBloqueado ? '#FFD98A' : '#B5D4F4', marginTop: 3, fontWeight: profBloqueado ? 600 : 400 }}>{profBloqueado ? '🌟 Limite de hoje atingido — vire Premium p/ conversar sem limite' : `${PROF_LIMIT - profHoje} de ${PROF_LIMIT} mensagens grátis hoje`}</div>}
            </div>
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            {chatMsgs.length <= 1 && (
              <>
                <div style={{ textAlign: 'center', padding: '4px 0 2px' }}>
                  <div onClick={() => falarIngles('Hi! I am here to help you speak English. Ask me anything!', 9100)} title="Toque para me ouvir" style={{ cursor: 'pointer', display: 'inline-block', animation: 'su_bob 2.2s ease-in-out infinite' }}><Mascote size={72} prof humor="feliz" /></div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>Toque no <b>Vô</b> pra me ouvir, ou escolha um tema 👇</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4, justifyContent: 'center' }}>
                  {['Como me apresentar?', 'Since vs for', 'Present Perfect', 'Phrasal verbs'].map(t => (
                    <button key={t} onClick={() => setChatInput(t)} style={{ padding: '8px 14px', border: 'none', borderRadius: 20, background: blueLight, color: blueDark, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>{t}</button>
                  ))}
                </div>
              </>
            )}
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {m.role === 'ai' && <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}><Mascote size={22} prof /></div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ padding: '11px 15px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: m.role === 'user' ? `linear-gradient(135deg, #2E72D6, #185FA5)` : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{m.role === 'ai' ? <TextoIA text={m.text} /> : m.text}</div>
                  {m.role === 'ai' && <button onClick={() => falarIngles(m.text, 1000 + i)} style={{ marginTop: 6, marginLeft: 2, background: speakingId === 1000 + i ? blue : 'var(--color-background-primary)', color: speakingId === 1000 + i ? '#fff' : blue, border: speakingId === 1000 + i ? 'none' : `1px solid ${blueLight}`, borderRadius: 20, padding: '5px 13px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === 1000 + i ? <><Ic e="⏸️" /> Parar</> : <><Ic e="🔊" /> Ouvir em inglês</>}</button>}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', alignItems: 'flex-end' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><Mascote size={22} prof /></div>
                <div style={{ padding: '14px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.2s' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={micChat} style={{ width: 44, height: 44, background: listening ? '#E24B4A' : blueLight, color: listening ? '#fff' : blue, border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: listening ? 'su_pulse 1.2s infinite' : 'none' }}><Ic e={listening ? '⏹️' : '🎤'} /></button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={listening ? '🎙️ Gravando... toque ⏹️ para parar' : 'Digite ou fale...'} style={{ flex: 1, padding: '11px 14px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 22, fontSize: 14, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
            <button onClick={sendChat} disabled={loadingChat} style={{ width: 44, height: 44, background: blue, color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 500, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loadingChat ? 0.5 : 1 }}><Ic e="→" /></button>
          </div>
        </div>
      )}

      </div>

      <div style={{ background: `linear-gradient(180deg, #2A66B0, ${blueDark})`, borderTop: '0.5px solid rgba(255,255,255,0.14)', display: 'flex', padding: '8px 4px calc(8px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        {[['home', '🏠', 'Início'], ['trilha', '🗺️', 'Trilha'], ['speak', '🎭', 'Simular'], ['listening', '🎧', 'Listening'], ['dict', '🔤', 'Dicionário'], ['ai', '🦜', 'Professor']].map(([t, icon, label]) => {
          const ativo = t === 'trilha' ? (tab === 'trilha' || tab === 'lessons') : tab === t
          return (
          <button key={t} onClick={() => { setTab(t); if (t === 'speak') { setConvStarted(false); setSelectedScenario(null) } }} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 10px', borderRadius: 14, background: ativo ? 'rgba(255,255,255,0.16)' : 'transparent', transition: 'background 0.2s' }}>
              <span style={{ fontSize: 18 }}><Ic e={icon} c={ativo ? '#FFD98A' : '#9FC0E8'} /></span>
              <span style={{ fontSize: 9, color: ativo ? '#ffffff' : '#9FC0E8', fontWeight: ativo ? 700 : 500 }}>{label}</span>
            </div>
          </button>
          )
        })}
      </div>
    </div>
    </div>
  )
}
