'use client';

/* ---------------------------------------------------------------------------
   Vô — o professor do Vonai, desenhado em SVG (18/09/2026).

   Por que SVG e não imagem: como vetor ele reage ao que o aluno faz — pisca,
   comemora no acerto, inclina a cabeça no erro, mexe os olhos enquanto ouve.
   Uma coruja que responde é lembrada; um balão de ajuda é fechado.

   PALETA: usa exclusivamente as variáveis de app/globals.css (azul + dourado).
   Nenhuma cor nova foi inventada aqui — a regra do arquivo é respeitada.

   MOVIMENTO: os keyframes su_vo_* ficam em globals.css, onde já vive o resto
   das animações do app. O bloco @media (prefers-reduced-motion) que já existe
   lá cobre estas também, sem precisar de nada a mais.
   --------------------------------------------------------------------------- */

export type VoHumor =
  | 'parado'       // respirando, piscando — estado padrão
  | 'pensando'     // observando o exercício, antes de o aluno responder
  | 'comemorando'  // acerto: pula e bate as asas
  | 'acolhendo'    // erro: inclina a cabeça, sem drama
  | 'ouvindo';     // aluno falando no microfone: olhos se movem

type VoProps = {
  humor?: VoHumor;
  /** lado do quadrado em px. 44 na linha de apoio, 74 padrão, 104 em destaque. */
  tamanho?: number;
  onClick?: () => void;
  /** texto para leitor de tela. Se omitido, o Vô é tratado como decoração. */
  rotulo?: string;
  style?: React.CSSProperties;
};

const CORPO_ANIM: Record<VoHumor, string> = {
  parado: 'su_vo_bob 3.6s ease-in-out infinite',
  pensando: 'su_vo_tilt 1.5s ease-in-out infinite',
  comemorando: 'su_vo_cheer 0.62s cubic-bezier(.34,1.56,.64,1) 2',
  acolhendo: 'su_vo_tilt 2.4s ease-in-out infinite',
  ouvindo: 'su_vo_bob 2.6s ease-in-out infinite',
};

export default function Vo({
  humor = 'parado',
  tamanho = 74,
  onClick,
  rotulo,
  style,
}: VoProps) {
  const comemorando = humor === 'comemorando';
  const ouvindo = humor === 'ouvindo';
  const clicavel = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      role={clicavel ? 'button' : undefined}
      tabIndex={clicavel ? 0 : undefined}
      onKeyDown={
        clicavel
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick!();
              }
            }
          : undefined
      }
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      style={{
        width: tamanho,
        height: tamanho,
        flex: '0 0 auto',
        cursor: clicavel ? 'pointer' : 'default',
        lineHeight: 0,
        ...style,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <g
          style={{
            animation: CORPO_ANIM[humor],
            transformOrigin: '50% 90%',
          }}
        >
          {/* asas — batem só na comemoração */}
          <ellipse
            cx="19" cy="60" rx="9" ry="17"
            fill="var(--vonai-blue-900)"
            style={{
              transformOrigin: '82% 30%',
              animation: comemorando ? 'su_vo_asa_e 0.3s ease-in-out 4' : undefined,
            }}
          />
          <ellipse
            cx="81" cy="60" rx="9" ry="17"
            fill="var(--vonai-blue-900)"
            style={{
              transformOrigin: '18% 30%',
              animation: comemorando ? 'su_vo_asa_d 0.3s ease-in-out 4' : undefined,
            }}
          />

          {/* tufos de orelha */}
          <path d="M26 30 L34 14 L42 30 Z" fill="var(--vonai-blue-900)" />
          <path d="M74 30 L66 14 L58 30 Z" fill="var(--vonai-blue-900)" />

          {/* corpo e barriga */}
          <ellipse cx="50" cy="58" rx="33" ry="34" fill="var(--vonai-blue-700)" />
          <ellipse cx="50" cy="66" rx="22" ry="24" fill="var(--vonai-blue-50)" />

          {/* discos dos olhos */}
          <circle cx="38" cy="50" r="14" fill="#ffffff" />
          <circle cx="62" cy="50" r="14" fill="#ffffff" />

          {/* pupilas — se mexem quando está ouvindo */}
          <g
            style={{
              animation: ouvindo ? 'su_vo_olhar 1.7s ease-in-out infinite' : undefined,
            }}
          >
            <circle cx="38" cy="51" r="7" fill="var(--vonai-blue-900)" />
            <circle cx="62" cy="51" r="7" fill="var(--vonai-blue-900)" />
            <circle cx="40.5" cy="48" r="2.4" fill="#ffffff" />
            <circle cx="64.5" cy="48" r="2.4" fill="#ffffff" />
          </g>

          {/* pálpebras — piscada a cada 5s */}
          <rect
            x="24" y="37" width="28" height="28" rx="13"
            fill="var(--vonai-blue-700)"
            style={{ transformOrigin: 'center', transform: 'scaleY(0)', animation: 'su_vo_piscar 5s infinite' }}
          />
          <rect
            x="48" y="37" width="28" height="28" rx="13"
            fill="var(--vonai-blue-700)"
            style={{ transformOrigin: 'center', transform: 'scaleY(0)', animation: 'su_vo_piscar 5s infinite' }}
          />

          {/* bico */}
          <path d="M50 58 L44 66 L56 66 Z" fill="var(--vonai-gold-500)" />

          {/* capelo de professor */}
          <path d="M22 26 L50 16 L78 26 L50 36 Z" fill="var(--vonai-blue-900)" />
          <rect x="38" y="10" width="24" height="9" rx="2" fill="var(--vonai-blue-900)" />
          <circle cx="76" cy="27" r="2.6" fill="var(--vonai-gold-500)" />
          <path
            d="M76 27 Q80 34 77 39"
            stroke="var(--vonai-gold-500)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Linha de fala do Vô: a coruja ao lado de um texto, no lugar do balão
   flutuante que hoje fica em cima do botão "Ativar lembretes".

   Raios 14 e cores da paleta oficial.
   --------------------------------------------------------------------------- */

type VoFalaProps = {
  children: React.ReactNode;
  humor?: VoHumor;
  /** 'apoio' = fundo cinza discreto (dentro da lição). 'balao' = card com borda. */
  variante?: 'apoio' | 'balao';
  onTocar?: () => void;
};

export function VoFala({ children, humor = 'parado', variante = 'apoio', onTocar }: VoFalaProps) {
  const balao = variante === 'balao';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: balao ? 'flex-end' : 'center',
        gap: 11,
        marginTop: 20,
      }}
    >
      <Vo humor={humor} tamanho={balao ? 74 : 44} onClick={onTocar} />
      <div
        style={{
          flex: 1,
          fontSize: 14,
          lineHeight: 1.45,
          color: 'var(--color-text-secondary)',
          background: balao ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
          border: balao ? '1px solid var(--color-border-tertiary)' : 'none',
          borderRadius: balao ? '14px 14px 14px 6px' : 14,
          padding: '13px 15px',
          boxShadow: balao ? '0 1px 2px rgba(16,33,44,.05), 0 8px 24px rgba(16,33,44,.07)' : 'none',
          animation: 'su_screen .38s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
