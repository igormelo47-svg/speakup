'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modo, setModo] = useState('login')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true)
    setErro('')
    if (modo === 'cadastro') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } }
      })
      if (error) {
        setErro(error.message)
        setLoading(false)
        return
      }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          nome: nome,
          plano: 'free',
          ativo: true,
          trial_expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
      }
      router.push('/app')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      })
      if (error) {
        setErro('E-mail ou senha incorretos')
        setLoading(false)
        return
      }
      router.push('/app')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
        Speak<span style={{ color: '#185FA5' }}>Up</span>
      </h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        {modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta grátis'}
      </p>
      {modo === 'cadastro' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Nome</label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome completo"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
          />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>E-mail</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
        />
      </div>
      {erro && (
        <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12 }}>{erro}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: 11, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
      >
        {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta grátis'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 16 }}>
        {modo === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
        <span
          onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
          style={{ color: '#185FA5', cursor: 'pointer' }}
        >
          {modo === 'login' ? 'Criar grátis' : 'Entrar'}
        </span>
      </p>
      {modo === 'cadastro' && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 10, lineHeight: 1.5 }}>
          Ao criar a conta, você concorda com os{' '}
          <a href="/termos" style={{ color: '#888' }}>Termos de Uso</a> e a{' '}
          <a href="/privacidade" style={{ color: '#888' }}>Política de Privacidade</a>.
        </p>
      )}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 24 }}>
        <a href="/termos" style={{ color: '#999', marginRight: 14 }}>Termos</a>
        <a href="/privacidade" style={{ color: '#999' }}>Privacidade</a>
      </p>
    </div>
  )
}