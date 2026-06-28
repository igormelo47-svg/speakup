'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Question { q: string; ctx: string; opts: string[]; ans: number; exp: string }
interface Lesson { title: string; sub: string; icon: string; done: boolean; explanation: string; tip: string; examples: { en: string; pt: string }[]; q: Question[] }
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
  ]
}

const vocab = [
  { en: 'Hello', pt: 'Olá', ex: 'Hello, how are you?', cat: 'basic' },
  { en: 'Thank you', pt: 'Obrigado(a)', ex: 'Thank you very much!', cat: 'basic' },
  { en: 'Please', pt: 'Por favor', ex: 'Can you help me, please?', cat: 'basic' },
  { en: 'Sorry', pt: 'Desculpe', ex: "Sorry, I don't understand.", cat: 'basic' },
  { en: 'Excuse me', pt: 'Com licença', ex: 'Excuse me, where is the bathroom?', cat: 'basic' },
  { en: 'Yes / No', pt: 'Sim / Não', ex: 'Yes, I understand. No, I do not.', cat: 'basic' },
  { en: 'Airport', pt: 'Aeroporto', ex: 'Where is the airport?', cat: 'travel' },
  { en: 'Hotel', pt: 'Hotel', ex: 'I need a hotel room.', cat: 'travel' },
  { en: 'Passport', pt: 'Passaporte', ex: 'Show me your passport.', cat: 'travel' },
  { en: 'Breakfast', pt: 'Café da manhã', ex: 'Breakfast is included.', cat: 'travel' },
  { en: 'Ticket', pt: 'Passagem / Ingresso', ex: 'I need two tickets, please.', cat: 'travel' },
  { en: 'Map', pt: 'Mapa', ex: 'Can I have a map of the city?', cat: 'travel' },
  { en: 'Meeting', pt: 'Reunião', ex: 'We have a meeting at 3pm.', cat: 'work' },
  { en: 'Deadline', pt: 'Prazo final', ex: 'The deadline is Friday.', cat: 'work' },
  { en: 'Report', pt: 'Relatório', ex: 'Send me the report.', cat: 'work' },
  { en: 'Schedule', pt: 'Agenda / Horário', ex: 'Check your schedule.', cat: 'work' },
  { en: 'Presentation', pt: 'Apresentação', ex: 'I will give a presentation.', cat: 'work' },
  { en: 'Contract', pt: 'Contrato', ex: 'Please sign the contract.', cat: 'work' },
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
  { en: 'Happy', pt: 'Feliz', ex: "I am very happy today.", cat: 'feelings' },
  { en: 'Sad', pt: 'Triste', ex: "Why are you sad?", cat: 'feelings' },
  { en: 'Tired', pt: 'Cansado(a)', ex: "I am so tired.", cat: 'feelings' },
  { en: 'Angry', pt: 'Bravo(a)', ex: "Do not be angry.", cat: 'feelings' },
  { en: 'Worried', pt: 'Preocupado(a)', ex: "She is worried about the test.", cat: 'feelings' },
  { en: 'Excited', pt: 'Animado(a)', ex: "I am excited for the trip.", cat: 'feelings' },
  { en: 'Bored', pt: 'Entediado(a)', ex: "The kids are bored.", cat: 'feelings' },
  { en: 'Scared', pt: 'Com medo', ex: "Do not be scared.", cat: 'feelings' },
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
]

const catEmoji: { [k: string]: string } = { basic: '👋', travel: '✈️', work: '💼', food: '🍽️', home: '🏠', verbs: '⚡', feelings: '😊', daily: '📅' }
const catNome: { [k: string]: string } = { basic: 'Essencial', travel: 'Viagem', work: 'Trabalho', food: 'Comida', home: 'Casa', verbs: 'Verbo', feelings: 'Sentimento', daily: 'Dia a dia' }

interface Msg { role: string; text: string }
type ViewType = 'levels' | 'list' | 'explanation' | 'quiz' | 'finish'

const KIWIFY_MENSAL = 'https://pay.kiwify.com.br/YJjrdjl'
const KIWIFY_ANUAL = 'https://pay.kiwify.com.br/E6lqt5q'

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

function DictCard({word}:{word:{en:string;pt:string;pron:string}}) {
  const [img,setImg]=useState<string|null>(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    fetch(`/api/pixabay?q=${encodeURIComponent(word.en)}`)
      .then(r=>r.json()).then(d=>{setImg(d.url);setLoading(false)}).catch(()=>setLoading(false))
  },[word.en])
  function speak(){if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance(word.en);u.lang='en-US';u.rate=0.85;window.speechSynthesis.speak(u)}}
  return(
    <div onClick={speak} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:14,overflow:'hidden',cursor:'pointer'}}>
      <div style={{width:'100%',height:90,background:'#EEEDFE',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        {loading?<div style={{fontSize:28}}>⏳</div>:img?<img src={img} alt={word.en} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{fontSize:32}}>🖼️</div>}
      </div>
      <div style={{padding:'10px 10px 12px'}}>
        <div style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)'}}>{word.en}</div>
        <div style={{fontSize:12,color:'#534AB7',fontWeight:500,marginTop:2}}>{word.pt}</div>
        <div style={{fontSize:11,color:'var(--color-text-secondary)',fontStyle:'italic',marginTop:2}}>{word.pron}</div>
        <button onClick={e=>{e.stopPropagation();speak()}} style={{marginTop:6,background:'#EEEDFE',border:'none',borderRadius:20,padding:'3px 10px',fontSize:11,color:'#534AB7',cursor:'pointer',fontFamily:'inherit'}}>🔊 Ouvir</button>
      </div>
    </div>
  )
}

