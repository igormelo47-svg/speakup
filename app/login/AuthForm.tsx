'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { VALOR, MOEDA } from '../../lib/valor-eventos'
import { PRECO } from '../_marketing/ui'

// Formulário de login/cadastro compartilhado entre /login (modo login) e /cadastro (modo cadastro).
// O CTA da landing aponta pra /cadastro: o visitante novo cai direto na criação de conta.
export default function AuthForm({ modoInicial = 'login' }: { modoInicial?: 'login' | 'cadastro' }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modo, setModo] = useState<string>(modoInicial) // login | cadastro | recuperar
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const router = useRouter()
  const [indicado, setIndicado] = useState(false)
  // Nível vindo do teste público (?nivel=B2). Guardado em estado para o formulário DIZER
  // "seu plano B2 está pronto": quem acabou de descobrir o nível caía num cadastro genérico
  // e a continuidade morria exatamente no momento de maior motivação.
  const [nivelTeste, setNivelTeste] = useState<string | null>(null)

  // Link de indicação (?ref=<id do amigo>): guarda o código para creditar o bônus após o cadastro.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) { localStorage.setItem('speakup_ref', ref); setIndicado(true); setModo('cadastro') }
      // vindo do app nativo (?novo=1): já abre no cadastro
      if (params.get('novo')) setModo('cadastro')
      // Vindo do teste de nível público (?nivel=B1): guarda para o app abrir a trilha
      // exatamente dali — é a promessa do CTA "Começar do B1 grátis". O app lê
      // speakup_nivel no primeiro load (app/app/page.tsx). Whitelist porque isso é URL:
      // qualquer valor fora dos seis níveis é lixo e não pode entrar no estado do app.
      const nivel = params.get('nivel')
      if (nivel && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(nivel)) {
        localStorage.setItem('speakup_nivel', nivel)
        setNivelTeste(nivel)
        setModo('cadastro')
      }
    } catch (e) {}
  }, [])

  // O Supabase devolve erro em INGLÊS ("Password should be at least 6 characters") e
  // essa era a mensagem que o aluno via na hora exata da conversão. Traduz os casos
  // conhecidos; o resto vira uma frase genérica em português — nunca o texto cru.
  function traduzErro(msg: string): string {
    const m = (msg || '').toLowerCase()
    if (m.includes('password') && (m.includes('at least') || m.includes('short'))) return 'A senha é curta demais — use pelo menos 8 caracteres.'
    if (m.includes('already registered') || m.includes('already exists')) return 'Já existe uma conta com esse e-mail. Toque em "Entrar" aqui embaixo.'
    if (m.includes('invalid') && m.includes('email')) return 'Esse e-mail não parece válido. Confira se digitou certo.'
    if (m.includes('validate email')) return 'Esse e-mail não parece válido. Confira se digitou certo.'
    if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'
    if (m.includes('network') || m.includes('fetch')) return 'Sem conexão. Confira sua internet e tente de novo.'
    return 'Não deu para concluir agora. Confira os campos e tente de novo.'
  }

  // Entrar/criar conta com Google (OAuth do Supabase). Um toque em vez de nome+e-mail+senha
  // +confirmação — é o maior atrito do cadastro no celular. O trigger handle_new_user cria o
  // profile com trial (nome vem do Google via raw_user_meta_data ou cai no coalesce).
  // Se o provider ainda não estiver habilitado no painel do Supabase, o erro vira uma frase
  // amigável em vez de quebrar a tela.
  async function handleGoogle() {
    setLoadingGoogle(true); setErro(''); setAviso('')
    try {
      try { ;(window as any).dataLayer?.push({ event: modo === 'cadastro' ? 'cadastro_google_clique' : 'login_google_clique' }) } catch (e) {}
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      })
      if (error) {
        const m = (error.message || '').toLowerCase()
        setErro(/provider|not enabled|unsupported|disabled/.test(m)
          ? 'Login com Google ainda não está disponível — use e-mail e senha.'
          : traduzErro(error.message))
        setLoadingGoogle(false)
      }
      // Sem erro: o navegador está indo para o Google — não mexe no loading.
    } catch {
      setErro('Login com Google ainda não está disponível — use e-mail e senha.')
      setLoadingGoogle(false)
    }
  }

  async function handleSubmit() {
    setLoading(true); setErro(''); setAviso('')

    // Entrar sem senha (link mágico): o maior atrito de VOLTA era lembrar a senha no
    // 2º dia — e é no 2º dia que o funil morre. O Supabase manda um link por e-mail;
    // um clique e a pessoa está dentro. shouldCreateUser: false — criar conta continua
    // no fluxo de cadastro, que captura o nome e monta o trial direito.
    if (modo === 'magic') {
      if (!email) { setErro('Digite seu e-mail.'); setLoading(false); return }
      const redirectApp = typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectApp, shouldCreateUser: false },
      })
      if (error) {
        setErro(/not found|signups/i.test(error.message) ? 'Não achamos conta com esse e-mail. Confira ou crie uma conta grátis.' : traduzErro(error.message))
        setLoading(false); return
      }
      try { track('login_magic_pedido') } catch (e) {}
      setAviso('Link enviado! Abra seu e-mail e clique para entrar — sem senha. (Vale alguns minutos; confira o spam.)')
      setLoading(false)
      return
    }

    // Recuperação de senha
    if (modo === 'recuperar') {
      if (!email) { setErro('Digite seu e-mail.'); setLoading(false); return }
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset` : undefined
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) { setErro(traduzErro(error.message)); setLoading(false); return }
      setAviso('Enviamos um link para o seu e-mail. Abra-o para criar uma nova senha.')
      setLoading(false)
      return
    }

    if (modo === 'cadastro') {
      const redirectApp = typeof window !== 'undefined' ? `${window.location.origin}/app` : undefined
      // Nome é opcional: um campo a menos no celular. Vazio → parte antes do @ (o mesmo
      // fallback que o trigger handle_new_user já faz com coalesce/split_part).
      const nomeFinal = nome.trim() || email.split('@')[0]
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome: nomeFinal }, emailRedirectTo: redirectApp }
      })
      if (error) { setErro(traduzErro(error.message)); setLoading(false); return }
      if (data.user) {
        // O banco pode já ter criado o profile via trigger — upsert evita o erro 409 de chave duplicada.
        // Trial de PRECO.diasGratis dias. A duração de verdade é decidida no banco (handle_new_user /
        // protege_profiles, migracao_2026-08-19_trial_2_dias.sql); este valor só cobre o caso de
        // o trigger não ter criado a linha.
        await supabase.from('profiles').upsert({
          id: data.user.id, email, nome: nomeFinal, plano: 'free', ativo: true,
          trial_expira: new Date(Date.now() + PRECO.diasGratis * 24 * 60 * 60 * 1000)
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
      try { track('cadastro') } catch (e) {}
      // Medição (GTM/GA4): marca o cadastro no MOMENTO do envio, no dataLayer que a campanha usa —
      // o inicio_teste só dispara ao carregar o /app; se o aluno travar na confirmação de e-mail,
      // este evento garante que o topo do funil não some da medição do Google Ads.
      try { ;(window as any).dataLayer?.push({ event: 'cadastro_enviado', value: VALOR.cadastro, currency: MOEDA, user_id: data.user?.id || undefined }) } catch (e) {}
      // Se a confirmação de e-mail estiver ligada no Supabase, não vem sessão: avisa o aluno.
      if (!data.session) {
        setAviso('Conta criada! Confirme seu e-mail (verifique também o spam) e depois entre.')
        setModo('login'); setLoading(false); return
      }
      router.push('/app')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        setErro(/confirm/i.test(error.message) ? 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).' : 'E-mail ou senha incorretos.')
        setLoading(false); return
      }
      try { track('login') } catch (e) {}
      router.push('/app')
    }
    setLoading(false)
  }

  const titulo = modo === 'login' ? 'Entre na sua conta' : modo === 'cadastro' ? 'Crie sua conta grátis' : modo === 'magic' ? 'Entrar sem senha' : 'Recuperar senha'
  const botao = loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : modo === 'cadastro' ? (nivelTeste ? `Criar conta e começar do ${nivelTeste} →` : 'Criar conta grátis') : modo === 'magic' ? 'Me enviar o link de acesso ✨' : 'Enviar link de recuperação'

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #D8E1EC', borderRadius: 12,
    // 16px é o mínimo que impede o zoom forçado do Safari/iPhone ao focar o campo —
    // com 15px a tela de cadastro "pulava" bem na hora de digitar (mesma correção
    // já aplicada aos inputs do chat, ver layout.tsx).
    fontSize: 16, boxSizing: 'border-box' as const, background: '#F7FAFD', color: '#16212C',
    outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle = { fontSize: 12.5, color: '#5B6B82', fontWeight: 600 as const, display: 'block', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2E72D6 0%, #185FA5 55%, #103D77 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6, color: '#fff', display: 'flex', alignItems: 'center', gap: 3 }}>
        Von<span style={{ background: '#FFD98A', color: '#7A5A12', padding: '1px 9px', borderRadius: 9 }}>ai</span>
      </h1>
      <p style={{ color: '#B5D4F4', fontSize: 14, marginBottom: 24 }}>Aprenda inglês conversando com IA</p>

      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '26px 22px', boxShadow: '0 12px 40px rgba(8,30,60,0.35)', boxSizing: 'border-box' }}>
        <p style={{ color: '#16212C', fontSize: 17, fontWeight: 700, margin: '0 0 16px' }}>{titulo}</p>

        {modo === 'cadastro' && nivelTeste && (
          <div style={{ background: 'linear-gradient(135deg, #2E72D6, #185FA5)', color: '#fff', padding: '14px 16px', borderRadius: 12, marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#BCD6F2', letterSpacing: 0.5 }}>SEU RESULTADO NO TESTE</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: '2px 0' }}>Seu plano {nivelTeste} está pronto ✅</div>
            <div style={{ fontSize: 12.5, color: '#D6E6FA' }}>A trilha começa exatamente do {nivelTeste} — crie a conta pra destravar.</div>
          </div>
        )}
        {modo === 'cadastro' && (
          <p style={{ fontSize: 13, color: '#166534', background: '#E3F3EA', padding: '10px 12px', borderRadius: 10, marginBottom: 18, fontWeight: 600, textAlign: 'center' }}>
            {indicado ? `🎁 Um amigo te indicou: ${PRECO.diasGratis} + 2 dias de Premium grátis!` : `✨ ${PRECO.diasGratis} dias de acesso Premium grátis — sem cartão`}
          </p>
        )}

        {/* Google em cima do formulário: no login e no cadastro (não em recuperar/magic). */}
        {(modo === 'login' || modo === 'cadastro') && (
          <>
            <button type="button" onClick={handleGoogle} disabled={loadingGoogle || loading}
              style={{ width: '100%', padding: 12, background: '#fff', color: '#16212C', border: '1px solid #D8E1EC', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loadingGoogle ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loadingGoogle ? 0.7 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/>
                <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"/>
                <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.7-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
              </svg>
              {loadingGoogle ? 'Abrindo o Google…' : 'Continuar com Google'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E6EDF5' }} />
              <span style={{ fontSize: 12, color: '#8896A6' }}>ou</span>
              <div style={{ flex: 1, height: 1, background: '#E6EDF5' }} />
            </div>
          </>
        )}

        {/* <form> de verdade: o teclado do celular mostra "Ir", Enter envia de qualquer
            campo, e required/minLength barram envio vazio ANTES de ir ao Supabase
            (que responderia em inglês). O botão lá embaixo é type="submit". */}
        <form onSubmit={e => { e.preventDefault(); handleSubmit() }}>
        {modo === 'cadastro' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nome <span style={{ fontWeight: 400, color: '#8896A6' }}>(opcional)</span></label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Como o professor deve te chamar"
              autoComplete="name" style={inputStyle} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
            autoComplete="email" required style={inputStyle} />
        </div>
        {modo !== 'recuperar' && modo !== 'magic' && (
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Senha</label>
            {/* new-password no cadastro faz iPhone/Android OFERECEREM uma senha forte e
                salvarem no gerenciador; current-password no login faz o autofill
                preencher. Sem o atributo, nenhum dos dois acontecia. minLength só no
                cadastro: conta antiga pode ter senha mais curta e precisa logar. */}
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres"
              autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
              required minLength={modo === 'cadastro' ? 8 : undefined} style={inputStyle} />
          </div>
        )}
        {modo === 'magic' && (
          <p style={{ fontSize: 12.5, color: '#5B6B82', margin: '0 0 14px', lineHeight: 1.5 }}>
            Você recebe um link por e-mail — um clique e está dentro, sem digitar senha.
          </p>
        )}

        {modo === 'login' && (
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 16px' }}>
            <span onClick={() => { setModo('magic'); setErro(''); setAviso('') }} style={{ color: '#185FA5', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>✨ Entrar sem senha</span>
            <span onClick={() => { setModo('recuperar'); setErro(''); setAviso('') }} style={{ color: '#185FA5', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>Esqueci minha senha</span>
          </p>
        )}
        {modo !== 'login' && <div style={{ marginBottom: 12 }} />}

        {erro && <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12, background: '#FBEBEB', padding: '10px 12px', borderRadius: 10 }}>{erro}</p>}
        {aviso && <p style={{ color: '#166534', fontSize: 13, marginBottom: 12, background: '#E3F3EA', padding: '10px 12px', borderRadius: 10 }}>{aviso}</p>}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 14, background: loading ? '#7FA6CB' : 'linear-gradient(135deg, #2E72D6, #185FA5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(24,95,165,0.35)', fontFamily: 'inherit' }}>
          {botao}
        </button>
        </form>

        {(modo === 'recuperar' || modo === 'magic') ? (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#5B6B82', marginTop: 16, marginBottom: 0 }}>
            <span onClick={() => { setModo('login'); setErro(''); setAviso('') }} style={{ color: '#185FA5', cursor: 'pointer', fontWeight: 600 }}>← Voltar para o login</span>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#5B6B82', marginTop: 16, marginBottom: 0 }}>
            {modo === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <span onClick={() => { setModo(modo === 'login' ? 'cadastro' : 'login'); setErro(''); setAviso('') }} style={{ color: '#185FA5', cursor: 'pointer', fontWeight: 700 }}>
              {modo === 'login' ? 'Criar grátis' : 'Entrar'}
            </span>
          </p>
        )}

        {modo === 'cadastro' && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#8896A6', marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>
            Ao criar a conta, você concorda com os{' '}
            <a href="/termos" style={{ color: '#5B6B82' }}>Termos de Uso</a> e a{' '}
            <a href="/privacidade" style={{ color: '#5B6B82' }}>Política de Privacidade</a>.
          </p>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9DBBDD', marginTop: 22 }}>
        <a href="/termos" style={{ color: '#B5D4F4', marginRight: 14 }}>Termos</a>
        <a href="/privacidade" style={{ color: '#B5D4F4' }}>Privacidade</a>
      </p>
    </div>
  )
}
