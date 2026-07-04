'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import InstallButton from '../InstallButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modo, setModo] = useState('login') // login | cadastro | recuperar
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [indicado, setIndicado] = useState(false)

  // Link de indicação (?ref=<id do amigo>): guarda o código para creditar o bônus após o cadastro.
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref')
      if (ref) { localStorage.setItem('speakup_ref', ref); setIndicado(true); setModo('cadastro') }
    } catch (e) {}
  }, [])

  async function handleSubmit() {
    setLoading(true); setErro(''); setAviso('')

    // Recuperação de senha
    if (modo === 'recuperar') {
      if (!email) { setErro('Digite seu e-mail.'); setLoading(false); return }
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset` : undefined
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) { setErro(error.message); setLoading(false); return }
      setAviso('Enviamos um link para o seu e-mail. Abra-o para criar uma nova senha.')
      setLoading(false)
      return
    }

    if (modo === 'cadastro') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } }
      })
      if (error) { setErro(error.message); setLoading(false); return }
      if (data.user) {
        // O banco pode já ter criado o profile via trigger — upsert evita o erro 409 de chave duplicada.
        await supabase.from('profiles').upsert({
          id: data.user.id, email, nome, plano: 'free', ativo: true,
          trial_expira: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
      try { track('cadastro') } catch (e) {}
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

  const titulo = modo === 'login' ? 'Entre na sua conta' : modo === 'cadastro' ? 'Crie sua conta grátis' : 'Recuperar senha'
  const botao = loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : modo === 'cadastro' ? 'Criar conta grátis' : 'Enviar link de recuperação'

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #D8E1EC', borderRadius: 12,
    fontSize: 15, boxSizing: 'border-box' as const, background: '#F7FAFD', color: '#16212C',
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

        {modo === 'cadastro' && (
          <p style={{ fontSize: 13, color: '#166534', background: '#E3F3EA', padding: '10px 12px', borderRadius: 10, marginBottom: 18, fontWeight: 600, textAlign: 'center' }}>
            {indicado ? '🎁 Um amigo te indicou: 2 + 2 dias de Premium grátis!' : '✨ 2 dias de acesso Premium grátis — sem cartão'}
          </p>
        )}

        {modo === 'cadastro' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" style={inputStyle} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />
        </div>
        {modo !== 'recuperar' && (
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
          </div>
        )}

        {modo === 'login' && (
          <p style={{ textAlign: 'right', margin: '0 0 16px' }}>
            <span onClick={() => { setModo('recuperar'); setErro(''); setAviso('') }} style={{ color: '#185FA5', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>Esqueci minha senha</span>
          </p>
        )}
        {modo !== 'login' && <div style={{ marginBottom: 12 }} />}

        {erro && <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12, background: '#FBEBEB', padding: '10px 12px', borderRadius: 10 }}>{erro}</p>}
        {aviso && <p style={{ color: '#166534', fontSize: 13, marginBottom: 12, background: '#E3F3EA', padding: '10px 12px', borderRadius: 10 }}>{aviso}</p>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: 14, background: loading ? '#7FA6CB' : 'linear-gradient(135deg, #2E72D6, #185FA5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(24,95,165,0.35)', fontFamily: 'inherit' }}>
          {botao}
        </button>

        {modo === 'recuperar' ? (
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

      <div style={{ width: '100%', maxWidth: 400 }}>
        <InstallButton dark />
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9DBBDD', marginTop: 22 }}>
        <a href="/termos" style={{ color: '#B5D4F4', marginRight: 14 }}>Termos</a>
        <a href="/privacidade" style={{ color: '#B5D4F4' }}>Privacidade</a>
      </p>
    </div>
  )
}