function DictTab({dictCat,setDictCat}:{dictCat:string;setDictCat:(c:string)=>void}) {
  const [words,setWords]=useState<{en:string;pt:string;pron:string}[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    setLoading(true)
    supabase.from('dicionario').select('en,pt,pron').eq('categoria',dictCat).order('en')
      .then(({data})=>{setWords(data||[]);setLoading(false)})
  },[dictCat])
  return(
    <div>
      <div style={{background:'#534AB7',padding:'20px 16px 16px'}}>
        <div style={{fontSize:18,fontWeight:500,color:'#fff'}}>Dicionário ilustrado</div>
        <div style={{fontSize:13,color:'#AFA9EC',marginTop:2}}>Toque para ouvir a pronúncia</div>
      </div>
      <div style={{padding:16}}>
        <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',paddingBottom:4}}>
          {dictCatList.map(c=>(
            <button key={c.id} onClick={()=>setDictCat(c.id)} style={{padding:'7px 14px',border:dictCat===c.id?'none':'0.5px solid var(--color-border-tertiary)',borderRadius:20,background:dictCat===c.id?'#534AB7':'var(--color-background-primary)',color:dictCat===c.id?'#fff':'var(--color-text-secondary)',fontSize:13,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'inherit'}}>{c.label}</button>
          ))}
        </div>
        {loading?<div style={{textAlign:'center',padding:40,color:'var(--color-text-secondary)'}}>Carregando...</div>:(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {words.map((w,i)=><DictCard key={i} word={w}/>)}
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
]

export default function AppPage() {
  const [tab, setTab] = useState('home')
  const [level, setLevel] = useState('A1')
  const [view, setView] = useState<ViewType>('levels')
  const [lessonIdx, setLessonIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [licoesConcluidas, setLicoesConcluidas] = useState<string[]>([])
  const [isPremium, setIsPremium] = useState(true) // BETA: liberado pra todos. Pra voltar a cobrar, troque true por false

  const tocarSom = (tipo: 'acerto' | 'erro') => {
    try {
      const audio = new Audio(tipo === 'acerto' ? '/acerto.mp3' : '/erro.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch (e) {}
  }
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [vocabCat, setVocabCat] = useState('all')
  const [chatMsgs, setChatMsgs] = useState<Msg[]>([{ role: 'ai', text: 'Olá! Sou seu professor de inglês com IA. Pode me perguntar sobre gramática, vocabulário ou praticar conversação. Como posso ajudar?' }])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [userName, setUserName] = useState('Aluno')
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [convMsgs, setConvMsgs] = useState<ConvMsg[]>([])
  const [convInput, setConvInput] = useState('')
  const [loadingConv, setLoadingConv] = useState(false)
  const [convStarted, setConvStarted] = useState(false)
  const [simulacoesHoje, setSimulacoesHoje] = useState(0)
  const [dictCat, setDictCat] = useState('casa')
  const [fluencyReport, setFluencyReport] = useState<{score:number;strengths:string[];improvements:string[];message:string}|null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(-1)
  const [nivIdx, setNivIdx] = useState(0)
  const [nivScore, setNivScore] = useState<number[]>([0,0,0,0,0,0])
  const [nivSel, setNivSel] = useState(-1)
  const [nivResult, setNivResult] = useState<string | null>(null)
  const [desafioFeito, setDesafioFeito] = useState(false)
  const [desQ, setDesQ] = useState(0)
  const [desSel, setDesSel] = useState(-1)
  const [desAns, setDesAns] = useState(false)
  const [desAcertos, setDesAcertos] = useState(0)
  const [desResult, setDesResult] = useState(false)
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
  const convEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const lessons: Record<string, Lesson[]> = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] }
  const allForCefr = [...baseLessons.beginner, ...baseLessons.intermediate, ...baseLessons.advanced, ...dbLessons.beginner, ...dbLessons.intermediate, ...dbLessons.advanced]
  allForCefr.forEach(l => { const k = cefrByTitle[l.title] || 'A1'; if (lessons[k]) lessons[k].push(l) })

  const totalLessons = Object.values(lessons).flat().length
  const doneLessons = licoesConcluidas.length
  const FREE_LIMIT = 3
  const saudacao = (() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' })()
  const isNovo = xp === 0 && streak === 0 && doneLessons === 0

  const hojeStr = new Date().toISOString().split('T')[0]
  const [xpInicioDia, setXpInicioDia] = useState(0)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('speakup_xpdia')
      if (raw) {
        const [dia, base] = raw.split('|')
        if (dia === hojeStr) { setXpInicioDia(parseInt(base) || 0); return }
      }
      localStorage.setItem('speakup_xpdia', hojeStr + '|' + xp)
      setXpInicioDia(xp)
    } catch (e) {}
  }, [xp === 0])
  const xpHoje = Math.max(0, xp - xpInicioDia)

  Object.values(lessons).flat().forEach(l => { l.done = licoesConcluidas.includes(l.title) })

  useEffect(() => {
    try { const sn = localStorage.getItem('speakup_nivel'); if (sn && lessons[sn]) setLevel(sn) } catch (e) {}
  }, [])

  const desafioPool = Object.values(lessons).flat().flatMap(l => l.q || [])
  const daySeed = new Date().toISOString().split('T')[0].split('-').reduce((a, b) => a + parseInt(b), 0)
  const desafioQuestions: Question[] = (() => {
    if (desafioPool.length < 5) return []
    const idxs: number[] = []
    let k = daySeed % desafioPool.length
    while (idxs.length < 5) { if (!idxs.includes(k)) idxs.push(k); k = (k + 137) % desafioPool.length }
    return idxs.map(i => desafioPool[i])
  })()

  useEffect(() => {
    try { const d = localStorage.getItem('speakup_desafio'); setDesafioFeito(d === new Date().toISOString().split('T')[0]) } catch (e) {}
  }, [])

  function finalizarDesafio() {
    const hoje = new Date().toISOString().split('T')[0]
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let last: string | null = null
    try { last = localStorage.getItem('speakup_desafio') } catch (e) {}
    const novoStreak = last === hoje ? streak : (last === ontem ? streak + 1 : 1)
    const novoXp = xp + desAcertos * 5
    setStreak(novoStreak); setXp(novoXp); setDesafioFeito(true); setDesResult(true)
    try { localStorage.setItem('speakup_desafio', hoje) } catch (e) {}
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, streak: novoStreak, ultima_atividade: hoje, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
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
    const acertos = tw.filter(w => hw.includes(w)).length
    const score = tw.length ? Math.round(acertos / tw.length * 100) : 0
    setPronScore(score)
    if (score < 100) pedirDicaPron(target, heard); else setPronTip('')
  }

  function gravarPron(target: string) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    if (pronListening) { recognitionRef.current?.stop(); return }
    setPronHeard(''); setPronScore(null); setPronTip('')
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1
    let finalText = ''
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '; else interim += t
      }
      setPronHeard((finalText + interim).trim())
    }
    rec.onend = () => { setPronListening(false); const said = finalText.trim(); if (said) avaliarPron(target, said) }
    rec.onerror = () => setPronListening(false)
    recognitionRef.current = rec
    setPronListening(true)
    rec.start()
  }

  async function pedirDicaPron(target: string, heard: string) {
    setPronLoadingTip(true); setPronTip('')
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: 'Você é um coach de pronúncia de inglês para brasileiros. O aluno leu uma frase em voz alta e um reconhecimento de voz captou o que entendeu. Compare a frase-alvo com o que foi reconhecido e dê UMA dica curta (no máximo 2 frases), específica e encorajadora, em português, sobre o som que provavelmente saiu errado (ex: th, r, h aspirado, vogais curtas/longas, terminação -ed ou -s). Foque na palavra que não bateu. Nunca diga que ouviu o áudio, você só tem o texto reconhecido.', messages: [{ role: 'user', content: `Frase-alvo: "${target}"\nReconhecido pelo microfone: "${heard}"` }] }) })
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
    const idxs: number[] = []
    let k = (semanaProva * 31 + 7) % provaPool.length
    while (idxs.length < n) { if (!idxs.includes(k)) idxs.push(k); k = (k + 53) % provaPool.length }
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
    if (userId) supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const nome = data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Aluno'
      setUserName(nome.split(' ')[0])
      setUserId(data.user.id)
      const { data: prog } = await supabase.from('progresso').select('*').eq('user_id', data.user.id).single()
      if (prog) {
        setXp(prog.xp || 0)
        setStreak(prog.streak || 0)
        setLicoesConcluidas(prog.licoes_concluidas || [])
        setIsPremium(true) // BETA: sempre Premium. Pra voltar a cobrar, use: prog.is_premium || false
        setWhatsapp(prog.whatsapp || '')
        if (!prog.email && data.user.email) supabase.from('progresso').update({ email: data.user.email }).eq('user_id', data.user.id)
        const hoje = new Date().toISOString().split('T')[0]
        if (prog.ultima_atividade === hoje) setSimulacoesHoje(prog.simulacoes_hoje || 0)
      } else {
        await supabase.from('progresso').insert({ user_id: data.user.id, xp: 0, streak: 0, licoes_concluidas: [], is_premium: false, simulacoes_hoje: 0, email: data.user.email })
      }
    })
  }, [router])

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
          examples: row.exemplos || [], q: row.questoes || []
        })
      })
      setDbLessons(grupos)
    })
  }, [])

  async function salvarProgresso(novoXp: number, novasLicoes: string[]) {
    if (!userId) return
    await supabase.from('progresso').upsert({ user_id: userId, xp: novoXp, licoes_concluidas: novasLicoes, ultima_atividade: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }

  async function logout() { await supabase.auth.signOut(); router.push('/login') }

  function answer(i: number) {
    if (answered) return
    setAnswered(true); setSelected(i)
    if (i === lessons[level][lessonIdx].q[qIdx].ans) { setXp(x => x + 10); tocarSom('acerto'); const respostaCerta = lessons[level][lessonIdx].q[qIdx].opts[lessons[level][lessonIdx].q[qIdx].ans]; setTimeout(() => { try { const u = new SpeechSynthesisUtterance(respostaCerta); u.lang = 'en-US'; u.rate = 0.9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u) } catch (e) {} }, 450) } else { tocarSom('erro') }
  }

  function nextQ() {
    const qs = lessons[level][lessonIdx].q
    if (qIdx + 1 >= qs.length) {
      const titulo = lessons[level][lessonIdx].title
      const novasLicoes = licoesConcluidas.includes(titulo) ? licoesConcluidas : [...licoesConcluidas, titulo]
      const novoXp = xp + 30
      setLicoesConcluidas(novasLicoes); setXp(novoXp)
      salvarProgresso(novoXp, novasLicoes); setView('finish')
    } else { setQIdx(q => q + 1); setAnswered(false); setSelected(-1) }
  }

  function micChat() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    if (listening) { recognitionRef.current?.stop(); return }
    const base = chatInput ? chatInput + ' ' : ''
    let finalText = ''
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '; else interim += t
      }
      setChatInput((base + finalText + interim).trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  async function sendChat() {
    if (!chatInput.trim() || loadingChat) return
    const msg = chatInput; setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingChat(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: 'Você é um professor de inglês simpático e paciente para brasileiros. Responda sempre em português com exemplos em inglês traduzidos. Máximo 4 linhas por resposta.', messages: [{ role: 'user', content: msg }] }) })
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
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: 'Você avalia a fluência em inglês de um aluno brasileiro com base em uma conversa. Responda APENAS com um objeto JSON válido, sem markdown, sem crases, sem texto antes ou depois. Formato exato: {"score": número de 0 a 100, "strengths": ["ponto forte 1","ponto forte 2","ponto forte 3"], "improvements": ["o que melhorar 1 com exemplo","o que melhorar 2 com exemplo"], "message": "frase curta de incentivo em português"}. Avalie só as falas do Aluno. Seja encorajador mas honesto.', messages: [{ role: 'user', content: `Avalie esta conversa:\n\n${history}` }] }) })
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
    if (!isPremium && simulacoesHoje >= FREE_LIMIT) { setTab('plans'); return }
    setSelectedScenario(scenario); setConvMsgs([{ role: 'ai', text: scenario.opener }]); setConvStarted(true); setConvInput('')
    setSimulacoesHoje(s => s + 1)
  }

  async function sendConvMsg() {
    if (!convInput.trim() || loadingConv || !selectedScenario) return
    const msg = convInput; setConvInput('')
    setConvMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingConv(true)
    try {
      const history = convMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: selectedScenario.systemPrompt, messages: [...history, { role: 'user', content: msg }] }) })
      const data = await res.json()
      setConvMsgs(m => [...m, { role: 'ai', text: data.content?.[0]?.text || 'Could not respond.' }])
    } catch { setConvMsgs(m => [...m, { role: 'ai', text: 'Connection error. Please try again.' }]) }
    setLoadingConv(false)
  }

  const blue = '#185FA5'; const blueDark = '#0C447C'; const blueLight = '#E6F1FB'
  const green = '#3B6D11'; const greenLight = '#EAF3DE'
  const purple = '#534AB7'; const purpleLight = '#EEEDFE'
  const gold = '#B8860B'; const goldLight = '#FFF8E1'
  const semanaVocab = Math.floor(Date.now() / (7 * 86400000))
  const embaralharSemana = (arr: any[]) => { const a = [...arr]; let s = semanaVocab + 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t } return a }
  const filteredVocab = embaralharSemana(vocabCat === 'all' ? vocab : vocab.filter(v => v.cat === vocabCat))
  const currentLesson = lessons[level][lessonIdx]

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: 'var(--color-background-tertiary)', minHeight: '100vh' }}>

      <style>{`
        @keyframes su_fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes su_slide { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes su_pop { 0% { transform: scale(0.4); opacity: 0 } 60% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes su_dot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0) } 30% { opacity: 1; transform: translateY(-4px) } }
        @keyframes su_pulse { 0% { box-shadow: 0 0 0 0 rgba(226,75,74,0.5) } 70% { box-shadow: 0 0 0 9px rgba(226,75,74,0) } 100% { box-shadow: 0 0 0 0 rgba(226,75,74,0) } }
        @keyframes su_bounce { 0% { transform: scale(0) rotate(-15deg); opacity: 0 } 50% { transform: scale(1.3) rotate(8deg) } 70% { transform: scale(0.9) rotate(-4deg) } 100% { transform: scale(1) rotate(0); opacity: 1 } }
        @keyframes su_xppop { 0% { transform: scale(0) translateY(20px); opacity: 0 } 60% { transform: scale(1.2) translateY(0) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes su_confetti { 0% { transform: translateY(-20px) rotate(0); opacity: 1 } 100% { transform: translateY(320px) rotate(420deg); opacity: 0 } }
        @keyframes su_risefade { 0% { transform: translateY(14px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
      `}</style>

      {tab === 'home' && (
        <div>
          <div style={{ background: `linear-gradient(160deg, #2074C0, ${blueDark})`, padding: '20px 16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div><div style={{ fontSize: 13, color: '#B5D4F4' }}>{saudacao},</div><div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{userName} {isPremium && <span style={{ fontSize: 11, background: gold, color: '#fff', padding: '2px 7px', borderRadius: 20, marginLeft: 6 }}>PRO ⭐</span>}</div></div>
              <button onClick={logout} style={{ background: blueDark, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#85B7EB', fontSize: 12, cursor: 'pointer' }}>Sair</button>
            </div>
            {isNovo ? (
              <div style={{ background: blueDark, borderRadius: 14, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Bem-vindo ao SpeakUp! 🎉</div>
                <div style={{ fontSize: 13, color: '#B5D4F4', lineHeight: 1.5, marginBottom: 16 }}>Comece sua primeira lição e ganhe seus primeiros 10 XP. Sua jornada até o inglês fluente começa agora.</div>
                <button onClick={() => setTab('lessons')} style={{ background: '#EF9F27', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Começar agora →</button>
              </div>
            ) : (
            <div style={{ background: blueDark, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: 'rgba(239,159,39,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                <div style={{ fontSize: 30 }}>🔥</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{streak} {streak === 1 ? 'dia' : 'dias'} de sequência</div><div style={{ fontSize: 12, color: '#EF9F27', fontWeight: 600, marginTop: 3 }}>{streak === 0 ? 'Comece hoje a sua sequência!' : 'Continue assim, não quebre a corrente!'}</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>⭐ {xp}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>XP total</div></div>
                <div style={{ width: 1, background: blue }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>📚 {doneLessons}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>Lições feitas</div></div>
                <div style={{ width: 1, background: blue }} />
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>🎯 {level}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>Seu nível</div></div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>📚 Curso concluído: {doneLessons}/{totalLessons} lições</div>
                  <div style={{ fontSize: 11, color: '#85B7EB', fontWeight: 600 }}>{totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0}%</div>
                </div>
                <div style={{ background: blue, borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: '#4ADE80', height: '100%', width: `${totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>🎯 Meta de hoje: {xpHoje}/50 XP</div>
                <div style={{ fontSize: 11, color: xpHoje >= 50 ? '#4ADE80' : '#85B7EB', fontWeight: 600 }}>{xpHoje >= 50 ? 'Concluída! ✓' : `Faltam ${50 - xpHoje}`}</div>
              </div>
              <div style={{ background: blue, borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: xpHoje >= 50 ? '#4ADE80' : '#EF9F27', height: '100%', width: `${Math.min(100, Math.round(xpHoje / 50 * 100))}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
            </div>)}
          </div>
          <div style={{ padding: '16px', marginTop: 8 }}>
            {!isPremium && (
              <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #B8860B, #DAA520)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28 }}>⭐</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Seja Premium ✨</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>IA ilimitada · Conversação por voz · Plano personalizado</div></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>R$19,90/mês →</div>
              </div>
            )}
            <div onClick={() => { if (!desafioFeito) { setDesQ(0); setDesSel(-1); setDesAns(false); setDesAcertos(0); setDesResult(false); setTab('desafio') } }} style={{ background: desafioFeito ? 'linear-gradient(135deg, #2EBD6B, #1B9E54)' : 'linear-gradient(135deg, #EF9F27, #E07B00)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: desafioFeito ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: 'none' }}>
              {desafioFeito ? (<div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 22, color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</span></div>) : (<div style={{ fontSize: 28 }}>🔥</div>)}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{desafioFeito ? 'Desafio concluído!' : 'Desafio do Dia'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{desafioFeito ? 'Volte amanhã para manter seu streak 🔥' : '5 perguntas rápidas · ganhe até 25 XP'}</div>
              </div>
              {!desafioFeito && <div style={{ fontSize: 20, color: '#fff' }}>→</div>}
            </div>
            <div onClick={() => { setNivIdx(0); setNivScore([0,0,0,0,0,0]); setNivSel(-1); setNivResult(null); setTab('nivelamento') }} style={{ background: 'linear-gradient(135deg, #2074C0, #185FA5)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>📊</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Descubra seu nível</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Faça o teste e comece no ponto certo</div></div>
              <div style={{ fontSize: 20, color: '#fff' }}>→</div>
            </div>
            {(() => {
              const proxLicao = lessons[level].find(l => !l.done)
              let passo
              if (streak === 0) {
                passo = { icon: '🔥', titulo: 'Comece sua sequência hoje', sub: 'Faça o Desafio do Dia e acenda seu streak', cor: '#EF9F27', acao: () => { setDesQ(0); setDesSel(-1); setDesAns(false); setDesAcertos(0); setDesResult(false); setTab('desafio') } }
              } else if (xpHoje < 50 && !desafioFeito) {
                passo = { icon: '🎯', titulo: 'Garanta sua meta de hoje', sub: `Faltam ${50 - xpHoje} XP · o Desafio do Dia rende até 25`, cor: '#EF9F27', acao: () => { setDesQ(0); setDesSel(-1); setDesAns(false); setDesAcertos(0); setDesResult(false); setTab('desafio') } }
              } else if (proxLicao) {
                passo = { icon: proxLicao.icon, titulo: proxLicao.title, sub: `Próxima lição · nível ${level}`, cor: blue, acao: () => setTab('lessons') }
              } else {
                passo = { icon: '🎭', titulo: 'Pratique conversação', sub: 'Você concluiu as lições deste nível · fale com a IA', cor: purple, acao: () => setTab('speak') }
              }
              return (
                <div onClick={passo.acao} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, marginBottom: 12, cursor: 'pointer' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>✨ Próximo passo recomendado</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, background: blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{passo.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{passo.titulo}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{passo.sub}</div>
                    </div>
                    <div style={{ width: 36, height: 36, background: passo.cor, border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, color: '#fff' }}>→</div>
                  </div>
                </div>
              )
            })()}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div onClick={() => setTab('speak')} style={{ background: purpleLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🎭</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#3C3489' }}>Simulador</div>
                <div style={{ fontSize: 11, color: purple }}>{isPremium ? `${scenarios.length} cenários` : `${simulacoesHoje}/${FREE_LIMIT} hoje`}</div>
              </div>
              <div onClick={() => setTab('ai')} style={{ background: '#FAEEDA', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🤖</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#633806' }}>Professor IA</div>
                <div style={{ fontSize: 11, color: '#854F0B' }}>Disponível 24h</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div onClick={() => setTab('vocab')} style={{ background: greenLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📚</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#27500A' }}>Vocabulário</div>
                <div style={{ fontSize: 11, color: green }}>{vocab.length} palavras</div>
              </div>
              <div onClick={() => setTab('lessons')} style={{ background: blueLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📖</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: blueDark }}>Lições</div>
                <div style={{ fontSize: 11, color: blue }}>Seu progresso</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div onClick={() => { setWhatsappInput(whatsapp); setZapModal(true) }} style={{ background: '#E7F8EE', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📲</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0B6B3A' }}>WhatsApp</div>
                <div style={{ fontSize: 11, color: '#178B4E' }}>{whatsapp ? 'Cadastrado ✓' : 'Receber dicas'}</div>
              </div>
              <div onClick={() => { setProvaQ(0); setProvaSel(-1); setProvaAns(false); setProvaAcertos(0); setProvaResult(false); setProvaNivelEscolhido(false); setTab('prova') }} style={{ background: '#FDECEC', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📝</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#9B2D2D' }}>Prova Semanal</div>
                <div style={{ fontSize: 11, color: '#C0392B' }}>{provaScoreSemana !== null ? `Nota: ${provaScoreSemana}/20` : '20 questões'}</div>
              </div>
            </div>
            <div onClick={() => { setPronCat(null); setPronIdx(0); setPronHeard(''); setPronScore(null); setPronTip(''); setTab('pronuncia') }} style={{ marginTop: 10, background: 'linear-gradient(135deg, #6A5ACD, #4B3FBF)', borderRadius: 12, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 26 }}>🎤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Treino de Pronúncia</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Fale e receba dicas da IA pra soar nativo 🗣️</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 9px', borderRadius: 20 }}>NOVO</div>
            </div>
          </div>
        </div>
      )}

      {zapModal && (
        <div onClick={() => setZapModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-background-primary)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', maxWidth: 440, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 26 }}>📲</span>
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
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}>←</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>📝 Prova Semanal · {level}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>20 questões do seu nível · muda toda semana</div>
          </div>
          <div style={{ padding: 16 }}>
            {!provaNivelEscolhido ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Qual nível você quer testar?</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>Escolha o nível da sua prova desta semana. Você pode testar qualquer um.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {([['A1', 'A1 · Iniciante'], ['A2', 'A2 · Básico'], ['B1', 'B1 · Intermediário'], ['B2', 'B2 · Intermediário+'], ['C1', 'C1 · Avançado'], ['C2', 'C2 · Domínio']] as const).map(([lv, nome]) => (
                    <button key={lv} onClick={() => { setLevel(lv); setProvaNivelEscolhido(true); setProvaQ(0); setProvaSel(-1); setProvaAns(false); setProvaAcertos(0); setProvaResult(false) }} style={{ width: '100%', textAlign: 'left', padding: 16, borderRadius: 14, border: level === lv ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)', background: level === lv ? '#FDECEC' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{nome}<span style={{ color: '#C0392B', fontSize: 18 }}>→</span></button>
                  ))}
                </div>
              </div>
            ) : provaQuestoes.length < 1 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>Sem questões suficientes neste nível ainda.</div>
            ) : !provaResult ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Questão {provaQ + 1} de {provaQuestoes.length}</div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#C0392B', height: '100%', width: `${provaQ / provaQuestoes.length * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {provaQuestoes[provaQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #C0392B', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{provaQuestoes[provaQ].ctx}</div>) : null}
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{provaQuestoes[provaQ].q}</div>
                {provaQuestoes[provaQ].opts.map((opt: string, i: number) => {
                  const correta = provaAns && i === provaQuestoes[provaQ].ans
                  const errada = provaAns && i === provaSel && i !== provaQuestoes[provaQ].ans
                  return (
                    <button key={i} onClick={() => { if (provaAns) return; setProvaSel(i); setProvaAns(true); if (i === provaQuestoes[provaQ].ans) setProvaAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #3B6D11' : errada ? '2px solid #C0392B' : (provaSel === i ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)'), background: correta ? '#EAF3DE' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: provaAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400 }}>{opt}{correta ? ' ✓' : errada ? ' ✗' : ''}</button>
                  )
                })}
                {provaAns && provaQuestoes[provaQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}>💡 {provaQuestoes[provaQ].exp}</div>)}
                <button disabled={!provaAns} onClick={() => { if (provaQ < provaQuestoes.length - 1) { setProvaQ(provaQ + 1); setProvaSel(-1); setProvaAns(false) } else { finalizarProva() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !provaAns ? 'var(--color-background-secondary)' : '#C0392B', color: !provaAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !provaAns ? 'default' : 'pointer' }}>{provaQ < provaQuestoes.length - 1 ? 'Próxima →' : 'Finalizar prova 🎯'}</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 56 }}>{provaAcertos >= 16 ? '🏆' : provaAcertos >= 12 ? '🎉' : provaAcertos >= 8 ? '💪' : '📚'}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 8 }}>{provaAcertos}/{provaQuestoes.length}</div>
                <div style={{ fontSize: 16, color: '#C0392B', fontWeight: 700, marginTop: 4 }}>{Math.round(provaAcertos / provaQuestoes.length * 100)}% de acerto</div>
                <div style={{ fontSize: 15, color: '#E07B00', fontWeight: 600, marginTop: 8 }}>+{provaAcertos * 2} XP</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 320, margin: '14px auto 0' }}>{provaAcertos >= 16 ? 'Excelente! Você domina este nível. Que tal subir um nível?' : provaAcertos >= 10 ? 'Bom resultado! Continue praticando para fixar.' : 'Continue estudando as lições deste nível e tente na próxima semana.'}</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'pronuncia' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #6A5ACD, #4B3FBF)', padding: '20px 16px 24px' }}>
            <button onClick={() => { if (pronCat) { setPronCat(null) } else { setTab('home') } }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}>←</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>🎤 Treino de Pronúncia</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{pronCat ? 'Leia em voz alta e receba dicas da IA' : 'Escolha um som para treinar'}</div>
          </div>
          <div style={{ padding: 16 }}>
            {!pronCat ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pronCategorias.map(c => (
                  <div key={c.id} onClick={() => { setPronCat(c.id); setPronIdx(0); setPronHeard(''); setPronScore(null); setPronTip('') }} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 48, height: 48, background: purpleLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{c.desc}</div>
                    </div>
                    <div style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>→</div>
                  </div>
                ))}
              </div>
            ) : (() => {
              const cat = pronCategorias.find(c => c.id === pronCat)!
              const frase = cat.frases[pronIdx]
              const palavras = frase.en.split(' ')
              const heardSet = pronHeard.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean)
              return (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 14 }}>{cat.icon} {cat.label} · Frase {pronIdx + 1} de {cat.frases.length}</div>
                  <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, border: '0.5px solid var(--color-border-tertiary)', padding: 20, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 }}>
                      {palavras.map((w: string, i: number) => {
                        const clean = w.toLowerCase().replace(/[^a-z0-9']/g, '')
                        const cor = pronScore === null ? 'var(--color-text-primary)' : (heardSet.includes(clean) ? '#3B6D11' : '#C0392B')
                        return <span key={i} style={{ color: cor }}>{w}{i < palavras.length - 1 ? ' ' : ''}</span>
                      })}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{frase.pt}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <button onClick={() => ouvirPron(frase.en)} style={{ flex: 1, padding: 14, background: purpleLight, color: '#3C3489', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>🔊 Ouvir</button>
                    <button onClick={() => gravarPron(frase.en)} style={{ flex: 1, padding: 14, background: pronListening ? '#C0392B' : purple, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{pronListening ? '⏹️ Parar e avaliar' : '🎤 Falar'}</button>
                  </div>
                  {pronScore !== null && (
                    <div style={{ background: 'var(--color-background-secondary)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>O microfone entendeu:</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: pronScore >= 80 ? '#3B6D11' : pronScore >= 50 ? '#E07B00' : '#C0392B' }}>{pronScore}%</div>
                      </div>
                      <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--color-text-primary)', marginBottom: 12 }}>"{pronHeard || '...'}"</div>
                      {pronScore === 100 && <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 12, fontSize: 13, color: '#3B6D11', fontWeight: 600, textAlign: 'center' }}>🎉 Perfeito! Pronúncia certeira!</div>}
                      {pronLoadingTip && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>💡 Analisando sua pronúncia...</div>}
                      {pronTip && <div style={{ background: purpleLight, borderRadius: 10, padding: 12, fontSize: 13, color: '#3C3489', lineHeight: 1.5 }}>💡 {pronTip}</div>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button disabled={pronIdx === 0} onClick={() => { setPronIdx(pronIdx - 1); setPronHeard(''); setPronScore(null); setPronTip('') }} style={{ flex: 1, padding: 13, background: 'var(--color-background-secondary)', color: pronIdx === 0 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: pronIdx === 0 ? 'default' : 'pointer' }}>← Anterior</button>
                    <button onClick={() => { if (pronIdx < cat.frases.length - 1) { setPronIdx(pronIdx + 1); setPronHeard(''); setPronScore(null); setPronTip('') } else { setPronCat(null) } }} style={{ flex: 1, padding: 13, background: purple, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{pronIdx < cat.frases.length - 1 ? 'Próxima →' : 'Concluir ✓'}</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {tab === 'desafio' && (
        <div>
          <div style={{ background: `linear-gradient(135deg, #EF9F27, #E07B00)`, padding: '20px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}>←</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>🔥 Desafio do Dia</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Acerte tudo e mantenha seu streak vivo</div>
          </div>
          <div style={{ padding: 16 }}>
            {desafioQuestions.length < 5 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>Carregando o desafio de hoje...</div>
            ) : !desResult ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Pergunta {desQ + 1} de 5</div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#EF9F27', height: '100%', width: `${desQ / 5 * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {desafioQuestions[desQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #EF9F27', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{desafioQuestions[desQ].ctx}</div>) : null}
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{desafioQuestions[desQ].q}</div>
                {desafioQuestions[desQ].opts.map((opt: string, i: number) => {
                  const correta = desAns && i === desafioQuestions[desQ].ans
                  const errada = desAns && i === desSel && i !== desafioQuestions[desQ].ans
                  return (
                    <button key={i} onClick={() => { if (desAns) return; setDesSel(i); setDesAns(true); if (i === desafioQuestions[desQ].ans) setDesAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #3B6D11' : errada ? '2px solid #C0392B' : (desSel === i ? '2px solid #EF9F27' : '1px solid var(--color-border-tertiary)'), background: correta ? '#EAF3DE' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: desAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400 }}>{opt}{correta ? ' ✓' : errada ? ' ✗' : ''}</button>
                  )
                })}
                {desAns && desafioQuestions[desQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}>💡 {desafioQuestions[desQ].exp}</div>)}
                <button disabled={!desAns} onClick={() => { if (desQ < 4) { setDesQ(desQ + 1); setDesSel(-1); setDesAns(false) } else { finalizarDesafio() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !desAns ? 'var(--color-background-secondary)' : '#EF9F27', color: !desAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !desAns ? 'default' : 'pointer' }}>{desQ < 4 ? 'Próxima →' : 'Ver resultado 🎯'}</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 56 }}>{desAcertos === 5 ? '🏆' : desAcertos >= 3 ? '🎉' : '💪'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>Você acertou {desAcertos}/5</div>
                <div style={{ fontSize: 16, color: '#E07B00', fontWeight: 700, marginTop: 6 }}>+{desAcertos * 5} XP 🔥</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 300, margin: '14px auto 0' }}>{desAcertos === 5 ? 'Perfeito! Você está afiado hoje. 🌟' : 'Bom trabalho! Volte amanhã para manter seu streak vivo.'}</div>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'nivelamento' && (
        <div>
          <div style={{ background: `linear-gradient(160deg, #2074C0, ${blueDark})`, padding: '20px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}>←</button>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Teste de Nivelamento</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 4 }}>Descubra onde começar — leva 2 minutos</div>
          </div>
          <div style={{ padding: 16 }}>
            {nivResult === null ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Pergunta {nivIdx + 1} de {placementQuestions.length}</div>
                <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: blue, height: '100%', width: `${Math.round((nivIdx) / placementQuestions.length * 100)}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
                {placementQuestions[nivIdx].ctx && (
                  <div style={{ background: 'var(--color-background-secondary)', borderLeft: `3px solid ${blue}`, borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5, fontStyle: 'italic' }}>{placementQuestions[nivIdx].ctx}</div>
                )}
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{placementQuestions[nivIdx].q}</div>
                {placementQuestions[nivIdx].opts.map((opt: string, i: number) => (
                  <button key={i} onClick={() => setNivSel(i)} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: nivSel === i ? `2px solid ${blue}` : '1px solid var(--color-border-tertiary)', background: nivSel === i ? blueLight : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: 'pointer', fontWeight: nivSel === i ? 600 : 400 }}>{opt}</button>
                ))}
                <button disabled={nivSel < 0} onClick={() => {
                  const q = placementQuestions[nivIdx]
                  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
                  const newScore = [...nivScore]
                  if (nivSel === q.ans) newScore[levels.indexOf(q.lvl)] += 1
                  setNivScore(newScore)
                  if (nivIdx < placementQuestions.length - 1) { setNivIdx(nivIdx + 1); setNivSel(-1) }
                  else {
                    let rec = 'C2'
                    for (let i = 0; i < 6; i++) { if (newScore[i] < 3) { rec = levels[i]; break } }
                    setNivResult(rec); setLevel(rec)
                    try { localStorage.setItem('speakup_nivel', rec) } catch (e) {}
                  }
                }} style={{ width: '100%', padding: 15, marginTop: 8, background: nivSel < 0 ? 'var(--color-background-secondary)' : blue, color: nivSel < 0 ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: nivSel < 0 ? 'default' : 'pointer' }}>{nivIdx < placementQuestions.length - 1 ? 'Próxima →' : 'Ver meu nível 🎯'}</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Seu nível recomendado é</div>
                <div style={{ fontSize: 56, fontWeight: 800, color: blue, lineHeight: 1 }}>{nivResult}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 8 }}>{({ A1: 'Iniciante', A2: 'Básico', B1: 'Intermediário', B2: 'Intermediário+', C1: 'Avançado', C2: 'Domínio' } as Record<string, string>)[nivResult]}</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>Vamos te colocar no ponto certo para evoluir mais rápido. Você pode mudar de nível quando quiser na aba Lições.</div>
                <button onClick={() => setTab('lessons')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Começar no nível {nivResult} →</button>
                <button onClick={() => { setNivIdx(0); setNivScore([0,0,0,0,0,0]); setNivSel(-1); setNivResult(null) }} style={{ width: '100%', padding: 13, marginTop: 10, background: 'none', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-tertiary)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>Refazer teste</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div>
          <div style={{ background: `linear-gradient(135deg, ${gold}, #DAA520)`, padding: '28px 16px 24px' }}>
            <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}>←</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>SPEAKUP Premium</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>Alcance a fluência sem limites</div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>O que você ganha com o Premium:</div>
              {[['🎭', 'Simulações ilimitadas', 'Pratique todos os 12 cenários sem limite diário'], ['🤖', 'Professor IA ilimitado', 'Tire dúvidas sem restrições'], ['📖', 'Todas as 47 lições', 'Beginner, Intermediário e Avançado'], ['📊', 'Relatório de evolução', 'Acompanhe seu progresso semanal'], ['🎯', 'Trilha personalizada', 'IA monta seu plano de 90 dias'], ['🔓', 'Novos cenários em breve', 'Acesso antecipado a conteúdo novo']].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 5 ? 12 : 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div></div>
                  <span style={{ marginLeft: 'auto', fontSize: 16, color: green, flexShrink: 0 }}>✓</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: `2px solid ${blue}`, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Plano Mensal</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Cancele quando quiser</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: blue }}>R$19,90</div><div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>/mês</div></div>
              </div>
              <button onClick={() => window.open(KIWIFY_MENSAL, '_blank')} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Assinar mensalmente →</button>
            </div>
            <div style={{ background: goldLight, borderRadius: 14, border: `2px solid ${gold}`, padding: 16, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: gold, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderBottomLeftRadius: 10 }}>🔥 MELHOR OFERTA</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Plano Anual</div><div style={{ fontSize: 12, color: green, marginTop: 2, fontWeight: 500 }}>Economize R$141 por ano</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: gold }}>R$97</div><div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>/ano · R$8,08/mês</div></div>
              </div>
              <button onClick={() => window.open(KIWIFY_ANUAL, '_blank')} style={{ width: '100%', padding: 14, background: gold, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Assinar anualmente →</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>Pagamento seguro via Kiwify · Pix, cartão ou boleto · Cancele a qualquer momento</div>
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
                {!isPremium && <div style={{ fontSize: 12, color: '#AFA9EC', marginTop: 4 }}>{simulacoesHoje}/{FREE_LIMIT} simulações usadas hoje</div>}
              </div>
              {!isPremium && simulacoesHoje >= FREE_LIMIT && (
                <div onClick={() => setTab('plans')} style={{ margin: 16, background: `linear-gradient(135deg, ${gold}, #DAA520)`, borderRadius: 16, padding: 18, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 30, marginBottom: 6 }}>🔥</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Você está pegando o jeito!</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 6, lineHeight: 1.5 }}>Você já fez suas {FREE_LIMIT} conversas de hoje. Vire Premium e pratique sem limites — quantas vezes quiser, todos os dias.</div>
                  <div style={{ display: 'inline-block', marginTop: 14, background: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 24 }}>Conversar sem limites →</div>
                </div>
              )}
              <div style={{ padding: 16, flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>Escolha um cenário e converse com IA. Você receberá feedback imediato sobre seu inglês.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {scenarios.map((s, idx) => {
                    const bloqueado = !isPremium && idx >= FREE_LIMIT
                    return (
                      <div key={s.id} onClick={() => !bloqueado ? startScenario(s) : setTab('plans')} style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: bloqueado ? 0.6 : 1 }}>
                        <div style={{ width: 48, height: 48, background: bloqueado ? '#eee' : purpleLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{bloqueado ? '🔒' : s.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{s.description}</div>
                          <div style={{ marginTop: 6 }}><span style={{ background: bloqueado ? '#eee' : purpleLight, color: bloqueado ? '#999' : purple, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>{bloqueado ? 'Premium' : s.level}</span></div>
                        </div>
                        <span style={{ color: bloqueado ? gold : purple, fontSize: 18 }}>{bloqueado ? '⭐' : '→'}</span>
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
                  <button onClick={() => { setConvStarted(false); setSelectedScenario(null); setConvMsgs([]) }} style={{ background: 'none', border: 'none', color: '#AFA9EC', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
                  <div><div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{selectedScenario?.icon} {selectedScenario?.title}</div><div style={{ fontSize: 12, color: '#AFA9EC' }}>{selectedScenario?.context}</div></div>
                </div>
              </div>
              {selectedScenario && (
                <div style={{ background: '#F1EFE8', padding: '10px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <div style={{ fontSize: 11, color: '#5F5E5A', fontWeight: 500, marginBottom: 4 }}>💡 Dicas:</div>
                  {selectedScenario.tips.map((tip, i) => <div key={i} style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 2 }}>• {tip}</div>)}
                </div>
              )}
              <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                {convMsgs.map((m, i) => (
                  <div key={i} style={{ maxWidth: '88%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {m.role === 'ai' && <div style={{ fontSize: 10, color: purple, fontWeight: 500, marginBottom: 4, marginLeft: 2 }}>{selectedScenario?.icon} {selectedScenario?.title}</div>}
                    <div style={{ padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.6, background: m.role === 'user' ? purple : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>{m.text}</div>
                    {m.role === 'ai' && <button onClick={() => falarIngles(m.text, i)} style={{ marginTop: 5, marginLeft: 2, background: speakingId === i ? purple : purpleLight, color: speakingId === i ? '#fff' : purple, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === i ? '⏸️ Parar' : '🔊 Ouvir'}</button>}
                  </div>
                ))}
                {loadingConv && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>digitando...</div>}
                <div ref={convEndRef} />
              </div>
              <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8 }}>
                <button onClick={() => toggleMic(setConvInput)} style={{ padding: '10px 14px', background: listening ? '#E24B4A' : 'var(--color-background-secondary)', color: listening ? '#fff' : purple, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>{listening ? '⏹️' : '🎤'}</button>
                <input value={convInput} onChange={e => setConvInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendConvMsg()} placeholder={listening ? '🎙️ Pode falar em inglês...' : 'Digite ou fale em inglês...'} style={{ flex: 1, padding: '10px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, fontSize: 14, background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
                <button onClick={sendConvMsg} disabled={loadingConv} style={{ padding: '10px 16px', background: purple, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>→</button>
              </div>
              {convMsgs.length >= 3 && (
                <div style={{ padding: '0 16px 12px', background: 'var(--color-background-primary)' }}>
                  <button onClick={gerarRelatorio} disabled={loadingReport} style={{ width: '100%', padding: 12, background: loadingReport ? '#999' : gold, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>{loadingReport ? '🔍 Analisando seu inglês...' : '🏁 Finalizar e ver meu relatório'}</button>
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
              <button onClick={() => setFluencyReport(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: '#fff', fontSize: 16, cursor: 'pointer' }}>✕</button>
              <div style={{ fontSize: 13, color: '#C9C4F0', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Relatório de Fluência</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginTop: 8, animation: 'su_pop 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>{fluencyReport.score}<span style={{ fontSize: 24, color: '#C9C4F0' }}>/100</span></div>
              <div style={{ fontSize: 14, color: '#fff', marginTop: 4 }}>{fluencyReport.score >= 80 ? '🌟 Excelente!' : fluencyReport.score >= 60 ? '💪 Muito bom!' : fluencyReport.score >= 40 ? '📈 Continue assim!' : '🌱 Começo de jornada!'}</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: greenLight, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#27500A', marginBottom: 10 }}>✅ Seus pontos fortes</div>
                {fluencyReport.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#3B6D11', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#633806', marginBottom: 10 }}>📈 O que melhorar</div>
                {fluencyReport.improvements.map((s, i) => <div key={i} style={{ fontSize: 13, color: '#854F0B', marginBottom: 6, lineHeight: 1.5, display: 'flex', gap: 8 }}><span>•</span><span>{s}</span></div>)}
              </div>
              <div style={{ background: purpleLight, borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#3C3489', fontWeight: 500, lineHeight: 1.5 }}>💜 {fluencyReport.message}</div>
              </div>
              {!isPremium && (
                <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #2074C0, #185FA5)', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>🚀 Quer evoluir mais rápido?</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 1.5 }}>Com o Premium você treina exatamente esses pontos com conversas ilimitadas e chega à fluência muito antes.</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 10 }}>Ver o Premium →</div>
                </div>
              )}
              <button onClick={compartilharResultado} style={{ width: '100%', padding: 14, background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>📲 Compartilhar meu resultado</button>
              <button onClick={() => { setFluencyReport(null); setConvStarted(false); setSelectedScenario(null); setConvMsgs([]) }} style={{ width: '100%', padding: 14, background: purple, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Praticar outro cenário →</button>
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
                {([['A1', 'A1 · Iniciante', 'Sobrevivência: o essencial do dia a dia', '#EAF3DE', '#3B6D11', '🌱'], ['A2', 'A2 · Básico', 'Cotidiano: passado, futuro, comparar', '#EAF3DE', '#3B6D11', '🌿'], ['B1', 'B1 · Intermediário', 'Independência: conversar e opinar', '#E6F1FB', '#185FA5', '💬'], ['B2', 'B2 · Intermediário+', 'Fluência: expressar ideias complexas', '#E6F1FB', '#185FA5', '🗣️'], ['C1', 'C1 · Avançado', 'Proficiência: precisão e nuance', '#EEEDFE', '#534AB7', '🎯'], ['C2', 'C2 · Domínio', 'Nível quase nativo', '#EEEDFE', '#534AB7', '🏆']] as const).map(([l, name, desc, bg, color, icon]) => (
                  <div key={l} onClick={() => { setLevel(l); setView('list') }} style={{ background: 'var(--color-background-primary)', border: level === l ? `1.5px solid ${color}` : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{name}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div></div>
                    {level === l && <div style={{ background: bg, borderRadius: 6, padding: '3px 8px', fontSize: 11, color, fontWeight: 500 }}>Atual</div>}
                  </div>
                ))}
              </div>
            )}
            {view === 'list' && (
              <div>
                <button onClick={() => setView('levels')} style={{ background: 'none', border: 'none', color: blue, cursor: 'pointer', marginBottom: 14, fontSize: 14, padding: 0 }}>← Voltar</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lessons[level].map((l, i) => (
                    <div key={i} onClick={() => { setLessonIdx(i); setView('explanation') }} style={{ background: 'var(--color-background-primary)', border: l.done ? '1px solid #97C459' : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div style={{ width: 44, height: 44, background: l.done ? greenLight : blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{l.icon}</div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{l.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{l.sub} · {l.q.length} exercícios</div></div>
                      {l.done ? <span style={{ fontSize: 18 }}>✅</span> : <span style={{ color: blue, fontSize: 18 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {view === 'explanation' && (
              <div>
                <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: blue, cursor: 'pointer', marginBottom: 14, fontSize: 14, padding: 0 }}>← Voltar</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: blueLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{currentLesson.icon}</div>
                  <div><div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{currentLesson.title}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{currentLesson.q.length} exercícios</div></div>
                </div>
                <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: blue, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Explicação</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{currentLesson.explanation}</div>
                </div>
                <div style={{ background: '#FAEEDA', borderRadius: 14, padding: 14, marginBottom: 12, display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                  <div style={{ fontSize: 13, color: '#633806', lineHeight: 1.6 }}>{currentLesson.tip}</div>
                </div>
                <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: blue, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Exemplos</div>
                  {currentLesson.examples.map((ex, i) => (
                    <div key={i} style={{ marginBottom: i < currentLesson.examples.length - 1 ? 12 : 0, paddingBottom: i < currentLesson.examples.length - 1 ? 12 : 0, borderBottom: i < currentLesson.examples.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: blue, marginBottom: 3 }}>{ex.en}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{ex.pt}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setQIdx(0); setAnswered(false); setSelected(-1); setView('quiz') }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Começar exercícios →</button>
              </div>
            )}
            {view === 'quiz' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setView('explanation')} style={{ width: 36, height: 36, border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--color-text-secondary)', flexShrink: 0 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>{currentLesson.q.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIdx ? blue : i === qIdx ? '#85B7EB' : 'var(--color-background-secondary)' }} />)}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{currentLesson.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: blue, fontWeight: 500, background: blueLight, padding: '3px 8px', borderRadius: 6 }}>{qIdx + 1}/{currentLesson.q.length}</div>
                </div>
                {currentLesson.q[qIdx].ctx && <div style={{ background: '#F1EFE8', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{currentLesson.q[qIdx].ctx}</div>}
                <div style={{ background: blueLight, borderRadius: 14, padding: 16, marginBottom: 16 }}><div style={{ fontSize: 17, fontWeight: 500, color: '#042C53', lineHeight: 1.4 }}>{currentLesson.q[qIdx].q}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {currentLesson.q[qIdx].opts.map((o, i) => {
                    const isCorrect = answered && i === currentLesson.q[qIdx].ans
                    const isWrong = answered && i === selected && i !== currentLesson.q[qIdx].ans
                    return (
                      <div key={i} onClick={() => answer(i)} style={{ border: isCorrect ? '1.5px solid #639922' : isWrong ? '1.5px solid #E24B4A' : '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: isCorrect ? '#27500A' : isWrong ? '#791F1F' : 'var(--color-text-primary)', background: isCorrect ? greenLight : isWrong ? '#FCEBEB' : 'var(--color-background-primary)', cursor: answered ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {o}
                        {isCorrect && <span style={{ width: 22, height: 22, background: green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>✓</span>}
                        {isWrong && <span style={{ width: 22, height: 22, background: '#E24B4A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>✗</span>}
                      </div>
                    )
                  })}
                </div>
                {answered && (
                  <div style={{ background: selected === currentLesson.q[qIdx].ans ? greenLight : '#FCEBEB', borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{selected === currentLesson.q[qIdx].ans ? '✅' : '💡'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: selected === currentLesson.q[qIdx].ans ? '#27500A' : '#633806', marginBottom: 2 }}>{selected === currentLesson.q[qIdx].ans ? 'Correto!' : 'Quase lá!'}</div>
                      <div style={{ fontSize: 13, color: selected === currentLesson.q[qIdx].ans ? green : '#854F0B', lineHeight: 1.5 }}>{currentLesson.q[qIdx].exp}</div>
                    </div>
                  </div>
                )}
                {answered && <button onClick={nextQ} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Próxima →</button>}
              </div>
            )}
            {view === 'finish' && (
              <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {['#EF9F27', '#534AB7', '#3B6D11', '#2074C0', '#E24B4A', '#DAA520', '#2EBD6B', '#6A5ACD'].map((cor, i) => (
                    <div key={i} style={{ position: 'absolute', top: 0, left: `${8 + i * 11}%`, width: 9, height: 9, borderRadius: i % 2 ? '50%' : 2, background: cor, animation: `su_confetti ${1.4 + (i % 4) * 0.3}s ease-in ${(i % 5) * 0.12}s forwards` }} />
                  ))}
                </div>
                <div style={{ fontSize: 64, marginBottom: 16, animation: 'su_bounce 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>🏆</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, animation: 'su_risefade 0.5s ease 0.2s both' }}>Lição concluída!</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 10, animation: 'su_risefade 0.5s ease 0.32s both' }}>Você ganhou</div>
                <div style={{ display: 'inline-block', fontSize: 36, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #EF9F27, #E07B00)', padding: '8px 28px', borderRadius: 30, marginBottom: 24, boxShadow: '0 6px 18px rgba(239,159,39,0.4)', animation: 'su_xppop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' }}>+30 XP</div>
                <div style={{ animation: 'su_risefade 0.5s ease 0.6s both' }}>
                  <button onClick={() => { setView('list'); setAnswered(false); setSelected(-1) }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>Continuar aprendendo →</button>
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
          <div style={{ background: `linear-gradient(135deg, #2074C0, ${blueDark})`, padding: '20px 16px 18px' }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>📚 Vocabulário</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>Toque no card para revelar a tradução</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,255,255,0.18)', padding: '6px 13px', borderRadius: 20 }}>
              <span style={{ fontSize: 14 }}>🔄</span>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Novas palavras toda semana</span>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {[['all', '🗂️ Todos'], ['basic', '👋 Essenciais'], ['travel', '✈️ Viagem'], ['work', '💼 Trabalho'], ['food', '🍽️ Comida'], ['home', '🏠 Casa'], ['verbs', '⚡ Verbos'], ['feelings', '😊 Sentimentos'], ['daily', '📅 Dia a dia']].map(([cat, label]) => (
                <button key={cat} onClick={() => setVocabCat(cat)} style={{ padding: '7px 14px', border: vocabCat === cat ? 'none' : '0.5px solid var(--color-border-tertiary)', borderRadius: 20, background: vocabCat === cat ? blue : 'var(--color-background-primary)', color: vocabCat === cat ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: vocabCat === cat ? 600 : 400 }}>{label}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontWeight: 600, color: blue }}>{filteredVocab.length}</span> palavras · embaralhadas esta semana</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
              {filteredVocab.map((v, i) => (
                <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))} style={{ background: flipped[i] ? blueLight : 'var(--color-background-primary)', border: flipped[i] ? '1px solid #85B7EB' : '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                    <span style={{ fontSize: 10.5, background: flipped[i] ? 'rgba(255,255,255,0.7)' : 'var(--color-background-secondary)', padding: '3px 8px', borderRadius: 12, color: 'var(--color-text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{catEmoji[v.cat]} {catNome[v.cat]}</span>
                    <button onClick={e => { e.stopPropagation(); speakEN(v.en, 5000 + i) }} style={{ background: speakingId === 5000 + i ? blue : 'var(--color-background-primary)', color: speakingId === 5000 + i ? '#fff' : blue, border: `1px solid ${blueLight}`, borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔊</button>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: flipped[i] ? blueDark : 'var(--color-text-primary)', lineHeight: 1.2 }}>{v.en}</div>
                  {flipped[i] ? (<><div style={{ color: blue, marginTop: 6, fontSize: 14, fontWeight: 600 }}>{v.pt}</div><div style={{ fontSize: 11, color: '#0C447C', marginTop: 8, fontStyle: 'italic', lineHeight: 1.45, background: 'rgba(255,255,255,0.6)', padding: '7px 9px', borderRadius: 9 }}>"{v.ex}"</div></>) : (<div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>Toque para ver →</div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-background-secondary)' }}>
          <div style={{ background: `linear-gradient(135deg, #2074C0, ${blueDark})`, padding: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👨‍🏫</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>Professor de IA</div>
              <div style={{ fontSize: 12, color: '#B5D4F4', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />Online · responde na hora</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            {chatMsgs.length <= 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {['Como me apresentar?', 'Since vs for', 'Present Perfect', 'Phrasal verbs'].map(t => (
                  <button key={t} onClick={() => setChatInput(t)} style={{ padding: '8px 14px', border: 'none', borderRadius: 20, background: blueLight, color: blueDark, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>{t}</button>
                ))}
              </div>
            )}
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {m.role === 'ai' && <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👨‍🏫</div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ padding: '11px 15px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, lineHeight: 1.6, background: m.role === 'user' ? `linear-gradient(135deg, #2074C0, #185FA5)` : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{m.text}</div>
                  {m.role === 'ai' && <button onClick={() => falarIngles(m.text, 1000 + i)} style={{ marginTop: 6, marginLeft: 2, background: speakingId === 1000 + i ? blue : 'var(--color-background-primary)', color: speakingId === 1000 + i ? '#fff' : blue, border: speakingId === 1000 + i ? 'none' : `1px solid ${blueLight}`, borderRadius: 20, padding: '5px 13px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === 1000 + i ? '⏸️ Parar' : '🔊 Ouvir em inglês'}</button>}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', alignItems: 'flex-end' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍🏫</div>
                <div style={{ padding: '14px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.2s' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.4s' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button onClick={micChat} style={{ width: 44, height: 44, background: listening ? '#E24B4A' : blueLight, color: listening ? '#fff' : blue, border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: listening ? 'su_pulse 1.2s infinite' : 'none' }}>{listening ? '⏹️' : '🎤'}</button>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={listening ? '🎙️ Gravando... toque ⏹️ para parar' : 'Digite ou fale...'} style={{ flex: 1, padding: '11px 14px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 22, fontSize: 14, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
            <button onClick={sendChat} disabled={loadingChat} style={{ width: 44, height: 44, background: blue, color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 500, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loadingChat ? 0.5 : 1 }}>→</button>
          </div>
        </div>
      )}

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--color-background-primary)', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', padding: '8px 0 4px', zIndex: 10 }}>
        {[['home', '🏠', 'Início'], ['speak', '🎭', 'Simular'], ['lessons', '📖', 'Lições'], ['dict', '🔤', 'Dicionário'], ['ai', '👨‍🏫', 'Professor']].map(([t, icon, label]) => (
          <button key={t} onClick={() => { setTab(t); if (t === 'lessons') setView('levels'); if (t === 'speak') { setConvStarted(false); setSelectedScenario(null) } }} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: 9, color: tab === t ? (t === 'speak' ? purple : blue) : 'var(--color-text-secondary)', fontWeight: tab === t ? 500 : 400 }}>{label}</span>
            {tab === t && <div style={{ width: 20, height: 3, background: t === 'speak' ? purple : blue, borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
