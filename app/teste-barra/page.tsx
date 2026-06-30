export default function TesteBarraPage() {
  const cards = Array.from({ length: 24 }, (_, i) => i + 1)

  return (
    <div
      style={{
        maxWidth: 430,
        margin: '0 auto',
        background: '#f5f5f5',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: 'linear-gradient(160deg, #2074C0, #0C447C)', padding: '20px 16px 24px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Teste da Barra</div>
          <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 4 }}>
            Rota isolada para validar barra fixa no rodape sem impactar o app real.
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((n) => (
            <div
              key={n}
              style={{
                background: '#fff',
                border: '0.5px solid #d9d9d9',
                borderRadius: 14,
                padding: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1b1b1b', marginBottom: 6 }}>
                Bloco de conteudo {n}
              </div>
              <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>
                Conteudo placeholder para gerar rolagem vertical e simular telas longas em formato mobile.
                Continue rolando para confirmar se a barra permanece visivel e ancorada no fim.
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderTop: '0.5px solid #d9d9d9',
          display: 'flex',
          padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
          flexShrink: 0,
        }}
      >
        {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map((label, idx) => (
          <button
            key={label}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 17, color: idx === 0 ? '#185FA5' : '#64748b' }}>•</span>
            <span style={{ fontSize: 10, color: idx === 0 ? '#185FA5' : '#64748b', fontWeight: idx === 0 ? 700 : 500 }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
