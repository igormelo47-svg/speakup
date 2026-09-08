'use client'
import { useEffect, useState } from 'react'

// Página de agradecimento da pesquisa de uma pergunta (/api/pesquisa).
// A opção clicada JÁ foi gravada no redirect — esta tela só confirma e abre espaço
// para quem quiser escrever. Nada aqui pede login, cadastro ou pagamento: a pessoa
// veio fazer um favor e não pode topar com um funil na saída.

const AZUL = '#1E63C7'

export default function Pesquisa() {
  const [u, setU] = useState(''); const [t, setT] = useState('')
  const [erro, setErro] = useState(false)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<'ocioso' | 'enviando' | 'pronto'>('ocioso')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setU(p.get('u') || ''); setT(p.get('t') || ''); setErro(p.get('e') === '1')
  }, [])

  async function enviar() {
    if (texto.trim().length < 2) return
    setEstado('enviando')
    try {
      await fetch('/api/pesquisa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u, t, texto }),
      })
    } catch {}
    setEstado('pronto')
  }

  const caixa: React.CSSProperties = {
    maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 20,
    padding: '28px 24px', boxShadow: '0 12px 40px rgba(8,30,60,0.14)', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #2E72D6 0%, #185FA5 55%, #103D77 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px', fontFamily: '-apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={caixa}>
        {erro ? (
          <>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#102A4C', marginBottom: 8 }}>Esse link expirou</div>
            <p style={{ color: '#5B6B82', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
              Sem problema — se quiser me contar assim mesmo, responda o e-mail que você recebeu.
              Eu leio pessoalmente. — Igor
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#102A4C', marginBottom: 8 }}>Obrigado, de verdade ✅</div>
            <p style={{ color: '#5B6B82', fontSize: 15, lineHeight: 1.65, margin: '0 0 20px' }}>
              Sua resposta chegou aqui. Isso vale mais para mim do que qualquer número de painel.
            </p>

            {estado === 'pronto' ? (
              <div style={{ background: '#E3F3EA', color: '#166534', fontSize: 14.5, fontWeight: 600, padding: '14px 16px', borderRadius: 12 }}>
                Recebi. Vou ler com calma. — Igor
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#102A4C', marginBottom: 8 }}>
                  Quer contar em uma linha? (opcional)
                </div>
                <textarea
                  value={texto} onChange={e => setTexto(e.target.value)} rows={4}
                  placeholder="O que faltou pra você voltar…"
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: 16, padding: '12px 14px', borderRadius: 12, border: '1px solid #D8E1EC', background: '#F7FAFD', color: '#16212C', fontFamily: 'inherit', resize: 'vertical' }}
                />
                <button
                  onClick={enviar} disabled={estado === 'enviando' || texto.trim().length < 2}
                  style={{ marginTop: 12, width: '100%', padding: 14, background: texto.trim().length < 2 ? '#9FBEDF' : `linear-gradient(135deg, #2E72D6, ${'#185FA5'})`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: texto.trim().length < 2 ? 'default' : 'pointer', fontFamily: 'inherit' }}
                >
                  {estado === 'enviando' ? 'Enviando…' : 'Enviar para o Igor'}
                </button>
              </>
            )}
          </>
        )}
        <p style={{ textAlign: 'center', marginTop: 22, marginBottom: 0 }}>
          <a href="/" style={{ color: AZUL, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>voltar ao vonai.com.br</a>
        </p>
      </div>
    </div>
  )
}
