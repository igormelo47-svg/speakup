'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)
  const [pronto, setPronto] = useState(false) // sessão de recuperação detectada
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // O link do e-mail cria uma sessão temporária de recuperação (detectSessionInUrl).
    supabase.auth.getSession().then(({ data }) => setPronto(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) setPronto(true) })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  async function salvar() {
    setErro('')
    if (senha.length < 8) { setErro('A senha precisa ter no mínimo 8 caracteres.'); return }
    if (senha !== senha2) { setErro('As senhas não coincidem.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)
    if (error) { setErro(error.message); return }
    setOk(true)
    setTimeout(() => router.push('/app'), 1500)
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Von<span style={{ color: '#185FA5' }}>ai</span></h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Criar nova senha</p>

      {ok ? (
        <p style={{ color: '#166534', fontSize: 14, background: '#E3F3EA', padding: '12px 14px', borderRadius: 8 }}>Senha alterada! Entrando...</p>
      ) : !pronto ? (
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
          Abra esta página pelo <b>link enviado no seu e-mail</b> de recuperação. Se você chegou aqui direto, volte ao{' '}
          <a href="/login" style={{ color: '#185FA5' }}>login</a> e clique em "Esqueci minha senha".
        </p>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Nova senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Confirmar nova senha</label>
            <input type="password" value={senha2} onChange={e => setSenha2(e.target.value)} placeholder="Repita a senha"
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          {erro && <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12 }}>{erro}</p>}
          <button onClick={salvar} disabled={loading}
            style={{ width: '100%', padding: 11, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </>
      )}
    </div>
  )
}
