-- ============================================================================
-- FUNIL DE CONVERSÃO — tabela de eventos (13/09/2026)
--
-- Rode no Supabase → SQL Editor, de uma vez. É idempotente: pode rodar de novo sem medo.
--
-- Por que ela existe: até agora o funil do Vonai vivia em dois lugares que não respondem
-- pergunta nenhuma sozinhos — o GTM (conta do gestor de tráfego, e evento sem tag não
-- existe) e o Vercel Analytics (bom para uso de feature, inútil para coorte). O resultado
-- é que "3.500 visitas → 603 testes → 149 contas → 0 assinantes" precisou ser remontado à
-- mão a partir do pixel. Com esta tabela, /admin desenha o funil inteiro sozinho.
--
-- Escrita: só pelo service role, via /api/funil. RLS fica LIGADA e sem policy nenhuma de
-- propósito — nenhum cliente (anon/authenticated) lê ou escreve aqui direto.
-- ============================================================================

create table if not exists public.eventos_funil (
  id          bigint generated always as identity primary key,
  evento      text        not null,
  -- Quem. user_id quando logado; anon_id para o topo do funil (visita, teste de nível,
  -- cadastro), que é justamente onde está a maior perda medida.
  user_id     uuid        references auth.users(id) on delete set null,
  anon_id     text,
  -- Chave única da pessoa: user_id quando existe, anon_id antes disso. É por ela que o
  -- degrau é contado uma única vez.
  identidade  text        not null,
  sessao      text,
  -- 'google' | 'meta' | 'organico' — resolvido no servidor a partir de progresso.attrib.
  canal       text,
  -- Variante de A/B ativa quando o evento aconteceu ("momento_oferta=pos_licao1").
  variante    text,
  -- true = DEGRAU do funil (uma vez por pessoa). false = ação repetível.
  etapa       boolean     not null default false,
  props       jsonb       not null default '{}'::jsonb,
  criado_em   timestamptz not null default now()
);

-- Um degrau, uma pessoa, uma vez. Este índice é a idempotência real: o localStorage some
-- quando o aluno troca de aparelho, e sem isto o degrau 5 passaria a ter mais gente que o 4.
create unique index if not exists eventos_funil_degrau_unico
  on public.eventos_funil (identidade, evento)
  where etapa;

-- Leituras do /admin: "quantos fizeram X nos últimos N dias", por canal e por variante.
create index if not exists eventos_funil_evento_data on public.eventos_funil (evento, criado_em desc);
create index if not exists eventos_funil_identidade  on public.eventos_funil (identidade);
create index if not exists eventos_funil_data        on public.eventos_funil (criado_em desc);
create index if not exists eventos_funil_user        on public.eventos_funil (user_id) where user_id is not null;

alter table public.eventos_funil enable row level security;
-- Sem policy: só o service role (servidor) enxerga. Não adicione policy para `anon` —
-- a tabela guarda o caminho completo de cada pessoa pelo produto.
revoke all on public.eventos_funil from anon, authenticated;

comment on table public.eventos_funil is
  'Degraus e ações do funil de conversão. Escrita exclusiva por /api/funil (service role). Lida pelo /admin.';

-- ---------------------------------------------------------------------------
-- Higiene: evento de funil é dado de diagnóstico, não arquivo histórico. Guardar 180 dias
-- cobre qualquer comparação de coorte que faça sentido e evita a tabela virar um problema
-- de custo. Rode manualmente de vez em quando, ou agende com pg_cron se um dia quiser.
-- ---------------------------------------------------------------------------
-- delete from public.eventos_funil where criado_em < now() - interval '180 days';
