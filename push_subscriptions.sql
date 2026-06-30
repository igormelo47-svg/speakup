-- ============================================================================
-- SpeakUp — Tabela para lembretes (Web Push)
-- Guarda a "inscrição de push" de cada aluno. O envio diário (Vercel Cron) lê
-- esta tabela com a service role e dispara a notificação para quem não estudou hoje.
-- Rodar no Supabase -> SQL Editor -> RUN.
-- ============================================================================

create table if not exists public.push_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscription jsonb not null,
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "own_push_sub" on public.push_subscriptions;
create policy "own_push_sub" on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
