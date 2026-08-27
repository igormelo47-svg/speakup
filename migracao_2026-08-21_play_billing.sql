-- ============================================================================
-- Vonai — Google Play Billing (21/08/2026). Cole no Supabase -> SQL Editor -> RUN.
-- Guarda o purchaseToken de cada compra feita dentro do app da Play Store, ligado à conta.
-- É por aqui que o webhook de renovação/cancelamento (/api/play-webhook) acha o aluno.
-- ============================================================================
create table if not exists public.compras_play (
  purchase_token text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  produto text,
  estado text,
  expira_em timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);
create index if not exists compras_play_user_idx on public.compras_play (user_id);
alter table public.compras_play enable row level security;
-- Só a service role (servidor) lê e grava; o app nunca toca nesta tabela.
drop policy if exists "compras_play_ninguem" on public.compras_play;
create policy "compras_play_ninguem" on public.compras_play for all to authenticated using (false) with check (false);
