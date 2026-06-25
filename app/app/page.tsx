'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Question {
  q: string
  ctx: string
  opts: string[]
  ans: number
  exp: string
}

interface Lesson {
  title: string
  sub: string
  icon: string
  done: boolean
  explanation: string
  tip: string
  examples: { en: string; pt: string }[]
  q: Question[]
}

const lessons: Record<string, Lesson[]> = {
  beginner: [
    {
      title: 'Saudações e apresentações',
      sub: 'Hello, my name is...',
      icon: '👋',
      done: false,
      explanation: 'Em inglês, cumprimentar alguém corretamente faz toda a diferença. Usamos saudações diferentes dependendo da hora do dia e da situação — formal ou informal.',
      tip: '"Good morning" é até meio-dia. "Good afternoon" é da tarde. "Good evening" é à noite. "Good night" só para se despedir antes de dormir.',
      examples: [
        { en: 'Good morning! How are you?', pt: 'Bom dia! Como vai você?' },
        { en: 'Hi, my name is Carlos. Nice to meet you!', pt: 'Oi, meu nome é Carlos. Prazer em conhecê-lo!' },
        { en: "I'm fine, thank you. And you?", pt: 'Estou bem, obrigado. E você?' },
      ],
      q: [
        { q: 'Como se diz "Bom dia"?', ctx: 'São 9h da manhã...', opts: ['Good morning', 'Good night', 'Good afternoon', 'Good evening'], ans: 0, exp: 'Good morning = Bom dia. Usamos da madrugada até o meio-dia.' },
        { q: 'Complete: "_____ name is João."', ctx: '', opts: ['My', 'Your', 'His', 'Me'], ans: 0, exp: 'My = meu/minha. My name is = Meu nome é.' },
        { q: 'Como responder "How are you?"', ctx: '', opts: ["I'm fine, thank you", 'Yes, I am', 'My name is Ana', 'Good morning'], ans: 0, exp: "I'm fine, thank you = Estou bem, obrigado." },
        { q: 'O que significa "Nice to meet you"?', ctx: '', opts: ['Prazer em te conhecer', 'Como vai você?', 'Até logo', 'Obrigado'], ans: 0, exp: 'Nice to meet you = Prazer em te conhecer.' },
        { q: 'Como se despedir à noite?', ctx: '', opts: ['Good night', 'Good morning', 'Good evening', 'Goodbye'], ans: 0, exp: 'Good night = despedida para dormir.' },
        { q: 'Forma informal de "Hello":', ctx: '', opts: ['Hi', 'Good morning', 'How do you do', 'Good afternoon'], ans: 0, exp: 'Hi é a forma informal de Hello.' },
      ]
    },
    {
      title: 'Números de 1 a 100',
      sub: 'One, two, three...',
      icon: '🔢',
      done: false,
      explanation: 'De 13 a 19 terminam em "-teen". De 20 a 90 terminam em "-ty". Depois combine: twenty-one (21), thirty-five (35).',
      tip: 'Cuidado: thirteen (13) vs thirty (30). A diferença está na sílaba tônica.',
      examples: [
        { en: 'I have twenty-five students in my class.', pt: 'Tenho vinte e cinco alunos.' },
        { en: 'The apartment is on the fifteenth floor.', pt: 'O apartamento fica no décimo quinto andar.' },
        { en: 'She is forty-two years old.', pt: 'Ela tem quarenta e dois anos.' },
      ],
      q: [
        { q: 'Como se escreve 7?', ctx: '', opts: ['Seven', 'Eleven', 'Seventeen', 'Seventy'], ans: 0, exp: '7 = seven. 11 = eleven. 17 = seventeen. 70 = seventy.' },
        { q: '"Fifteen" é qual número?', ctx: '', opts: ['15', '50', '5', '500'], ans: 0, exp: 'Fifteen = 15. Terminações -teen = 13 a 19.' },
        { q: 'Como se diz 30?', ctx: '', opts: ['Thirty', 'Thirteen', 'Three', 'Threety'], ans: 0, exp: 'Thirty = 30. Dezenas terminam em -ty.' },
        { q: '"Forty-five" em número:', ctx: '', opts: ['45', '54', '405', '14'], ans: 0, exp: 'Forty-five = 45.' },
        { q: 'Como se diz 100?', ctx: '', opts: ['One hundred', 'One thousand', 'Ten', 'Hundredty'], ans: 0, exp: '100 = one hundred. 1000 = one thousand.' },
        { q: '"Eighty-three" é:', ctx: '', opts: ['83', '38', '80', '803'], ans: 0, exp: 'Eighty-three = 83.' },
      ]
    },
    {
      title: 'Cores e adjetivos básicos',
      sub: 'Red, blue, big, small...',
      icon: '🎨',
      done: false,
      explanation: 'Em inglês, os adjetivos vêm ANTES do substantivo: "a red car". Adjetivos não mudam para feminino ou plural.',
      tip: '"A beautiful girl" e "beautiful girls" — o adjetivo fica igual!',
      examples: [
        { en: 'She has a big blue house.', pt: 'Ela tem uma casa azul grande.' },
        { en: 'I want the small red bag.', pt: 'Eu quero a bolsa vermelha pequena.' },
        { en: 'The old black car is mine.', pt: 'O carro preto velho é meu.' },
      ],
      q: [
        { q: '"Azul" em inglês:', ctx: '', opts: ['Blue', 'Green', 'Yellow', 'Purple'], ans: 0, exp: 'Blue = azul. Green = verde. Yellow = amarelo. Purple = roxo.' },
        { q: '"Red" significa:', ctx: '', opts: ['Vermelho', 'Azul', 'Verde', 'Branco'], ans: 0, exp: 'Red = vermelho. Black = preto. White = branco.' },
        { q: '"Carro vermelho" em inglês:', ctx: '', opts: ['Red car', 'Car red', 'A car red', 'Car is red'], ans: 0, exp: 'Adjetivo ANTES: red car.' },
        { q: '"Big" significa:', ctx: '', opts: ['Grande', 'Pequeno', 'Velho', 'Novo'], ans: 0, exp: 'Big = grande. Small = pequeno.' },
        { q: '"Casa nova" em inglês:', ctx: '', opts: ['New house', 'House new', 'New houses', 'A house new'], ans: 0, exp: 'New house = casa nova.' },
        { q: 'Oposto de "beautiful":', ctx: '', opts: ['Ugly', 'Small', 'Old', 'Short'], ans: 0, exp: 'Ugly = feio. Beautiful = bonito.' },
      ]
    },
    {
      title: 'Família e pessoas',
      sub: 'Mother, father, brother...',
      icon: '👨‍👩‍👧',
      done: false,
      explanation: '"Grand-" indica avós. "Step-" indica família por casamento. "Cousin" serve para primo E prima.',
      tip: '"Cousin" em inglês não tem distinção de gênero.',
      examples: [
        { en: 'My mother and father are both doctors.', pt: 'Minha mãe e meu pai são médicos.' },
        { en: 'I have two brothers and one sister.', pt: 'Tenho dois irmãos e uma irmã.' },
        { en: 'My grandparents live in the countryside.', pt: 'Meus avós moram no interior.' },
      ],
      q: [
        { q: '"Irmã" em inglês:', ctx: '', opts: ['Sister', 'Brother', 'Mother', 'Daughter'], ans: 0, exp: 'Sister = irmã. Brother = irmão.' },
        { q: '"My father is a doctor." Significa:', ctx: '', opts: ['Meu pai é médico', 'Meu irmão é professor', 'Minha mãe é dentista', 'Meu filho é engenheiro'], ans: 0, exp: 'Father = pai. Doctor = médico.' },
        { q: '"Avó" em inglês:', ctx: '', opts: ['Grandmother', 'Grandfather', 'Aunt', 'Mother'], ans: 0, exp: 'Grandmother = avó. Grandfather = avô.' },
        { q: '"Cousin" significa:', ctx: '', opts: ['Primo/Prima', 'Irmão/Irmã', 'Sobrinho', 'Tio/Tia'], ans: 0, exp: 'Cousin = primo ou prima.' },
        { q: '"Marido" em inglês:', ctx: '', opts: ['Husband', 'Wife', 'Brother', 'Father'], ans: 0, exp: 'Husband = marido. Wife = esposa.' },
        { q: '"Nephew" significa:', ctx: '', opts: ['Sobrinho', 'Neto', 'Primo', 'Filho'], ans: 0, exp: 'Nephew = sobrinho. Niece = sobrinha.' },
      ]
    },
    {
      title: 'Dias, meses e datas',
      sub: 'Monday, January...',
      icon: '📅',
      done: false,
      explanation: 'Dias e meses sempre com MAIÚSCULA. Americanos: mês/dia/ano. Britânicos: dia/mês/ano.',
      tip: 'Meses abreviados: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.',
      examples: [
        { en: 'My birthday is on March 15th.', pt: 'Meu aniversário é no dia 15 de março.' },
        { en: 'The meeting is on Monday morning.', pt: 'A reunião é na segunda-feira de manhã.' },
        { en: 'See you next Wednesday!', pt: 'Te vejo na próxima quarta!' },
      ],
      q: [
        { q: '"Segunda-feira" em inglês:', ctx: '', opts: ['Monday', 'Tuesday', 'Sunday', 'Friday'], ans: 0, exp: 'Monday = segunda. Sunday = domingo. Friday = sexta.' },
        { q: '"Janeiro" em inglês:', ctx: '', opts: ['January', 'June', 'July', 'February'], ans: 0, exp: 'January = janeiro. June = junho. July = julho.' },
        { q: 'Mês depois de "March":', ctx: '', opts: ['April', 'February', 'May', 'June'], ans: 0, exp: 'Depois de March (março) vem April (abril).' },
        { q: '"Last Friday" significa:', ctx: '', opts: ['Na sexta passada', 'Na próxima sexta', 'Toda sexta', 'Na sexta à noite'], ans: 0, exp: 'Last = passado. Next = próximo.' },
        { q: '"Fim de semana" em inglês:', ctx: '', opts: ['Weekend', 'Weekday', 'Holiday', 'Week'], ans: 0, exp: 'Weekend = fim de semana. Weekday = dia útil.' },
        { q: 'Terceiro mês do ano:', ctx: '', opts: ['March', 'May', 'February', 'April'], ans: 0, exp: 'March = março, terceiro mês.' },
      ]
    },
    {
      title: 'Comida e bebidas',
      sub: 'Rice, chicken, water...',
      icon: '🍽️',
      done: false,
      explanation: 'Para pedir educadamente: "I would like...". Para fome: "I am hungry". Para sede: "I am thirsty".',
      tip: '"I am starving!" = estou morrendo de fome. Expressão casual muito usada.',
      examples: [
        { en: 'I would like a glass of water, please.', pt: 'Eu gostaria de um copo de água, por favor.' },
        { en: 'This chicken and rice is delicious!', pt: 'Este frango com arroz está delicioso!' },
        { en: 'I am hungry. Can we eat now?', pt: 'Estou com fome. Podemos comer agora?' },
      ],
      q: [
        { q: '"Frango" em inglês:', ctx: '', opts: ['Chicken', 'Beef', 'Pork', 'Fish'], ans: 0, exp: 'Chicken = frango. Beef = boi. Pork = porco. Fish = peixe.' },
        { q: '"Breakfast" é:', ctx: '', opts: ['Café da manhã', 'Almoço', 'Jantar', 'Lanche'], ans: 0, exp: 'Breakfast = café. Lunch = almoço. Dinner = jantar.' },
        { q: 'Como dizer "Estou com sede":', ctx: '', opts: ['I am thirsty', 'I am hungry', 'I am tired', 'I am full'], ans: 0, exp: 'Thirsty = com sede. Hungry = com fome. Full = satisfeito.' },
        { q: '"Delicious" significa:', ctx: '', opts: ['Delicioso', 'Horrível', 'Salgado', 'Doce'], ans: 0, exp: 'Delicious = delicioso. Salty = salgado. Sweet = doce.' },
        { q: 'Como pedir educadamente:', ctx: '', opts: ['I would like a coffee, please.', 'Give me a coffee.', 'I want coffee now.', 'Coffee!'], ans: 0, exp: '"I would like" é a forma mais educada.' },
        { q: '"Arroz" em inglês:', ctx: '', opts: ['Rice', 'Beans', 'Bread', 'Pasta'], ans: 0, exp: 'Rice = arroz. Beans = feijão. Bread = pão.' },
      ]
    },
    {
      title: 'No restaurante',
      sub: 'Ordering food, paying...',
      icon: '🍴',
      done: false,
      explanation: 'Para chamar o garçom: "Excuse me!" — nunca "Hey!". Para pedir a conta: "Can I have the bill, please?"',
      tip: '"What do you recommend?" = O que você recomenda? Ótima pergunta para escolher bem.',
      examples: [
        { en: 'A table for two, please.', pt: 'Uma mesa para dois, por favor.' },
        { en: 'What do you recommend?', pt: 'O que você recomenda?' },
        { en: 'Can I have the bill, please?', pt: 'Posso pegar a conta, por favor?' },
      ],
      q: [
        { q: 'Como pedir mesa para 4:', ctx: '', opts: ['A table for four, please.', 'Four tables, please.', 'I need four seats.', 'Table four.'], ans: 0, exp: '"A table for [número]" é a frase padrão.' },
        { q: '"Menu" significa:', ctx: '', opts: ['Cardápio', 'Conta', 'Prato', 'Garçom'], ans: 0, exp: 'Menu = cardápio. Bill = conta. Waiter = garçom.' },
        { q: 'Como dizer que é vegetariano:', ctx: '', opts: ['I am vegetarian.', 'I do not eat.', 'No meat menu.', 'Vegetables only.'], ans: 0, exp: '"I am vegetarian/vegan" é a forma direta.' },
        { q: '"Is service included?" significa:', ctx: '', opts: ['A gorjeta está incluída?', 'O serviço está aberto?', 'Posso pagar?', 'Aceitam cartão?'], ans: 0, exp: 'Service = gorjeta/taxa de serviço.' },
        { q: 'Como elogiar a comida:', ctx: '', opts: ['The food is excellent!', 'Food is good.', 'I like eat.', 'Very food!'], ans: 0, exp: '"Excellent!" ou "delicious!" são elogios naturais.' },
        { q: 'Como perguntar se aceitam cartão:', ctx: '', opts: ['Do you accept credit cards?', 'Card payment?', 'I have a card.', 'No cash.'], ans: 0, exp: '"Do you accept credit cards?"' },
      ]
    },
    {
      title: 'Partes do corpo',
      sub: 'Head, shoulders, knees...',
      icon: '🧍',
      done: false,
      explanation: 'Para dizer que algo dói: "My [parte] hurts." Headache = dor de cabeça. Stomachache = dor de barriga. Backache = dor nas costas.',
      tip: '"My back hurts" = minhas costas doem. O sujeito "my" é obrigatório.',
      examples: [
        { en: 'My back hurts after work.', pt: 'Minhas costas doem depois do trabalho.' },
        { en: 'She broke her arm playing football.', pt: 'Ela quebrou o braço jogando futebol.' },
        { en: 'I have a terrible headache today.', pt: 'Estou com dor de cabeça terrível hoje.' },
      ],
      q: [
        { q: '"Joelho" em inglês:', ctx: '', opts: ['Knee', 'Elbow', 'Ankle', 'Wrist'], ans: 0, exp: 'Knee = joelho. Elbow = cotovelo. Ankle = tornozelo. Wrist = pulso.' },
        { q: '"Shoulder" significa:', ctx: '', opts: ['Ombro', 'Cotovelo', 'Pescoço', 'Costas'], ans: 0, exp: 'Shoulder = ombro. Neck = pescoço. Back = costas.' },
        { q: 'Como dizer "Minha cabeça dói":', ctx: '', opts: ['My head hurts.', 'I have head.', 'Head is bad.', 'My head is hurt.'], ans: 0, exp: '"My [parte] hurts." é a estrutura correta.' },
        { q: '"Dedo do pé" em inglês:', ctx: '', opts: ['Toe', 'Finger', 'Thumb', 'Heel'], ans: 0, exp: 'Toe = dedo do pé. Finger = mão. Thumb = polegar.' },
        { q: '"Stomach" significa:', ctx: '', opts: ['Estômago/barriga', 'Costas', 'Peito', 'Pescoço'], ans: 0, exp: 'Stomach = estômago. Stomachache = dor de barriga.' },
        { q: '"Braço" em inglês:', ctx: '', opts: ['Arm', 'Hand', 'Leg', 'Foot'], ans: 0, exp: 'Arm = braço. Hand = mão. Leg = perna. Foot = pé.' },
      ]
    },
    {
      title: 'Roupas e acessórios',
      sub: 'Shirt, shoes, hat...',
      icon: '👕',
      done: false,
      explanation: '"Wear" = usar roupas. "I am wearing" = estou usando agora. "Put on" = colocar. "Take off" = tirar.',
      tip: '"Can I try this on?" = Posso experimentar isso?',
      examples: [
        { en: 'She is wearing a red dress and black shoes.', pt: 'Ela está usando vestido vermelho e sapatos pretos.' },
        { en: 'I need to buy a new jacket for winter.', pt: 'Preciso comprar uma jaqueta para o inverno.' },
        { en: 'Can I try this shirt on?', pt: 'Posso experimentar essa camisa?' },
      ],
      q: [
        { q: '"Sapato" em inglês:', ctx: '', opts: ['Shoe', 'Shirt', 'Sock', 'Suit'], ans: 0, exp: 'Shoe = sapato. Shirt = camisa. Sock = meia. Suit = terno.' },
        { q: '"Jacket" é:', ctx: '', opts: ['Jaqueta/casaco', 'Calça', 'Vestido', 'Chapéu'], ans: 0, exp: 'Jacket = jaqueta. Pants = calça. Dress = vestido. Hat = chapéu.' },
        { q: 'Como perguntar o tamanho:', ctx: '', opts: ['What size do you have?', 'How big is this?', 'Size please?', 'What is the number?'], ans: 0, exp: '"What size do you have?"' },
        { q: 'Verbo para "usar roupa":', ctx: '"She _____ a blue coat."', opts: ['wears', 'uses', 'puts', 'dresses'], ans: 0, exp: 'Wear = usar roupas. She wears a coat.' },
        { q: '"Tirar a roupa" em inglês:', ctx: '', opts: ['Take off', 'Put on', 'Wear out', 'Dress up'], ans: 0, exp: 'Take off = tirar. Put on = colocar.' },
        { q: '"Underwear" é:', ctx: '', opts: ['Roupa íntima', 'Calça de baixo', 'Pijama', 'Uniforme'], ans: 0, exp: 'Underwear = roupa íntima. Pajamas = pijama.' },
      ]
    },
    {
      title: 'Lugares na cidade',
      sub: 'Bank, hospital, school...',
      icon: '🏙️',
      done: false,
      explanation: '"Go to the" + lugar. Exceção: "go to school/work/home" sem "the" — indica função, não o prédio.',
      tip: '"Is there a [lugar] near here?" = Tem um [lugar] perto daqui?',
      examples: [
        { en: 'The hospital is next to the park.', pt: 'O hospital fica ao lado do parque.' },
        { en: 'I need to go to the bank today.', pt: 'Preciso ir ao banco hoje.' },
        { en: 'Is there a pharmacy near here?', pt: 'Tem uma farmácia perto daqui?' },
      ],
      q: [
        { q: '"Farmácia" em inglês:', ctx: '', opts: ['Pharmacy', 'Library', 'Bakery', 'Factory'], ans: 0, exp: 'Pharmacy = farmácia. Library = biblioteca. Bakery = padaria.' },
        { q: '"Supermarket" é:', ctx: '', opts: ['Supermercado', 'Shopping', 'Mercado', 'Loja 24h'], ans: 0, exp: 'Supermarket = supermercado. Shopping mall = shopping.' },
        { q: 'Como perguntar onde fica:', ctx: '', opts: ['Where is the bank?', 'How is the bank?', 'What is the bank?', 'Bank where?'], ans: 0, exp: '"Where is...?" = Onde fica...?' },
        { q: '"Turn left at the corner." significa:', ctx: '', opts: ['Vire à esquerda na esquina', 'Siga em frente', 'Vire à direita', 'Pare'], ans: 0, exp: 'Turn left = esquerda. Turn right = direita. Go straight = em frente.' },
        { q: '"Next to" significa:', ctx: '', opts: ['Ao lado de', 'Em frente a', 'Atrás de', 'Longe de'], ans: 0, exp: 'Next to = ao lado de. In front of = em frente. Behind = atrás.' },
        { q: '"Correios" em inglês:', ctx: '', opts: ['Post office', 'Police station', 'Gas station', 'Fire station'], ans: 0, exp: 'Post office = correios. Police station = delegacia.' },
      ]
    },
    {
      title: 'Verbos do cotidiano',
      sub: 'Eat, sleep, work, study...',
      icon: '⚡',
      done: false,
      explanation: 'Terceira pessoa leva "-s": "I eat" mas "she eats". Verbos irregulares: go→went, eat→ate, sleep→slept, drink→drank.',
      tip: 'Rotina: wake up (acordar), get dressed (se vestir), have breakfast (tomar café), go to work (trabalhar), go to bed (dormir).',
      examples: [
        { en: 'I wake up at 6am every day.', pt: 'Acordo às 6h todo dia.' },
        { en: 'She works at a hospital.', pt: 'Ela trabalha num hospital.' },
        { en: 'We eat dinner together on Sundays.', pt: 'Jantamos juntos aos domingos.' },
      ],
      q: [
        { q: '"Dormir" em inglês:', ctx: '', opts: ['Sleep', 'Wake', 'Rest', 'Dream'], ans: 0, exp: 'Sleep = dormir. Wake up = acordar. Rest = descansar.' },
        { q: '"She _____ to work by bus."', ctx: '', opts: ['goes', 'go', 'going', 'gone'], ans: 0, exp: 'Com she/he/it: goes.' },
        { q: '"Study" significa:', ctx: '', opts: ['Estudar', 'Trabalhar', 'Brincar', 'Correr'], ans: 0, exp: 'Study = estudar. Work = trabalhar. Run = correr.' },
        { q: 'Passado de "eat":', ctx: '"I _____ pizza yesterday."', opts: ['ate', 'eated', 'eat', 'aten'], ans: 0, exp: 'Eat → ate (irregular).' },
        { q: 'Como dizer "tomar banho":', ctx: '', opts: ['Take a shower', 'Make a shower', 'Do a shower', 'Have a shower'], ans: 0, exp: 'Take/have a shower = tomar banho.' },
        { q: '"Cook" significa:', ctx: '', opts: ['Cozinhar', 'Comer', 'Limpar', 'Comprar'], ans: 0, exp: 'Cook = cozinhar. Kitchen = cozinha.' },
      ]
    },
    {
      title: 'O verbo To Be',
      sub: 'I am, you are, he is...',
      icon: '🔤',
      done: false,
      explanation: 'To be (ser/estar): I am, you are, he/she/it is, we/you/they are. Passado: was/were.',
      tip: "Contrações: I'm, you're, he's, she's, it's, we're, they're. Sempre usadas na fala.",
      examples: [
        { en: 'I am a student. She is a teacher.', pt: 'Sou estudante. Ela é professora.' },
        { en: 'We are tired after the trip.', pt: 'Estamos cansados depois da viagem.' },
        { en: 'Is he from Brazil? Yes, he is.', pt: 'Ele é do Brasil? Sim, é.' },
      ],
      q: [
        { q: '"I _____ Brazilian."', ctx: '', opts: ['am', 'is', 'are', 'be'], ans: 0, exp: 'Com "I" sempre "am".' },
        { q: '"They _____ very happy."', ctx: '', opts: ['are', 'is', 'am', 'be'], ans: 0, exp: 'Com they/we/you: "are".' },
        { q: 'Negativa de "I am tired":', ctx: '', opts: ['I am not tired.', 'I not am tired.', "I don't am tired.", "I isn't tired."], ans: 0, exp: 'Negativa: am/is/are + not.' },
        { q: '"She is not here." — contração:', ctx: '', opts: ["She isn't here.", "She aren't here.", "She not is here.", "She amn't here."], ans: 0, exp: "Is not = isn't." },
        { q: '"Were you at the party?" Quando?', ctx: '', opts: ['No passado', 'No presente', 'No futuro', 'Agora'], ans: 0, exp: 'Were = passado de "are".' },
        { q: 'Como perguntar de onde alguém é:', ctx: '', opts: ['Where are you from?', 'Who are you?', 'What is you?', 'Where you from?'], ans: 0, exp: '"Where are you from?" = De onde você é?' },
      ]
    },
    {
      title: 'Animais e natureza',
      sub: 'Dog, cat, river, mountain...',
      icon: '🐾',
      done: false,
      explanation: 'Sons: dogs bark (latem), cats meow (miam), birds sing (cantam), cows moo (mugem). Wild = selvagem. Pet = animal de estimação.',
      tip: 'Endangered = em extinção. Extinct = extinto. Biodiversity = biodiversidade.',
      examples: [
        { en: 'There is a beautiful waterfall in the forest.', pt: 'Há uma cachoeira linda na floresta.' },
        { en: 'The dog is playing in the garden.', pt: 'O cachorro está brincando no jardim.' },
        { en: 'Brazil has incredible biodiversity.', pt: 'O Brasil tem biodiversidade incrível.' },
      ],
      q: [
        { q: '"Cachorro" em inglês:', ctx: '', opts: ['Dog', 'Cat', 'Bird', 'Horse'], ans: 0, exp: 'Dog = cachorro. Cat = gato. Bird = pássaro. Horse = cavalo.' },
        { q: '"River" significa:', ctx: '', opts: ['Rio', 'Mar', 'Lago', 'Cachoeira'], ans: 0, exp: 'River = rio. Sea = mar. Lake = lago. Waterfall = cachoeira.' },
        { q: '"Floresta" em inglês:', ctx: '', opts: ['Forest', 'Desert', 'Beach', 'Mountain'], ans: 0, exp: 'Forest = floresta. Desert = deserto. Beach = praia.' },
        { q: '"Wild" significa:', ctx: '', opts: ['Selvagem', 'Domesticado', 'Perigoso', 'Raro'], ans: 0, exp: 'Wild = selvagem. Domesticated = domesticado.' },
        { q: '"Abelha" em inglês:', ctx: '', opts: ['Bee', 'Ant', 'Fly', 'Butterfly'], ans: 0, exp: 'Bee = abelha. Ant = formiga. Butterfly = borboleta.' },
        { q: '"Sunrise" significa:', ctx: '', opts: ['Nascer do sol', 'Pôr do sol', 'Lua cheia', 'Tempestade'], ans: 0, exp: 'Sunrise = nascer do sol. Sunset = pôr do sol.' },
      ]
    },
    {
      title: 'Profissões',
      sub: 'Doctor, teacher, engineer...',
      icon: '👩‍⚕️',
      done: false,
      explanation: '"I am a/an + profissão". Use "a" antes de consoante, "an" antes de vogal. Profissões são geralmente neutras em gênero.',
      tip: '"What do you do for a living?" = Qual é a sua profissão?',
      examples: [
        { en: 'My sister is a nurse at the city hospital.', pt: 'Minha irmã é enfermeira no hospital.' },
        { en: 'He works as an engineer at a tech company.', pt: 'Ele trabalha como engenheiro numa empresa tech.' },
        { en: 'What do you do for a living?', pt: 'Qual é a sua profissão?' },
      ],
      q: [
        { q: '"Advogado" em inglês:', ctx: '', opts: ['Lawyer', 'Doctor', 'Engineer', 'Accountant'], ans: 0, exp: 'Lawyer = advogado. Doctor = médico. Engineer = engenheiro.' },
        { q: '"She is _____ architect."', ctx: '', opts: ['an', 'a', 'the', 'one'], ans: 0, exp: '"An" antes de vogal: an architect.' },
        { q: 'Como perguntar a profissão:', ctx: '', opts: ['What do you do?', 'Who are you?', 'What are you?', 'How do you work?'], ans: 0, exp: '"What do you do?" é a pergunta natural.' },
        { q: '"Firefighter" é:', ctx: '', opts: ['Bombeiro', 'Policial', 'Segurança', 'Soldado'], ans: 0, exp: 'Firefighter = bombeiro. Police officer = policial.' },
        { q: 'Como dizer "Sou professor":', ctx: '', opts: ['I am a teacher.', 'I am teacher.', 'I work teacher.', 'I do teaching.'], ans: 0, exp: 'Sempre use artigo: "I am a teacher."' },
        { q: '"Self-employed" significa:', ctx: '', opts: ['Autônomo', 'Desempregado', 'Funcionário público', 'Aposentado'], ans: 0, exp: 'Self-employed = autônomo. Unemployed = desempregado.' },
      ]
    },
    {
      title: 'Tempo e clima',
      sub: 'Sunny, rainy, hot, cold...',
      icon: '🌤️',
      done: false,
      explanation: '"It is" + adjetivo de clima. O "It" é obrigatório — diferente do português. "It is hot/cold/rainy/windy."',
      tip: '"What is the weather like?" = Como está o tempo? Forma mais natural entre nativos.',
      examples: [
        { en: 'It is sunny and warm today.', pt: 'Está ensolarado e quente hoje.' },
        { en: 'It was raining all day yesterday.', pt: 'Estava chovendo o dia todo ontem.' },
        { en: "What's the weather like today?", pt: 'Como está o tempo hoje?' },
      ],
      q: [
        { q: 'Como dizer "Está chovendo":', ctx: '', opts: ['It is raining.', 'Rain is happening.', 'The rain is.', 'Is raining.'], ans: 0, exp: '"It is raining." — o "it" é obrigatório.' },
        { q: '"Cloudy" significa:', ctx: '', opts: ['Nublado', 'Ensolarado', 'Ventoso', 'Nevando'], ans: 0, exp: 'Cloudy = nublado. Sunny = ensolarado. Windy = ventoso.' },
        { q: 'Como dizer "Está muito quente":', ctx: '', opts: ['It is very hot.', 'The weather is heat.', 'Is very hot.', 'Too much hot.'], ans: 0, exp: '"It is hot/cold/warm/cool."' },
        { q: '"Forecast" significa:', ctx: '', opts: ['Previsão do tempo', 'Temperatura', 'Tempestade', 'Estação'], ans: 0, exp: 'Weather forecast = previsão do tempo.' },
        { q: '"As quatro estações" em inglês:', ctx: '', opts: ['The four seasons', 'The four climates', 'The four weathers', 'The four times'], ans: 0, exp: 'Spring (primavera), Summer (verão), Autumn (outono), Winter (inverno).' },
        { q: '"It is freezing!" significa:', ctx: '', opts: ['Está muito frio', 'Está muito quente', 'Está nevando', 'Está ventando'], ans: 0, exp: 'Freezing = congelando. Boiling = fervendo de calor.' },
      ]
    },
    {
      title: 'Adjetivos de personalidade',
      sub: 'Friendly, shy, brave...',
      icon: '😊',
      done: false,
      explanation: '"He/She is + adjetivo". Adjetivos de personalidade não variam em gênero/número. Intensificadores: very, extremely, quite, rather.',
      tip: '"Quite shy" = bastante tímido. "Rather stubborn" = um tanto teimoso.',
      examples: [
        { en: 'My brother is very outgoing and funny.', pt: 'Meu irmão é extrovertido e engraçado.' },
        { en: 'She is hardworking and reliable.', pt: 'Ela é trabalhadora e confiável.' },
        { en: 'He can be stubborn sometimes.', pt: 'Ele pode ser teimoso às vezes.' },
      ],
      q: [
        { q: '"Shy" significa:', ctx: '', opts: ['Tímido', 'Extrovertido', 'Corajoso', 'Preguiçoso'], ans: 0, exp: 'Shy = tímido. Outgoing = extrovertido. Brave = corajoso.' },
        { q: '"Generoso" em inglês:', ctx: '', opts: ['Generous', 'Greedy', 'Selfish', 'Rude'], ans: 0, exp: 'Generous = generoso. Greedy = ganancioso. Selfish = egoísta.' },
        { q: '"Reliable" significa:', ctx: '', opts: ['Confiável', 'Criativo', 'Ambicioso', 'Paciente'], ans: 0, exp: 'Reliable = confiável. Creative = criativo. Patient = paciente.' },
        { q: 'Oposto de "hardworking":', ctx: '', opts: ['Lazy', 'Shy', 'Rude', 'Selfish'], ans: 0, exp: 'Hardworking = trabalhador. Lazy = preguiçoso.' },
        { q: '"Engraçado" em inglês:', ctx: '', opts: ['Funny', 'Serious', 'Boring', 'Quiet'], ans: 0, exp: 'Funny = engraçado. Serious = sério. Boring = chato.' },
        { q: '"Open-minded" significa:', ctx: '', opts: ['Mente aberta/tolerante', 'Muito inteligente', 'Extrovertido', 'Honesto'], ans: 0, exp: 'Open-minded = mente aberta. Narrow-minded = limitado.' },
      ]
    },
    {
      title: 'Transporte e direções',
      sub: 'Bus, train, turn left...',
      icon: '🚌',
      done: false,
      explanation: '"Take the bus/train/subway" = pegar transporte. Go straight = em frente. Turn left/right = esquerda/direita.',
      tip: '"How do I get to...?" = Como chego a...? Forma mais natural de pedir direções.',
      examples: [
        { en: 'Take the subway to downtown, then walk two blocks.', pt: 'Pegue o metrô ao centro, depois caminhe dois quarteirões.' },
        { en: 'How do I get to the airport?', pt: 'Como eu chego ao aeroporto?' },
        { en: 'The bus stop is just around the corner.', pt: 'O ponto fica bem na esquina.' },
      ],
      q: [
        { q: '"Metrô" em inglês:', ctx: '', opts: ['Subway / Metro', 'Train', 'Tram', 'Bus'], ans: 0, exp: 'Subway (EUA) / Metro (UK) = metrô. Tram = bonde.' },
        { q: '"Go straight for two blocks." significa:', ctx: '', opts: ['Siga dois quarteirões em frente', 'Vire à direita', 'Vire à esquerda', 'Pare'], ans: 0, exp: 'Go straight = em frente. Block = quarteirão.' },
        { q: 'Como dizer "pegar o ônibus":', ctx: '', opts: ['Take/catch the bus', 'Ride the bus only', 'Use the bus', 'Board the bus only'], ans: 0, exp: '"Take" e "catch the bus" são os mais comuns.' },
        { q: '"Fare" significa:', ctx: '', opts: ['Tarifa/passagem', 'Horário', 'Rota', 'Parada'], ans: 0, exp: 'Fare = tarifa. Schedule = horário. Route = rota.' },
        { q: '"Within walking distance" significa:', ctx: '', opts: ['Dá para ir a pé', 'É muito longe', 'Só de carro', 'Outro lado da cidade'], ans: 0, exp: 'Within walking distance = perto o suficiente para ir a pé.' },
        { q: 'Como perguntar quanto tempo leva:', ctx: '', opts: ['How long does it take?', 'How much time is?', 'What time does it take?', 'How far takes?'], ans: 0, exp: '"How long does it take?" = Quanto tempo leva?' },
      ]
    },
    {
      title: 'Compras e dinheiro',
      sub: 'Price, cheap, expensive...',
      icon: '🛍️',
      done: false,
      explanation: '"How much is it?" = Quanto custa? "On sale" = em promoção. "Bargain" = pechincha.',
      tip: '"I am just browsing" = só estou olhando. Útil para dispensar o vendedor.',
      examples: [
        { en: 'How much does this cost?', pt: 'Quanto custa isso?' },
        { en: 'This jacket is on sale — 30% off!', pt: 'Essa jaqueta está em promoção — 30% off!' },
        { en: 'Can I pay by credit card?', pt: 'Posso pagar com cartão de crédito?' },
      ],
      q: [
        { q: 'Como perguntar o preço:', ctx: '', opts: ['How much is it?', 'What is the price?', 'How many does it cost?', 'What cost is?'], ans: 0, exp: '"How much is it?" é a forma mais natural.' },
        { q: '"Expensive" significa:', ctx: '', opts: ['Caro', 'Barato', 'Grátis', 'Em promoção'], ans: 0, exp: 'Expensive = caro. Cheap = barato. Free = grátis.' },
        { q: 'Como pedir desconto:', ctx: '', opts: ['Can you give me a discount?', 'Make it cheaper.', 'I want less price.', 'Discount now!'], ans: 0, exp: '"Can you give me a discount?" é educado e direto.' },
        { q: '"Receipt" é:', ctx: '', opts: ['Recibo/nota fiscal', 'Preço', 'Etiqueta', 'Embalagem'], ans: 0, exp: 'Receipt = recibo. Price tag = etiqueta.' },
        { q: '"I am just browsing." significa:', ctx: '', opts: ['Só estou olhando', 'Quero comprar tudo', 'Procuro algo específico', 'Vou voltar'], ans: 0, exp: '"Just browsing" = só olhando sem intenção de comprar.' },
        { q: 'Como pedir para trocar:', ctx: '', opts: ['I would like to exchange this.', 'I want another one.', 'This is wrong.', 'Change this.'], ans: 0, exp: '"I would like to exchange/return this."' },
      ]
    },
  ],
  intermediate: [
    {
      title: 'Present Perfect na prática',
      sub: 'Have you ever...?',
      icon: '⏰',
      done: false,
      explanation: 'Conecta o passado ao presente. Estrutura: have/has + particípio. Experiências de vida sem tempo definido ou ações com impacto no presente.',
      tip: 'Palavras-chave: already, yet, just, ever, never, since, for.',
      examples: [
        { en: "I have already eaten. I'm not hungry.", pt: 'Já comi. Não estou com fome.' },
        { en: 'She has never been to Europe.', pt: 'Ela nunca foi à Europa.' },
        { en: 'Have you ever tried sushi?', pt: 'Você já provou sushi?' },
      ],
      q: [
        { q: 'Qual usa Present Perfect corretamente?', ctx: '', opts: ['I have visited Paris', 'I have visited Paris last year', 'I visited Paris recently', 'I am visiting Paris'], ans: 0, exp: 'Tempo indefinido: Present Perfect. Com "last year": Simple Past.' },
        { q: '"She _____ never eaten sushi."', ctx: '', opts: ['has', 'have', 'had', 'is'], ans: 0, exp: "Com she/he/it: 'has'." },
        { q: '"I have just arrived." Quando?', ctx: '', opts: ['Acabei de chegar', 'Há muito tempo', 'Vou chegar logo', 'Ontem'], ans: 0, exp: '"Just" = há pouquíssimo tempo.' },
        { q: 'Since vs For:', ctx: '"___ 2010" / "___ 5 years"', opts: ['since / for', 'for / since', 'since / since', 'for / for'], ans: 0, exp: 'Since = desde (ponto). For = por/há (duração).' },
        { q: '"Have you _____ been to London?"', ctx: '', opts: ['ever', 'already', 'just', 'yet'], ans: 0, exp: '"Ever" em perguntas = alguma vez.' },
        { q: 'Como perguntar se algo já foi feito:', ctx: '', opts: ['Have you finished yet?', 'Did you finish yet?', 'Have you finish?', 'You have finished?'], ans: 0, exp: '"Yet" em perguntas = já/ainda.' },
      ]
    },
    {
      title: 'Conditional — If clauses',
      sub: 'If I were rich...',
      icon: '🔀',
      done: false,
      explanation: '1º: situações possíveis (If + present + will). 2º: situações imaginárias (If + were/past + would). Nunca use "would" na cláusula com "if".',
      tip: 'No 2º condicional, use WERE para todas as pessoas: If I were, if she were.',
      examples: [
        { en: 'If I study hard, I will pass the exam.', pt: 'Se eu estudar muito, vou passar.' },
        { en: 'If I were you, I would apologize.', pt: 'Se eu fosse você, pediria desculpas.' },
        { en: 'What would you do if you won the lottery?', pt: 'O que faria se ganhasse na loteria?' },
      ],
      q: [
        { q: 'Para situação possível no futuro:', ctx: '', opts: ['1st Conditional (will)', '2nd Conditional (would)', '3rd Conditional', 'Zero Conditional'], ans: 0, exp: '1º: If + Simple Present + will.' },
        { q: '"If I _____ a millionaire, I would travel."', ctx: '', opts: ['were', 'am', 'will be', 'was being'], ans: 0, exp: '2º: If + were/past simple.' },
        { q: '"If it rains, I _____ stay home."', ctx: '', opts: ['will', 'would', 'should', 'could'], ans: 0, exp: '1º Condicional: will.' },
        { q: '"I would travel if I had money" significa:', ctx: '', opts: ['Eu viajaria se tivesse', 'Vou viajar se tiver', 'Viajei quando tinha', 'Viajo quando tenho'], ans: 0, exp: 'Would = hipotético. If I had = mas não tenho.' },
        { q: 'Qual está correta?', ctx: '', opts: ['If she studies, she will pass.', 'If she would study, she will pass.', 'If she studies, she would pass.', 'If she will study, she passes.'], ans: 0, exp: 'If + Simple Present + will. Nunca would no "if".' },
        { q: '"What would you do if you _____ president?"', ctx: '', opts: ['were', 'are', 'will be', 'had been'], ans: 0, exp: '2º: If + were, would + verb.' },
      ]
    },
    {
      title: 'Phrasal verbs essenciais',
      sub: 'Give up, look up, turn on...',
      icon: '🔄',
      done: false,
      explanation: 'Verbo + preposição com significado completamente novo. Não traduza literalmente.',
      tip: 'Mais usados: get up, wake up, look up, turn on/off, give up, figure out, set up, call back.',
      examples: [
        { en: 'I gave up eating sugar last month.', pt: 'Parei de comer açúcar no mês passado.' },
        { en: 'Can you look up this word?', pt: 'Pode pesquisar essa palavra?' },
        { en: "I can't figure out how to fix this.", pt: 'Não consigo descobrir como consertar.' },
      ],
      q: [
        { q: '"Give up" significa:', ctx: '', opts: ['Desistir', 'Continuar', 'Começar', 'Dar de presente'], ans: 0, exp: 'Give up = desistir.' },
        { q: '"Turn off the TV" — o que fazer:', ctx: '', opts: ['Desligar a TV', 'Ligar', 'Aumentar volume', 'Trocar canal'], ans: 0, exp: 'Turn off = desligar. Turn on = ligar.' },
        { q: '"Look up" significa:', ctx: '', opts: ['Pesquisar/consultar', 'Olhar para cima', 'Ignorar', 'Escrever'], ans: 0, exp: 'Look up = pesquisar, consultar.' },
        { q: '"Think it over" significa:', ctx: '', opts: ['Pensar bem', 'Pensar rápido', 'Já decidir', 'Não pensar'], ans: 0, exp: 'Think over = pensar bem, considerar.' },
        { q: 'Como dizer "Me ligue de volta":', ctx: '', opts: ['Call me back.', 'Call me again.', 'Call back me.', 'Phone me return.'], ans: 0, exp: 'Call back = ligar de volta.' },
        { q: '"We ran out of coffee" significa:', ctx: '', opts: ['O café acabou', 'Corremos para o café', 'Compramos mais', 'Jogamos fora'], ans: 0, exp: 'Run out of = ficar sem, acabar.' },
      ]
    },
    {
      title: 'Passive Voice',
      sub: 'The cake was made by...',
      icon: '🔁',
      done: false,
      explanation: 'Foca na ação/objeto, não em quem fez. Estrutura: sujeito + to be + particípio. Comum em notícias e textos formais.',
      tip: 'Presente: is/are + particípio. Passado: was/were + particípio. Futuro: will be + particípio.',
      examples: [
        { en: 'This bridge was built in 1895.', pt: 'Esta ponte foi construída em 1895.' },
        { en: 'English is spoken in 50+ countries.', pt: 'O inglês é falado em mais de 50 países.' },
        { en: 'The package will be delivered tomorrow.', pt: 'O pacote será entregue amanhã.' },
      ],
      q: [
        { q: 'Passiva de "They built the house":', ctx: '', opts: ['The house was built.', 'The house is building.', 'They were building.', 'The house built.'], ans: 0, exp: 'Passado passivo: was/were + particípio.' },
        { q: '"English _____ all over the world."', ctx: '', opts: ['is spoken', 'speaks', 'is speaking', 'was speak'], ans: 0, exp: 'Presente passivo: is/are + particípio.' },
        { q: 'A voz passiva enfatiza:', ctx: '', opts: ['O objeto da ação', 'Quem fez', 'O tempo', 'O lugar'], ans: 0, exp: 'Passiva foca no objeto.' },
        { q: 'Futuro passivo de "They will deliver it":', ctx: '', opts: ['It will be delivered.', 'It will delivered.', 'It is being delivered.', 'It was delivered.'], ans: 0, exp: 'Futuro passivo: will be + particípio.' },
        { q: '"Three people were arrested." Quem?', ctx: '', opts: ['Três pessoas', 'A polícia', 'Ninguém', 'Um suspeito'], ans: 0, exp: 'Were arrested = foram presos.' },
        { q: 'Qual está na voz passiva?', ctx: '', opts: ['The report was written by Ana.', 'Ana wrote the report.', 'Ana is writing.', 'Ana had written it.'], ans: 0, exp: '"Was written" = voz passiva.' },
      ]
    },
    {
      title: 'Reported Speech',
      sub: 'He said that...',
      icon: '💬',
      done: false,
      explanation: 'O tempo verbal recua um grau, pronomes mudam. "I am tired" → She said she was tired. "I will call" → He said he would call.',
      tip: '"Told" precisa de objeto: told me, told her. "Said" não precisa de objeto.',
      examples: [
        { en: 'She said she was tired.', pt: 'Ela disse que estava cansada.' },
        { en: 'He told me he would call later.', pt: 'Ele me disse que ligaria mais tarde.' },
        { en: 'They asked if I could help them.', pt: 'Perguntaram se eu poderia ajudá-los.' },
      ],
      q: [
        { q: '"I am happy." → She said she _____ happy.', ctx: '', opts: ['was', 'is', 'were', 'had been'], ans: 0, exp: 'Presente → passado no reported speech.' },
        { q: '"I will help." → He said he _____ help.', ctx: '', opts: ['would', 'will', 'could', 'should'], ans: 0, exp: 'Will → would.' },
        { q: 'Diferença said/told:', ctx: '', opts: ['told precisa de objeto', 'São idênticos', 'said é mais formal', 'told é mais antigo'], ans: 0, exp: '"Told me/her/him". Said não precisa.' },
        { q: '"Are you coming?" → She asked if I _____ coming.', ctx: '', opts: ['was', 'am', 'were', 'is'], ans: 0, exp: 'Perguntas: if/whether + tempo recuado.' },
        { q: 'Como reportar "I can swim":', ctx: '', opts: ['He said he could swim.', 'He said he can swim.', 'He told swim.', 'He said I could swim.'], ans: 0, exp: 'Can → could no reported speech.' },
        { q: '"She _____ me the meeting was cancelled."', ctx: '', opts: ['told', 'said', 'spoke', 'talked'], ans: 0, exp: '"Told me" precisa de objeto.' },
      ]
    },
    {
      title: 'Modal Verbs',
      sub: 'Can, should, must...',
      icon: '⚙️',
      done: false,
      explanation: 'Expressam possibilidade, permissão, obrigação e habilidade. Nunca levam "s" na 3ª pessoa e são seguidos pelo verbo base sem "to".',
      tip: 'Can (habilidade), should (conselho), must (obrigação forte), might (possibilidade baixa).',
      examples: [
        { en: 'You should see a doctor.', pt: 'Você deveria ver um médico.' },
        { en: 'I can speak three languages.', pt: 'Sei falar três idiomas.' },
        { en: 'You must not smoke here.', pt: 'Não pode fumar aqui.' },
      ],
      q: [
        { q: 'Modal para conselho:', ctx: '', opts: ['should', 'must', 'can', 'will'], ans: 0, exp: 'Should = deveria (conselho).' },
        { q: '"She _____ speak French." (habilidade)', ctx: '', opts: ['can', 'must', 'should', 'might'], ans: 0, exp: 'Can = saber fazer, conseguir.' },
        { q: '"Must not" expressa:', ctx: '', opts: ['Proibição', 'Conselho', 'Possibilidade', 'Habilidade'], ans: 0, exp: "Must not = proibição. Don't have to = não é obrigado." },
        { q: '"It might rain." significa:', ctx: '', opts: ['Talvez chova', 'Vai chover', 'Não vai chover', 'Deve chover'], ans: 0, exp: 'Might = talvez (possibilidade baixa).' },
        { q: 'Qual está ERRADA:', ctx: '', opts: ['She musts go now.', 'She must go now.', 'She should go now.', 'She can go now.'], ans: 0, exp: 'Modais nunca levam "s". "She musts" = errado.' },
        { q: '"Would you like coffee?" É:', ctx: '', opts: ['Oferta educada', 'Ordem', 'Permissão', 'Obrigação'], ans: 0, exp: '"Would you like?" = oferta educada.' },
      ]
    },
    {
      title: 'Simple Past vs Present Perfect',
      sub: 'I went vs I have gone...',
      icon: '⏳',
      done: false,
      explanation: 'Simple Past: ação em tempo definido. Present Perfect: experiência sem tempo definido ou com impacto no presente.',
      tip: 'Com marcador de tempo definido (yesterday, last week, in 2020): Simple Past. Sem marcador: considere Present Perfect.',
      examples: [
        { en: 'I visited London last summer. (Simple Past)', pt: 'Visitei Londres no verão passado.' },
        { en: 'I have visited London twice. (Present Perfect)', pt: 'Já visitei Londres duas vezes.' },
        { en: 'Have you eaten yet?', pt: 'Você já comeu?' },
      ],
      q: [
        { q: 'Com "last year" — qual tempo?', ctx: '"I _____ to Japan last year."', opts: ['went', 'have gone', 'go', 'have went'], ans: 0, exp: 'Tempo definido = Simple Past.' },
        { q: 'Para experiência de vida:', ctx: '"_____ you ever eaten frog?"', opts: ['Have', 'Did', 'Do', 'Were'], ans: 0, exp: 'Experiência de vida = Present Perfect.' },
        { q: '"She has lost her keys." implica:', ctx: '', opts: ['Ainda não achou', 'Perdeu no passado', 'Já achou', 'Vai perder'], ans: 0, exp: 'Present Perfect = impacto no presente.' },
        { q: 'Qual está correta?', ctx: '', opts: ['I saw this film yesterday.', 'I have seen this film yesterday.', 'I have saw it yesterday.', 'I did see it yesterday.'], ans: 0, exp: 'Com "yesterday": Simple Past.' },
        { q: '"I have never tried Indian food." Qual tempo?', ctx: '', opts: ['Present Perfect', 'Simple Past', 'Simple Present', 'Past Perfect'], ans: 0, exp: '"Never" + experiência = Present Perfect.' },
        { q: 'Como perguntar sobre experiência de vida:', ctx: '', opts: ['Have you ever been to Japan?', 'Did you go to Japan?', 'Were you in Japan?', 'Do you go to Japan?'], ans: 0, exp: '"Have you ever been?" = experiência de vida.' },
      ]
    },
    {
      title: 'Preposições de tempo e lugar',
      sub: 'In, on, at, since, for...',
      icon: '📍',
      done: false,
      explanation: 'AT para momentos precisos. ON para dias e superfícies. IN para períodos longos e espaços fechados.',
      tip: 'Regra: IN (mês, ano, estação) / ON (dia, data) / AT (hora, night).',
      examples: [
        { en: 'I was born in 1990, on a Tuesday, at 3am.', pt: 'Nasci em 1990, numa terça, às 3h.' },
        { en: 'She lives at 42 Oak Street, in London.', pt: 'Ela mora na Rua Oak 42, em Londres.' },
        { en: 'The meeting is on Monday at 9am.', pt: 'A reunião é na segunda às 9h.' },
      ],
      q: [
        { q: '"I was born _____ 1995."', ctx: '', opts: ['in', 'on', 'at', 'during'], ans: 0, exp: 'IN = anos, meses, estações.' },
        { q: '"The party is _____ Friday."', ctx: '', opts: ['on', 'in', 'at', 'by'], ans: 0, exp: 'ON = dias da semana e datas.' },
        { q: '"The class starts _____ 8am."', ctx: '', opts: ['at', 'in', 'on', 'by'], ans: 0, exp: 'AT = horas específicas.' },
        { q: '"She lives _____ Brazil."', ctx: '', opts: ['in', 'at', 'on', 'by'], ans: 0, exp: 'IN para países e cidades.' },
        { q: '"The keys are _____ the table."', ctx: '', opts: ['on', 'in', 'at', 'above'], ans: 0, exp: 'ON = superfície.' },
        { q: '"I will be ready _____ 10 minutes."', ctx: '', opts: ['in', 'on', 'at', 'after'], ans: 0, exp: 'IN + futuro = daqui a.' },
      ]
    },
    {
      title: 'Question Words',
      sub: 'Who, what, where, when, why...',
      icon: '❓',
      done: false,
      explanation: 'Perguntas em inglês exigem inversão: auxiliar + sujeito + verbo. "You like pizza" → "Do you like pizza?"',
      tip: 'Who (quem), What (o quê), Where (onde), When (quando), Why (por quê), How (como), Which (qual), Whose (de quem).',
      examples: [
        { en: 'Where do you live?', pt: 'Onde você mora?' },
        { en: 'Why did she leave so early?', pt: 'Por que ela foi embora tão cedo?' },
        { en: 'How long have you been studying?', pt: 'Há quanto tempo você estuda?' },
      ],
      q: [
        { q: '"Onde você trabalha?" em inglês:', ctx: '', opts: ['Where do you work?', 'Where you work?', 'Where works you?', 'Do you work where?'], ans: 0, exp: 'WH + auxiliar + sujeito + verbo.' },
        { q: '"_____ is your favorite movie?"', ctx: '', opts: ['What', 'Which', 'Who', 'How'], ans: 0, exp: 'What = o quê/qual (aberto).' },
        { q: '"_____ are you crying?"', ctx: '', opts: ['Why', 'How', 'What', 'When'], ans: 0, exp: 'Why = por quê.' },
        { q: '"How much" vs "How many":', ctx: '', opts: ['much = incontável / many = contável', 'many = incontável / much = contável', 'São idênticos', 'much = formal'], ans: 0, exp: 'How much = incontável. How many = contável.' },
        { q: '"Whose bag is this?" significa:', ctx: '', opts: ['De quem é essa bolsa?', 'Qual bolsa?', 'Onde está?', 'Quando comprou?'], ans: 0, exp: 'Whose = de quem.' },
        { q: 'Como perguntar a duração:', ctx: '', opts: ['How long does it take?', 'How much time is?', 'What time does it take?', 'How far takes?'], ans: 0, exp: '"How long does it take?" = Quanto tempo leva?' },
      ]
    },
    {
      title: 'Vocabulário de saúde',
      sub: 'Symptoms, medicine, doctor...',
      icon: '🏥',
      done: false,
      explanation: '"I have a fever/headache/stomachache." "I feel sick." "I am allergic to..."',
      tip: '"Call an ambulance!" = chame uma ambulância. "I need a doctor." = Preciso de um médico.',
      examples: [
        { en: 'I have a high fever and a sore throat.', pt: 'Estou com febre alta e dor de garganta.' },
        { en: 'The doctor prescribed antibiotics.', pt: 'O médico prescreveu antibióticos.' },
        { en: 'I am allergic to penicillin.', pt: 'Sou alérgico à penicilina.' },
      ],
      q: [
        { q: 'Como dizer "Estou com febre":', ctx: '', opts: ['I have a fever.', 'I am fever.', 'My body is fever.', 'I feel fever.'], ans: 0, exp: '"I have a fever" — usa-se "have" para sintomas.' },
        { q: '"Prescription" é:', ctx: '', opts: ['Receita médica', 'Diagnóstico', 'Cirurgia', 'Exame'], ans: 0, exp: 'Prescription = receita médica.' },
        { q: 'Como dizer que é alérgico:', ctx: '', opts: ['I am allergic to...', 'I have allergy of...', 'I allergic to...', 'Allergy: yes.'], ans: 0, exp: '"I am allergic to [something]."' },
        { q: '"Symptoms" significa:', ctx: '', opts: ['Sintomas', 'Remédios', 'Alergias', 'Vacinas'], ans: 0, exp: 'Symptoms = sintomas. Medication = remédio.' },
        { q: '"I feel dizzy." significa:', ctx: '', opts: ['Estou com tontura', 'Estou com fome', 'Estou cansado', 'Estou com frio'], ans: 0, exp: 'Dizzy = tonto/vertiginoso.' },
        { q: 'Como pedir socorro:', ctx: '', opts: ['Call an ambulance, please!', 'I need ambulance.', 'Ambulance now!', 'Help me ambulance!'], ans: 0, exp: '"Call an ambulance!" = padrão de socorro.' },
      ]
    },
    {
      title: 'Comparativos e superlativos',
      sub: 'Bigger, the biggest...',
      icon: '📊',
      done: false,
      explanation: 'Curtos (1-2 sílabas): + er/est. Longos (3+ sílabas): more/most. Irregulares: good→better→best, bad→worse→worst.',
      tip: '"As + adjetivo + as" = tão...quanto. "He is as tall as his father."',
      examples: [
        { en: 'This coffee is stronger than that one.', pt: 'Este café é mais forte que aquele.' },
        { en: 'She is the most intelligent in the class.', pt: 'Ela é a mais inteligente da turma.' },
        { en: 'Today is worse than yesterday.', pt: 'Hoje está pior que ontem.' },
      ],
      q: [
        { q: 'Comparativo de "tall":', ctx: '', opts: ['taller', 'more tall', 'tallest', 'most tall'], ans: 0, exp: 'Curtos: + er. Tall → taller.' },
        { q: 'Superlativo de "beautiful":', ctx: '', opts: ['the most beautiful', 'the beautifulest', 'more beautiful', 'the beautifuller'], ans: 0, exp: 'Longo: the most + adjetivo.' },
        { q: 'Comparativo de "good":', ctx: '', opts: ['better', 'gooder', 'more good', 'best'], ans: 0, exp: 'Good → better → the best. Irregular.' },
        { q: 'Como dizer "tão alto quanto":', ctx: '', opts: ['as tall as', 'so tall as', 'more tall than', 'as tall than'], ans: 0, exp: 'As + adjetivo + as = tão...quanto.' },
        { q: '"The worst" é superlativo de:', ctx: '', opts: ['Bad', 'Good', 'Far', 'Old'], ans: 0, exp: 'Bad → worse → the worst.' },
        { q: '"This exam is _____ than the last."', ctx: 'O exame foi mais difícil...', opts: ['more difficult', 'difficulter', 'most difficult', 'the most difficult'], ans: 0, exp: 'Difficult (3 sílabas): more difficult.' },
      ]
    },
    {
      title: 'Tecnologia e internet',
      sub: 'Download, update, app...',
      icon: '💻',
      done: false,
      explanation: '"Log in" = entrar. "Log out" = sair. "Sign up" = cadastrar. "Crash" = travou. "Bug" = erro. "The site is down" = fora do ar.',
      tip: '"Back up" = fazer backup. "Update" = atualizar. "Spam" = e-mail indesejado.',
      examples: [
        { en: 'The app crashed and I lost all my data.', pt: 'O app travou e perdi todos os dados.' },
        { en: 'You need to update your software.', pt: 'Você precisa atualizar seu software.' },
        { en: 'I will send you the file via email.', pt: 'Vou te mandar o arquivo por e-mail.' },
      ],
      q: [
        { q: '"Crash" significa:', ctx: '', opts: ['Travou/parou de funcionar', 'Acelerou', 'Foi atualizado', 'Foi desligado'], ans: 0, exp: 'Crash = travar inesperadamente.' },
        { q: '"Log out" significa:', ctx: '', opts: ['Sair da conta', 'Entrar', 'Se cadastrar', 'Esqueci a senha'], ans: 0, exp: 'Log out = sair. Log in = entrar.' },
        { q: '"Bandwidth" é:', ctx: '', opts: ['Largura de banda/velocidade', 'Tamanho do arquivo', 'Memória', 'Espaço no disco'], ans: 0, exp: 'Bandwidth = largura de banda.' },
        { q: 'Como dizer "fazer backup":', ctx: '', opts: ['Back up your files.', 'Copy all files.', 'Save files again.', 'Duplicate data.'], ans: 0, exp: '"Back up" = fazer backup.' },
        { q: '"The website is down." significa:', ctx: '', opts: ['Fora do ar', 'Lento', 'Atualizado', 'Deletado'], ans: 0, exp: '"Down" = fora do ar, indisponível.' },
        { q: '"Phishing" é:', ctx: '', opts: ['Golpe para roubar dados', 'Tipo de vírus', 'Software desatualizado', 'Spam'], ans: 0, exp: 'Phishing = golpe para roubar senhas/dados.' },
      ]
    },
    {
      title: 'Conectivos e coesão',
      sub: 'However, although, therefore...',
      icon: '🔗',
      done: false,
      explanation: 'Conectivos mostram relações lógicas entre ideias. Essenciais para falar e escrever com fluência.',
      tip: 'Contraste: however, although, despite. Adição: moreover, furthermore. Conclusão: therefore, as a result.',
      examples: [
        { en: 'He studied hard. However, he failed.', pt: 'Estudou muito. No entanto, foi reprovado.' },
        { en: 'Although it rained, we went for a walk.', pt: 'Embora chovesse, fomos caminhar.' },
        { en: 'She was tired. Therefore, she slept early.', pt: 'Ela estava cansada. Por isso, dormiu cedo.' },
      ],
      q: [
        { q: 'Para contraste:', ctx: '"He is rich. _____, he is unhappy."', opts: ['However', 'Therefore', 'Moreover', 'Besides'], ans: 0, exp: 'However = no entanto, porém.' },
        { q: '"Although" introduz:', ctx: '', opts: ['Contraste/concessão', 'Causa', 'Conclusão', 'Adição'], ans: 0, exp: 'Although = embora. Contraste dentro da frase.' },
        { q: '"Therefore" significa:', ctx: '', opts: ['Portanto/por isso', 'No entanto', 'Além disso', 'Embora'], ans: 0, exp: 'Therefore = portanto, causa e efeito.' },
        { q: 'Para adicionar informação positiva:', ctx: '', opts: ['Moreover', 'However', 'Although', 'Therefore'], ans: 0, exp: 'Moreover/Furthermore = além disso.' },
        { q: '"Despite" é seguido de:', ctx: '', opts: ['Substantivo/pronome', 'Oração com verbo', 'Adjetivo', 'Advérbio'], ans: 0, exp: '"Despite" + substantivo. "Although" + oração.' },
        { q: '"As a result" indica:', ctx: '', opts: ['Consequência', 'Contraste', 'Adição', 'Concessão'], ans: 0, exp: '"As a result" = consequentemente.' },
      ]
    },
    {
      title: 'Vocabulário para viagens',
      sub: 'Airport, hotel, customs...',
      icon: '✈️',
      done: false,
      explanation: '"Check in" = chegada. "Check out" = saída. "Carry-on" = bagagem de mão. "Layover" = escala. "Boarding pass" = cartão de embarque.',
      tip: '"The flight is delayed" = atrasado. "Cancelled" = cancelado. "On time" = no horário.',
      examples: [
        { en: 'My flight has a two-hour layover in Miami.', pt: 'Meu voo tem escala de 2h em Miami.' },
        { en: 'Can I have a window seat, please?', pt: 'Posso ter assento na janela?' },
        { en: 'Do you have anything to declare?', pt: 'Você tem algo a declarar?' },
      ],
      q: [
        { q: '"Boarding pass" é:', ctx: '', opts: ['Cartão de embarque', 'Passaporte', 'Visto', 'Passagem'], ans: 0, exp: 'Boarding pass = cartão de embarque.' },
        { q: '"Carry-on luggage" é:', ctx: '', opts: ['Bagagem de mão', 'Bagagem despachada', 'Bagagem perdida', 'Bagagem extra'], ans: 0, exp: 'Carry-on = mão. Checked luggage = despachada.' },
        { q: '"Customs" é:', ctx: '', opts: ['Alfândega', 'Imigração', 'Embarque', 'Desembarque'], ans: 0, exp: 'Customs = alfândega. Immigration = imigração.' },
        { q: 'Como pedir late check-out:', ctx: '', opts: ['Can I have a late check-out?', 'I want to stay more.', 'Late please.', 'More time in room.'], ans: 0, exp: '"Can I have a late check-out?" é o padrão.' },
        { q: '"The flight is delayed." significa:', ctx: '', opts: ['O voo está atrasado', 'Cancelado', 'Adiantou', 'Pousou'], ans: 0, exp: 'Delayed = atrasado. Cancelled = cancelado.' },
        { q: 'Como dizer "minha mala foi perdida":', ctx: '', opts: ['My luggage was lost.', 'I lose my luggage.', 'My bag is missing.', 'A e C corretas'], ans: 3, exp: '"My luggage was lost" e "My bag is missing" são ambas corretas.' },
      ]
    },
    {
      title: 'Make vs Do',
      sub: 'Make a cake, do homework...',
      icon: '🛠️',
      done: false,
      explanation: 'MAKE = criar, produzir algo. DO = realizar, executar uma atividade.',
      tip: 'Make: mistake, decision, money, progress, friends. Do: homework, exercise, business, dishes, research.',
      examples: [
        { en: 'I made a big mistake at work.', pt: 'Cometi um erro grande no trabalho.' },
        { en: 'Can you do me a favor?', pt: 'Você pode me fazer um favor?' },
        { en: 'She makes a lot of money.', pt: 'Ela ganha muito dinheiro.' },
      ],
      q: [
        { q: '"_____ a decision":', ctx: '', opts: ['Make', 'Do', 'Both', 'Neither'], ans: 0, exp: 'Make a decision = tomar uma decisão.' },
        { q: '"_____ homework":', ctx: '', opts: ['Do', 'Make', 'Both', 'Neither'], ans: 0, exp: 'Do homework = fazer lição de casa.' },
        { q: 'Como dizer "Cometi um erro":', ctx: '', opts: ['I made a mistake.', 'I did a mistake.', 'I made an error.', 'A e C corretas'], ans: 3, exp: '"Make a mistake" e "make an error" são ambos corretos.' },
        { q: '"_____ me a favor":', ctx: '', opts: ['do', 'make', 'give', 'get'], ans: 0, exp: '"Do someone a favor."' },
        { q: '"She is _____ progress."', ctx: '', opts: ['making', 'doing', 'having', 'getting'], ans: 0, exp: '"Make progress" = avançar.' },
        { q: '"I need to _____ the dishes."', ctx: '', opts: ['do / wash (ambos corretos)', 'make', 'clean only', 'fix'], ans: 0, exp: '"Do/wash the dishes" = ambos corretos.' },
      ]
    },
    {
      title: 'Inglês informal e gírias',
      sub: 'Awesome, hang out, chill...',
      icon: '😎',
      done: false,
      explanation: 'O inglês falado entre amigos é muito diferente do formal. Essencial para entender filmes, séries e conversar com nativos.',
      tip: '"Awesome" = incrível. "Hang out" = sair juntos. "ASAP" = o mais rápido possível. "Under the weather" = mal/doente.',
      examples: [
        { en: 'That movie was absolutely awesome!', pt: 'Esse filme foi absolutamente incrível!' },
        { en: "Let's hang out this weekend.", pt: 'Vamos sair juntos esse fim de semana.' },
        { en: 'Just chill — everything will be fine.', pt: 'Relaxa — vai ficar tudo bem.' },
      ],
      q: [
        { q: '"Awesome" significa:', ctx: '', opts: ['Incrível', 'Terrível', 'Estranho', 'Normal'], ans: 0, exp: 'Awesome = incrível, sensacional.' },
        { q: '"Hang out" significa:', ctx: '', opts: ['Sair juntos', 'Pendurar algo', 'Ir embora', 'Trabalhar'], ans: 0, exp: 'Hang out = sair juntos, passar tempo.' },
        { q: '"ASAP" significa:', ctx: '', opts: ['O mais rápido possível', 'Quando puder', 'Amanhã', 'Urgente'], ans: 0, exp: 'ASAP = As Soon As Possible.' },
        { q: '"Under the weather" significa:', ctx: '', opts: ['Mal/doente', 'Com calor', 'Ansioso', 'Animado'], ans: 0, exp: '"Under the weather" = sentindo-se mal.' },
        { q: '"To ghost someone" significa:', ctx: '', opts: ['Sumir sem explicação', 'Assustar', 'Mentir', 'Ignorar'], ans: 0, exp: 'Ghost = sumir da vida de alguém sem avisar.' },
        { q: '"No worries!" equivale a:', ctx: '', opts: ['Sem problema! / De nada!', 'Cuidado!', 'Não tenho certeza.', 'Que pena!'], ans: 0, exp: '"No worries!" = sem problema, não tem de quê.' },
      ]
    },
  ],
  advanced: [
    {
      title: 'Expressões idiomáticas',
      sub: 'Hit the nail on the head...',
      icon: '🎯',
      done: false,
      explanation: 'Idioms têm significado que NÃO pode ser deduzido das palavras. Aprenda como um bloco, nunca literalmente.',
      tip: '"Raining cats and dogs" = chovendo muito. "Hit the nail on the head" = acertar em cheio.',
      examples: [
        { en: "It's raining cats and dogs!", pt: 'Está chovendo muito!' },
        { en: 'She hit the nail on the head.', pt: 'Ela acertou em cheio.' },
        { en: "Don't beat around the bush.", pt: 'Não enrole.' },
      ],
      q: [
        { q: '"Raining cats and dogs" =', ctx: '', opts: ['Chovendo muito', 'Animais caindo', 'Tempo bom', 'Garoa'], ans: 0, exp: '"Raining cats and dogs" = chovendo muito.' },
        { q: '"Bit off more than she could chew."', ctx: '', opts: ['Assumiu mais do que aguentava', 'Comeu demais', 'Recusou oportunidade', 'Mentiu'], ans: 0, exp: 'Bite off more than you can chew = se comprometer demais.' },
        { q: '"Beat around the bush" =', ctx: '', opts: ['Enrolar, não ir ao ponto', 'Bater em arbustos', 'Falar alto', 'Demorar'], ans: 0, exp: 'Beat around the bush = enrolar, não ser direto.' },
        { q: '"Let\'s hit the road!" =', ctx: '', opts: ['Vamos embora', 'Bater na estrada', 'Parar aqui', 'Dirigir devagar'], ans: 0, exp: '"Hit the road" = partir, ir embora.' },
        { q: '"She has a lot on her plate."', ctx: '', opts: ['Está sobrecarregada', 'Está comendo muito', 'Problemas de saúde', 'Está feliz'], ans: 0, exp: '"A lot on your plate" = muito para resolver.' },
        { q: '"He passed the buck."', ctx: '', opts: ['Jogou a responsabilidade para outro', 'Passou dinheiro', 'Ajudou alguém', 'Culpou o cliente'], ans: 0, exp: '"Pass the buck" = transferir responsabilidade.' },
      ]
    },
    {
      title: 'Vocabulário para negócios',
      sub: 'Meetings, deadlines, deals...',
      icon: '💼',
      done: false,
      explanation: 'Business English tem vocabulário específico. Dominar abre portas no mercado internacional.',
      tip: '"I hope this email finds you well." Discordar: "I see your point, however..."',
      examples: [
        { en: 'We need to meet the deadline by Friday.', pt: 'Precisamos cumprir o prazo até sexta.' },
        { en: "Let's schedule a meeting.", pt: 'Vamos agendar uma reunião.' },
        { en: 'We closed the deal with the new client.', pt: 'Fechamos o negócio com o novo cliente.' },
      ],
      q: [
        { q: '"Deadline" é:', ctx: '', opts: ['Prazo final', 'Reunião', 'Contrato', 'Meta'], ans: 0, exp: 'Deadline = prazo final.' },
        { q: '"Reschedule the meeting" =', ctx: '', opts: ['Remarcar', 'Cancelar', 'Começar', 'Encerrar'], ans: 0, exp: 'Reschedule = remarcar, reagendar.' },
        { q: '"Close the deal" =', ctx: '', opts: ['Fechar o negócio', 'Fazer o negócio', 'Assinar', 'Discutir'], ans: 0, exp: '"Close the deal" = expressão padrão.' },
        { q: '"Bottom line" =', ctx: '', opts: ['O ponto principal', 'Linha do contrato', 'Lucro bruto', 'Última página'], ans: 0, exp: '"Bottom line" = o que realmente importa.' },
        { q: '"Think outside the box" =', ctx: '', opts: ['Pensar criativamente', 'Sair da sala', 'Usar caixa diferente', 'Trabalhar fora'], ans: 0, exp: '"Think outside the box" = pensar de forma inovadora.' },
        { q: 'Como responder formalmente a e-mail:', ctx: '', opts: ['Thank you for reaching out. I will get back to you shortly.', 'Thanks. Will answer later.', 'Got it.', 'OK.'], ans: 0, exp: '"Thank you for reaching out" = profissional e educado.' },
      ]
    },
    {
      title: 'False Friends',
      sub: 'Actually, pretend, push...',
      icon: '🪤',
      done: false,
      explanation: 'Palavras parecidas com o português mas com significados completamente diferentes. Uma das maiores armadilhas para brasileiros.',
      tip: 'Mais perigosos: actually (na verdade), college (faculdade), sensible (sensato), push (empurrar), eventually (em algum momento).',
      examples: [
        { en: "Actually, I'm happy — not angry.", pt: 'Na verdade, estou feliz — não bravo.' },
        { en: 'He pretended to be sick.', pt: 'Ele fingiu estar doente.' },
        { en: 'She is very sensible — never overreacts.', pt: 'Ela é muito sensata.' },
      ],
      q: [
        { q: '"Actually" =', ctx: '', opts: ['Na verdade', 'Atualmente', 'Normalmente', 'Recentemente'], ans: 0, exp: 'Actually = na verdade. Currently = atualmente.' },
        { q: '"He pretended to know."', ctx: '', opts: ['Fingiu saber', 'Pretendia saber', 'Tentou saber', 'Afirmou saber'], ans: 0, exp: 'Pretend = fingir. To intend = pretender.' },
        { q: '"College" (EUA) é:', ctx: '', opts: ['Faculdade', 'Colégio', 'Cursinho', 'Pós-graduação'], ans: 0, exp: 'College = faculdade. High school = colégio.' },
        { q: '"Sensible" =', ctx: '', opts: ['Sensato/racional', 'Sensível', 'Sério', 'Inteligente'], ans: 0, exp: 'Sensible = sensato. Sensitive = sensível.' },
        { q: 'Placa "PUSH" = fazer o quê?', ctx: '', opts: ['Empurrar', 'Puxar', 'Apertar', 'Esperar'], ans: 0, exp: 'Push = empurrar. Pull = puxar.' },
        { q: '"Eventually" =', ctx: '', opts: ['Em algum momento', 'Imediatamente', 'Logo', 'Talvez'], ans: 0, exp: 'Eventually = em algum momento futuro (certeza).' },
      ]
    },
    {
      title: 'Escrita formal e acadêmica',
      sub: 'Essays, reports, emails...',
      icon: '✍️',
      done: false,
      explanation: 'Sem contrações, vocabulário sofisticado, conectivos lógicos e tom impessoal. Essencial para e-mails profissionais e relatórios.',
      tip: 'Furthermore (além disso), However (no entanto), Therefore (portanto), In conclusion (em conclusão).',
      examples: [
        { en: 'Furthermore, the data suggests a significant increase.', pt: 'Além disso, os dados sugerem aumento significativo.' },
        { en: 'However, this has several limitations.', pt: 'No entanto, isso tem várias limitações.' },
        { en: 'I am writing to inquire about the position.', pt: 'Escrevo para perguntar sobre a vaga.' },
      ],
      q: [
        { q: 'Qual é mais formal:', ctx: '', opts: ['I am writing to inquire about your services.', "Hey, I wanna know stuff.", 'Just checking.', 'Tell me?'], ans: 0, exp: '"I am writing to inquire" = tom formal, sem contrações.' },
        { q: '"Furthermore" =', ctx: '', opts: ['Além disso', 'No entanto', 'Portanto', 'Em contraste'], ans: 0, exp: 'Furthermore = além disso. Moreover é sinônimo.' },
        { q: 'Conectivo para conclusão:', ctx: '', opts: ['In conclusion', 'Furthermore', 'However', 'In contrast'], ans: 0, exp: '"In conclusion" encerra o argumento.' },
        { q: 'Por que evitar contrações no formal:', ctx: '', opts: ['São informais', 'Estão erradas', 'São longas', 'Confundem'], ans: 0, exp: "Contrações (don't) = informais. Use: do not." },
        { q: '"However" indica:', ctx: '', opts: ['Contraste', 'Adição', 'Conclusão', 'Causa'], ans: 0, exp: 'However = no entanto, contraste.' },
        { q: 'Como começar e-mail formal sem saber o nome:', ctx: '', opts: ['Dear Sir or Madam,', 'Hello there,', 'To whoever,', 'Hi,'], ans: 0, exp: '"Dear Sir or Madam" é o padrão formal.' },
      ]
    },
    {
      title: 'Subjuntivo em inglês',
      sub: 'I wish, if only, it is important that...',
      icon: '🌀',
      done: false,
      explanation: 'Aparece após "wish", "if only", "would rather", "it is important/essential that". Com wish no presente usa-se WERE para todas as pessoas.',
      tip: '"I wish I were" (não "was") — WERE para todas as pessoas no subjuntivo com wish.',
      examples: [
        { en: 'I wish I were taller.', pt: 'Eu queria ser mais alto.' },
        { en: 'If only I had studied harder!', pt: 'Se ao menos eu tivesse estudado mais!' },
        { en: 'It is essential that he be informed.', pt: 'É essencial que ele seja informado.' },
      ],
      q: [
        { q: '"I wish I _____ rich."', ctx: '', opts: ['were', 'was', 'am', 'would be'], ans: 0, exp: 'Com "wish" + presente imaginário: were.' },
        { q: '"If only she _____ here now!"', ctx: '', opts: ['were', 'is', 'will be', 'has been'], ans: 0, exp: '"If only" + were = lamento sobre o presente.' },
        { q: '"I would rather you _____ the truth."', ctx: '', opts: ['told', 'tell', 'would tell', 'tells'], ans: 0, exp: '"Would rather + sujeito + passado" = preferência.' },
        { q: '"I wish I had studied" expressa:', ctx: '', opts: ['Arrependimento sobre o passado', 'Desejo no presente', 'Plano futuro', 'Conselho'], ans: 0, exp: '"Wish + past perfect" = arrependimento.' },
        { q: '"It is crucial that she _____ on time."', ctx: '', opts: ['be', 'is', 'was', 'will be'], ans: 0, exp: 'Subjuntivo formal: "that she be" (verbo base).' },
        { q: '"If only I _____ more money last year!"', ctx: '', opts: ['had saved', 'saved', 'have saved', 'would save'], ans: 0, exp: '"If only + past perfect" = lamento sobre o passado.' },
      ]
    },
    {
      title: 'Vocabulário acadêmico (AWL)',
      sub: 'Analyze, hypothesis, conclude...',
      icon: '🎓',
      done: false,
      explanation: 'O Academic Word List (AWL) são as palavras mais usadas em textos acadêmicos. Essencial para artigos, teses e comunicação científica.',
      tip: 'Frequentes: analyze, concept, establish, indicate, significant, structure, theory, vary, evidence, conclude.',
      examples: [
        { en: 'The study indicates a significant correlation.', pt: 'O estudo indica uma correlação significativa.' },
        { en: 'We need to analyze the data before concluding.', pt: 'Precisamos analisar os dados antes de concluir.' },
        { en: 'The hypothesis was not supported by the evidence.', pt: 'A hipótese não foi sustentada pelas evidências.' },
      ],
      q: [
        { q: '"Analyze" =', ctx: '', opts: ['Analisar', 'Criar', 'Resumir', 'Publicar'], ans: 0, exp: 'Analyze = analisar. Summarize = resumir.' },
        { q: '"The results are significant." =', ctx: '', opts: ['Os resultados são relevantes', 'São pequenos', 'São negativos', 'São provisórios'], ans: 0, exp: 'Significant = significativo, relevante.' },
        { q: '"Hypothesis" é:', ctx: '', opts: ['Hipótese', 'Conclusão', 'Método', 'Resultado'], ans: 0, exp: 'Hypothesis = hipótese. Conclusion = conclusão.' },
        { q: '"Data" em inglês acadêmico formal é:', ctx: '', opts: ['Plural de datum', 'Sempre singular', 'Nunca singular', 'Abreviação'], ans: 0, exp: '"Data" = plural de datum. "The data indicate" = formal correto.' },
        { q: '"To establish a framework" =', ctx: '', opts: ['Estabelecer uma estrutura', 'Criar um problema', 'Desafiar teoria', 'Publicar'], ans: 0, exp: 'Establish = estabelecer. Framework = estrutura.' },
        { q: 'Como expressar que resultados variam:', ctx: '', opts: ['The results vary significantly.', 'The results are different a lot.', 'Results change too much.', 'The results variate.'], ans: 0, exp: '"Vary" = variar. "Variate" não existe.' },
      ]
    },
    {
      title: 'Ironia e sarcasmo',
      sub: 'Yeah, right. Sure...',
      icon: '😏',
      done: false,
      explanation: 'Em inglês, ironia e sarcasmo são muito comuns no humor britânico e americano. O significado é frequentemente o oposto do que as palavras dizem.',
      tip: '"Yeah, right." sarcasticamente = "claro que não". "Oh, great." sarcasticamente = pessimo.',
      examples: [
        { en: '"He is always on time." "Yeah, right!"', pt: '"Ele sempre chega no horário." "Claro, né!" (irônico)' },
        { en: 'Oh, great. Another Monday.', pt: 'Ah, ótimo. Mais uma segunda. (irônico)' },
        { en: '"Good luck with that!"', pt: '"Boa sorte com isso!" (sarcástico)' },
      ],
      q: [
        { q: '"Yeah, right!" sarcasticamente =', ctx: '', opts: ['Não acredito / De jeito nenhum', 'Sim, concordo', 'Que ótimo!', 'Com certeza!'], ans: 0, exp: '"Yeah, right!" sarcasticamente = descrença.' },
        { q: '"Oh, great." após notícia ruim:', ctx: '', opts: ['Significa péssimo (irônico)', 'Significa ótimo', 'Que alívio', 'Não me importo'], ans: 0, exp: 'Tom sarcástico inverte o significado.' },
        { q: '"As if!" geralmente significa:', ctx: '', opts: ['Impossível / De jeito nenhum', 'Talvez', 'Com certeza', 'Não sei'], ans: 0, exp: '"As if!" = de jeito nenhum, impossível.' },
        { q: '"Sure, because THAT always works." O tom indica:', ctx: '', opts: ['Sarcasmo — não funciona', 'Entusiasmo genuíno', 'Dúvida sincera', 'Conselho real'], ans: 0, exp: '"THAT" em maiúsculo = ênfase sarcástica.' },
        { q: 'Como distinguir ironia em texto:', ctx: '', opts: ['Contexto, emojis e pontuação ajudam', 'É sempre impossível', 'Pela gramática', 'Apenas pelas palavras'], ans: 0, exp: 'Contexto é fundamental. Emojis 🙄 e contraste com a situação indicam ironia.' },
        { q: '"I am so happy it is Monday." Provavelmente é:', ctx: '', opts: ['Irônico — não gosta de segunda', 'Sincero — ama trabalhar', 'Neutro', 'Uma pergunta'], ans: 0, exp: 'Culturalmente, segunda = fim do fim de semana. Raramente sincero.' },
      ]
    },
    {
      title: 'Registro formal vs informal',
      sub: 'Can vs May, Want vs Would like...',
      icon: '🎭',
      done: false,
      explanation: 'O que é natural com amigos soa rude numa entrevista. Dominar quando mudar o registro é sinal de fluência real.',
      tip: 'Formal: "I would like to request...", "Could you please...". Informal: "Can I get...", "Hey, could you...".',
      examples: [
        { en: 'Formal: I would like to schedule a meeting.', pt: 'Gostaria de agendar uma reunião.' },
        { en: 'Informal: Can we meet up sometime?', pt: 'A gente pode se encontrar algum dia?' },
        { en: 'Formal: I am afraid I cannot attend.', pt: 'Lamento, mas não poderei comparecer.' },
      ],
      q: [
        { q: 'Qual é mais formal:', ctx: '', opts: ['Could you please send me the report?', 'Can you send me the report?', 'Send me the report.', 'I need the report.'], ans: 0, exp: '"Could you please" é mais formal e educado.' },
        { q: 'Versão formal de "I want to apply for the job":', ctx: '', opts: ['I would like to apply for the position.', 'I wanna apply.', 'I am interested in the job.', 'Give me the application.'], ans: 0, exp: '"I would like" + "position" = registro profissional.' },
        { q: '"I am afraid I cannot attend." Em informal:', ctx: '', opts: ["Sorry, I can't make it.", "I will not go.", "I do not want to come.", "Not possible."], ans: 0, exp: '"I am afraid" = formal. "I can\'t make it" = casual.' },
        { q: 'Qual é mais informal:', ctx: '', opts: ['Got it!', 'I have understood.', 'I acknowledge your message.', 'Message received.'], ans: 0, exp: '"Got it!" é muito informal.' },
        { q: 'Em e-mail formal para desconhecido, você usa:', ctx: '', opts: ['Dear Mr./Ms. [Surname],', 'Hey [First Name],', 'Hi there,', 'To whoever,'], ans: 0, exp: '"Dear Mr./Ms. [Surname]" é o padrão formal.' },
        { q: '"FYI" é:', ctx: '', opts: ['Informal / Para sua informação', 'Formal e profissional', 'Gíria britânica', 'Erro de inglês'], ans: 0, exp: 'FYI = For Your Information. Informal/semi-formal.' },
      ]
    },
    {
      title: 'Discourse Markers',
      sub: 'Well, actually, you know, I mean...',
      icon: '🗣️',
      done: false,
      explanation: 'Discourse markers organizam o discurso, ganham tempo para pensar e mostram engajamento. Nativos os usam constantemente na fala.',
      tip: 'Para pensar: "Well...", "Let me think...". Para corrigir: "I mean...", "What I am trying to say is...". Para concordar: "Exactly!", "Right!".',
      examples: [
        { en: 'Well, I think we should consider all options.', pt: 'Bom, acho que deveríamos considerar tudo.' },
        { en: "I mean, it is not that simple.", pt: 'Quer dizer, não é tão simples.' },
        { en: "You know what I mean?", pt: 'Você entende o que quero dizer?' },
      ],
      q: [
        { q: '"Well..." no início de uma resposta indica:', ctx: '', opts: ['O falante está pensando/hesitando', 'O falante discorda', 'O falante não entendeu', 'O falante está com raiva'], ans: 0, exp: '"Well" = pausa para pensar, ganhar tempo.' },
        { q: '"I mean" serve para:', ctx: '', opts: ['Esclarecer ou corrigir o que disse', 'Concordar', 'Mudar de assunto', 'Finalizar'], ans: 0, exp: '"I mean" = quer dizer, ou seja. Esclarecer/reformular.' },
        { q: '"You know?" no final busca:', ctx: '', opts: ['Confirmação/acordo do ouvinte', 'Uma resposta específica', 'Mostrar incerteza', 'Finalizar'], ans: 0, exp: '"You know?" busca conexão, como o "né?" brasileiro.' },
        { q: '"Actually" como discourse marker:', ctx: '"Actually, I think you are wrong."', opts: ['Introduz correção ou contraste', 'Concordar', 'Mudar de assunto', 'Pedir informação'], ans: 0, exp: '"Actually" = na verdade. Corrige ou contrasta.' },
        { q: '"To be honest..." indica:', ctx: '', opts: ['Vai dizer algo mais sincero/direto', 'Não tem certeza', 'Está mudando de assunto', 'Está sendo irônico'], ans: 0, exp: '"To be honest" sinaliza opinião mais franca.' },
        { q: 'Qual NÃO é um discourse marker típico:', ctx: '', opts: ['Therefore', 'Well', 'You know', 'I mean'], ans: 0, exp: '"Therefore" é conectivo lógico/formal, não discourse marker da fala.' },
      ]
    },
    {
      title: 'Phrasal verbs avançados',
      sub: 'Put up with, come across, set up...',
      icon: '🔧',
      done: false,
      explanation: 'Phrasal verbs de 3 partes nunca separam as partículas: "put up with it" (correto), nunca "put it up with".',
      tip: 'Put up with = tolerar. Come across = parecer/encontrar. Fall through = não dar certo. Turn down = recusar.',
      examples: [
        { en: "I can't put up with his rudeness.", pt: 'Não aguento mais a grosseria dele.' },
        { en: 'She came across as very confident.', pt: 'Ela pareceu muito confiante.' },
        { en: 'We need to set up a meeting.', pt: 'Precisamos organizar uma reunião.' },
      ],
      q: [
        { q: '"Put up with" significa:', ctx: '', opts: ['Tolerar/aguentar', 'Colocar em cima', 'Desistir', 'Preparar'], ans: 0, exp: 'Put up with = tolerar, aguentar.' },
        { q: '"She came across as nervous." =', ctx: '', opts: ['Ela pareceu nervosa', 'Ficou nervosa', 'Encontrou alguém nervoso', 'Se sentiu nervosa'], ans: 0, exp: 'Come across as = parecer, dar a impressão de.' },
        { q: '"Set up a meeting" significa:', ctx: '', opts: ['Organizar/marcar uma reunião', 'Cancelar', 'Participar', 'Adiar'], ans: 0, exp: 'Set up = organizar, preparar, montar.' },
        { q: '"The deal fell through." =', ctx: '', opts: ['O negócio não deu certo', 'Foi fechado', 'Foi adiado', 'Cancelado pelos dois lados'], ans: 0, exp: 'Fall through = não dar certo, fracassar.' },
        { q: '"She turned down the offer." =', ctx: '', opts: ['Recusou a oferta', 'Aceitou', 'Considerou', 'Pediu mais tempo'], ans: 0, exp: 'Turn down = recusar, rejeitar.' },
        { q: '"I will look into the matter." =', ctx: '', opts: ['Vou investigar o assunto', 'Vou ignorar', 'Vou resolver agora', 'Vou delegar'], ans: 0, exp: 'Look into = investigar, examinar com cuidado.' },
      ]
    },
    {
      title: 'Inglês para entrevistas',
      sub: 'Strengths, weaknesses, goals...',
      icon: '👔',
      done: false,
      explanation: 'Entrevistas em inglês têm perguntas previsíveis. O método STAR ajuda: Situation, Task, Action, Result.',
      tip: '"Tell me about yourself" = pitch profissional de 1-2 min. "What are your strengths?" = fale de pontos fortes com exemplos.',
      examples: [
        { en: 'My greatest strength is my ability to work under pressure.', pt: 'Meu maior ponto forte é trabalhar sob pressão.' },
        { en: 'I see myself leading a team in five years.', pt: 'Me vejo liderando uma equipe em cinco anos.' },
        { en: 'I am a fast learner and adapt quickly.', pt: 'Aprendo rápido e me adapto facilmente.' },
      ],
      q: [
        { q: 'Como responder "What is your greatest weakness?"', ctx: '', opts: ['Mencione uma fraqueza real e como está melhorando', 'Diga que não tem fraquezas', 'Recuse responder', 'Diga que trabalha demais'], ans: 0, exp: 'Fraqueza real + como está melhorando = honestidade estruturada.' },
        { q: '"Tell me about yourself." Deve incluir:', ctx: '', opts: ['Resumo profissional relevante ao cargo', 'Sua vida pessoal completa', 'Problemas anteriores', 'Apenas formação'], ans: 0, exp: 'Elevator pitch: experiência relevante, conquistas, por que está interessado.' },
        { q: 'Como dizer "Sou bom em trabalhar em equipe":', ctx: '', opts: ['I am a strong team player.', 'I like to work with people.', 'Teams are good for me.', 'I work in teams.'], ans: 0, exp: '"Team player" é a expressão padrão.' },
        { q: 'O que é o método STAR?', ctx: '', opts: ['Situation, Task, Action, Result', 'Skills, Training, Achievement, Recognition', 'Strengths, Teamwork, Ambition, Responsibility', 'Summary, Timeline, Action, Report'], ans: 0, exp: 'STAR = estrutura para perguntas comportamentais.' },
        { q: '"What are your salary expectations?" Como responder:', ctx: '', opts: ['Dê um intervalo baseado no mercado', 'Diga que qualquer valor está bom', 'Recuse responder', 'Pergunte o que oferecem primeiro'], ans: 0, exp: '"Based on my research, I am looking for X to Y range."' },
        { q: '"Do you have any questions for us?" Você deve:', ctx: '', opts: ['Fazer perguntas inteligentes sobre a empresa', 'Dizer que não tem perguntas', 'Perguntar sobre salário imediatamente', 'Agradecer e sair'], ans: 0, exp: 'Sempre tenha 2-3 perguntas. Demonstra interesse genuíno.' },
      ]
    },
    {
      title: 'Sotaques e variações',
      sub: 'American vs British vs Australian...',
      icon: '🌍',
      done: false,
      explanation: 'O inglês varia entre países em vocabulário, pronúncia e até gramática. Conhecer as principais diferenças entre o inglês americano (EUA) e britânico (UK) é essencial.',
      tip: 'Elevator (EUA) = Lift (UK). Apartment (EUA) = Flat (UK). Cookie (EUA) = Biscuit (UK). Soccer (EUA) = Football (UK).',
      examples: [
        { en: 'American: "I live in an apartment on the first floor."', pt: 'Moro num apartamento no primeiro andar.' },
        { en: 'British: "I live in a flat on the ground floor."', pt: 'Moro num flat no rés-do-chão.' },
        { en: 'Australian: "No worries, mate!"', pt: 'Sem problema, amigo!' },
      ],
      q: [
        { q: '"Elevator" (EUA) = qual palavra britânica?', ctx: '', opts: ['Lift', 'Escalator', 'Stairs', 'Floor'], ans: 0, exp: 'Elevator (EUA) = Lift (UK).' },
        { q: '"Apartment" (EUA) em UK é:', ctx: '', opts: ['Flat', 'House', 'Studio', 'Room'], ans: 0, exp: 'Apartment (EUA) = Flat (UK).' },
        { q: '"Soccer" (EUA) em UK é:', ctx: '', opts: ['Football', 'Rugby', 'Cricket', 'Handball'], ans: 0, exp: 'Soccer (EUA) = Football (UK).' },
        { q: '"Autumn" é a palavra britânica para:', ctx: '', opts: ['Outono', 'Primavera', 'Inverno', 'Verão'], ans: 0, exp: 'Autumn (UK) = Fall (EUA) = outono.' },
        { q: '"Cheers!" no UK pode significar:', ctx: '', opts: ['Obrigado / Saúde / Tchau', 'Apenas saúde', 'Apenas obrigado', 'Apenas tchau'], ans: 0, exp: '"Cheers!" no UK = obrigado, saúde, ou tchau. Muito versátil.' },
        { q: '"G\'day mate!" é típico de:', ctx: '', opts: ['Austrália', 'Reino Unido', 'Estados Unidos', 'Irlanda'], ans: 0, exp: '"G\'day" = Good day. Saudação típica australiana.' },
      ]
    },
    {
      title: 'Argumentação e debate',
      sub: 'In my opinion, on the other hand...',
      icon: '⚖️',
      done: false,
      explanation: 'Argumentar em inglês exige vocabulário específico para opinar, concordar, discordar e apresentar contra-argumentos de forma diplomática.',
      tip: 'Opinar: "In my opinion...", "I believe...". Discordar: "I see your point, but...", "I beg to differ...".',
      examples: [
        { en: 'In my opinion, remote work increases productivity.', pt: 'Na minha opinião, o home office aumenta a produtividade.' },
        { en: 'I see your point, but I tend to disagree.', pt: 'Entendo seu ponto, mas tendo a discordar.' },
        { en: 'On the other hand, there are clear disadvantages.', pt: 'Por outro lado, há desvantagens claras.' },
      ],
      q: [
        { q: 'Como expressar opinião formalmente:', ctx: '', opts: ['In my opinion / I believe', 'I think so.', 'For me...', 'My idea is...'], ans: 0, exp: '"In my opinion", "I believe", "From my perspective" = formas formais.' },
        { q: 'Como discordar educadamente:', ctx: '', opts: ['I see your point, but I tend to disagree.', 'You are wrong.', 'That is not right.', 'No, incorrect.'], ans: 0, exp: '"I see your point, but..." = diplomático.' },
        { q: '"I beg to differ." significa:', ctx: '', opts: ['Discordo respeitosamente', 'Concordo completamente', 'Não entendi', 'Preciso de mais informação'], ans: 0, exp: '"I beg to differ" = discordo respeitosamente.' },
        { q: 'Para o outro lado do argumento:', ctx: '', opts: ['On the other hand / However / That said', 'Therefore / As a result', 'Furthermore / Moreover', 'In conclusion / To sum up'], ans: 0, exp: '"On the other hand", "However" = introduzem contraste.' },
        { q: '"That is a valid point." serve para:', ctx: '', opts: ['Reconhecer o argumento do outro', 'Concordar completamente', 'Mudar de assunto', 'Finalizar'], ans: 0, exp: '"That is a valid point" = reconheço o mérito. Diplomático sem concordar totalmente.' },
        { q: 'Como concluir um argumento:', ctx: '', opts: ['In conclusion / To sum up / All things considered', 'However / On the other hand', 'Furthermore / In addition', 'Initially / First of all'], ans: 0, exp: '"In conclusion", "To sum up" = introduzem a conclusão.' },
      ]
    },
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
]

interface Msg { role: string; text: string }
type ViewType = 'levels' | 'list' | 'explanation' | 'quiz' | 'finish'

export default function AppPage() {
  const [tab, setTab] = useState('home')
  const [level, setLevel] = useState('beginner')
  const [view, setView] = useState<ViewType>('levels')
  const [lessonIdx, setLessonIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(-1)
  const [xp, setXp] = useState(0)
  const [streak] = useState(5)
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [vocabCat, setVocabCat] = useState('all')
  const [chatMsgs, setChatMsgs] = useState<Msg[]>([{ role: 'ai', text: 'Olá! Sou seu professor de inglês com IA. Pode me perguntar sobre gramática, vocabulário ou praticar conversação. Como posso ajudar?' }])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [userName, setUserName] = useState('Aluno')
  const router = useRouter()

  const totalLessons = Object.values(lessons).flat().length
  const doneLessons = Object.values(lessons).flat().filter(l => l.done).length

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const nome = data.user.user_metadata?.nome || data.user.email?.split('@')[0] || 'Aluno'
      setUserName(nome.split(' ')[0])
    })
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function answer(i: number) {
    if (answered) return
    setAnswered(true)
    setSelected(i)
    if (i === lessons[level][lessonIdx].q[qIdx].ans) setXp(x => x + 10)
  }

  function nextQ() {
    const qs = lessons[level][lessonIdx].q
    if (qIdx + 1 >= qs.length) {
      lessons[level][lessonIdx].done = true
      setXp(x => x + 30)
      setView('finish')
    } else {
      setQIdx(q => q + 1)
      setAnswered(false)
      setSelected(-1)
    }
  }

  async function sendChat() {
    if (!chatInput.trim() || loadingChat) return
    const msg = chatInput
    setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', text: msg }])
    setLoadingChat(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'Você é um professor de inglês simpático e paciente para brasileiros. Responda sempre em português com exemplos em inglês traduzidos. Use formatação simples. Máximo 4 linhas por resposta.',
          messages: [{ role: 'user', content: msg }]
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Erro ao responder.'
      setChatMsgs(m => [...m, { role: 'ai', text: reply }])
    } catch {
      setChatMsgs(m => [...m, { role: 'ai', text: 'Erro de conexão. Tente novamente.' }])
    }
    setLoadingChat(false)
  }

  const blue = '#185FA5'
  const blueDark = '#0C447C'
  const blueLight = '#E6F1FB'
  const green = '#3B6D11'
  const greenLight = '#EAF3DE'
  const filteredVocab = vocabCat === 'all' ? vocab : vocab.filter(v => v.cat === vocabCat)
  const currentLesson = lessons[level][lessonIdx]

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: 'var(--color-background-tertiary)', minHeight: '100vh' }}>

      {tab === 'home' && (
        <div>
          <div style={{ background: blue, padding: '20px 16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: '#B5D4F4' }}>Bom dia,</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{userName}</div>
              </div>
              <button onClick={logout} style={{ background: blueDark, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#85B7EB', fontSize: 12, cursor: 'pointer' }}>Sair</button>
            </div>
            <div style={{ background: blueDark, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{xp}</div>
                  <div style={{ fontSize: 11, color: '#85B7EB' }}>XP total</div>
                </div>
                <div style={{ width: 1, background: blue }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{streak}</div>
                  <div style={{ fontSize: 11, color: '#85B7EB' }}>Dias seguidos</div>
                </div>
                <div style={{ width: 1, background: blue }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{doneLessons}/{totalLessons}</div>
                  <div style={{ fontSize: 11, color: '#85B7EB' }}>Lições</div>
                </div>
              </div>
              <div style={{ background: blue, borderRadius: 6, height: 6, overflow: 'hidden' }}>
                <div style={{ background: '#EF9F27', height: '100%', width: `${Math.round((xp % 200) / 2)}%`, borderRadius: 6, transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#85B7EB', marginTop: 6 }}>{Math.round((xp % 200) / 2)}% para o próximo nível</div>
            </div>
          </div>
          <div style={{ padding: '16px', marginTop: -16 }}>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Continue aprendendo</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {lessons[level].find(l => !l.done)?.icon || '✅'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{lessons[level].find(l => !l.done)?.title || 'Nível completo!'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Avançado'}</div>
                  <div style={{ background: 'var(--color-background-secondary)', borderRadius: 4, height: 4, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ background: blue, height: '100%', width: `${Math.round(doneLessons / totalLessons * 100)}%`, borderRadius: 4 }} />
                  </div>
                </div>
                <button onClick={() => setTab('lessons')} style={{ width: 36, height: 36, background: blue, border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: 18, color: '#fff' }}>→</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div onClick={() => setTab('vocab')} style={{ background: greenLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📚</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#27500A' }}>Vocabulário</div>
                <div style={{ fontSize: 11, color: green }}>{vocab.length} palavras</div>
              </div>
              <div onClick={() => setTab('ai')} style={{ background: '#FAEEDA', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🤖</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#633806' }}>Professor IA</div>
                <div style={{ fontSize: 11, color: '#854F0B' }}>Disponível 24h</div>
              </div>
            </div>
            <div style={{ background: 'var(--color-background-primary)', borderRadius: 14, border: '0.5px solid var(--color-border-tertiary)', padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sequência semanal</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                  <div key={i} style={{ flex: 1, height: 36, borderRadius: 8, background: i < 5 ? (i === 4 ? blueLight : greenLight) : 'var(--color-background-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <div style={{ fontSize: 9, color: i < 5 ? (i === 4 ? blue : green) : 'var(--color-text-secondary)', fontWeight: 500 }}>{d}</div>
                    {i < 5 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 4 ? blue : green }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'lessons' && (
        <div>
          <div style={{ background: blue, padding: '20px 16px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Lições</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 2 }}>{totalLessons} lições disponíveis</div>
          </div>
          <div style={{ padding: 16 }}>
            {view === 'levels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {([['beginner', 'Iniciante', 'Do zero ao básico', '#EAF3DE', '#3B6D11', '🌱'], ['intermediate', 'Intermediário', 'Conversação fluente', '#E6F1FB', '#185FA5', '🌿'], ['advanced', 'Avançado', 'Fluência total', '#EEEDFE', '#534AB7', '🌳']] as const).map(([l, name, desc, bg, color, icon]) => (
                  <div key={l} onClick={() => { setLevel(l); setView('list') }} style={{ background: 'var(--color-background-primary)', border: level === l ? `1.5px solid ${color}` : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc} · {lessons[l].length} lições</div>
                    </div>
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{l.sub} · {l.q.length} exercícios</div>
                      </div>
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
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>{currentLesson.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{currentLesson.q.length} exercícios</div>
                  </div>
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
                <button onClick={() => { setQIdx(0); setAnswered(false); setSelected(-1); setView('quiz') }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                  Começar exercícios →
                </button>
              </div>
            )}

            {view === 'quiz' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setView('explanation')} style={{ width: 36, height: 36, border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--color-text-secondary)', flexShrink: 0 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {currentLesson.q.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIdx ? blue : i === qIdx ? '#85B7EB' : 'var(--color-background-secondary)' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{currentLesson.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: blue, fontWeight: 500, background: blueLight, padding: '3px 8px', borderRadius: 6 }}>{qIdx + 1}/{currentLesson.q.length}</div>
                </div>
                {currentLesson.q[qIdx].ctx && (
                  <div style={{ background: '#F1EFE8', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {currentLesson.q[qIdx].ctx}
                  </div>
                )}
                <div style={{ background: blueLight, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 500, color: '#042C53', lineHeight: 1.4 }}>{currentLesson.q[qIdx].q}</div>
                </div>
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
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 8 }}>Lição concluída!</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Você ganhou</div>
                <div style={{ fontSize: 32, fontWeight: 500, color: '#BA7517', marginBottom: 24 }}>+30 XP</div>
                <button onClick={() => { setView('list'); setAnswered(false); setSelected(-1) }} style={{ width: '100%', padding: 14, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginBottom: 10 }}>Ver mais lições</button>
                <button onClick={() => setTab('home')} style={{ width: '100%', padding: 14, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', border: 'none', borderRadius: 12, fontSize: 15, cursor: 'pointer' }}>Voltar ao início</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'vocab' && (
        <div>
          <div style={{ background: blue, padding: '20px 16px 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Vocabulário</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 2 }}>Toque nos cards para revelar</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {[['all', 'Todos'], ['basic', 'Essenciais'], ['travel', 'Viagem'], ['work', 'Trabalho']].map(([cat, label]) => (
                <button key={cat} onClick={() => setVocabCat(cat)} style={{ padding: '7px 14px', border: vocabCat === cat ? 'none' : '0.5px solid var(--color-border-tertiary)', borderRadius: 20, background: vocabCat === cat ? blue : 'var(--color-background-primary)', color: vocabCat === cat ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filteredVocab.map((v, i) => (
                <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))} style={{ background: flipped[i] ? blueLight : 'var(--color-background-primary)', border: flipped[i] ? '1px solid #85B7EB' : '0.5px solid var(--color-border-tertiary)', borderRadius: 14, padding: 14, cursor: 'pointer', minHeight: 90 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: flipped[i] ? blueDark : 'var(--color-text-primary)' }}>{v.en}</div>
                  {flipped[i] ? (
                    <>
                      <div style={{ color: blue, marginTop: 6, fontSize: 14, fontWeight: 500 }}>{v.pt}</div>
                      <div style={{ fontSize: 11, color: '#0C447C', marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>"{v.ex}"</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>Toque para ver</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ background: blue, padding: '20px 16px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>Professor de IA</div>
            <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 2 }}>Tire dúvidas e pratique conversação</div>
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              {['Como me apresentar?', 'Diferença: since vs for', 'Present Perfect', 'Phrasal verbs'].map(t => (
                <button key={t} onClick={() => setChatInput(t)} style={{ padding: '6px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 20, background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.6, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? blue : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
                {m.text}
              </div>
            ))}
            {loadingChat && <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Professor digitando...</div>}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Digite sua dúvida..." style={{ flex: 1, padding: '10px 12px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, fontSize: 14, background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
            <button onClick={sendChat} disabled={loadingChat} style={{ padding: '10px 16px', background: blue, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>→</button>
          </div>
        </div>
      )}

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--color-background-primary)', borderTop: '0.5px solid var(--color-border-tertiary)', display: 'flex', padding: '8px 0 4px', zIndex: 10 }}>
        {[['home', '🏠', 'Início'], ['lessons', '📖', 'Lições'], ['vocab', '📚', 'Vocab'], ['ai', '🤖', 'Professor']].map(([t, icon, label]) => (
          <button key={t} onClick={() => { setTab(t); if (t === 'lessons') setView('levels') }} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 10, color: tab === t ? blue : 'var(--color-text-secondary)', fontWeight: tab === t ? 500 : 400 }}>{label}</span>
            {tab === t && <div style={{ width: 20, height: 3, background: blue, borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  )
}
