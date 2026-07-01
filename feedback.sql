-- ============================================================================
-- SpeakUp — Caixa de feedback dos alunos
-- O aluno envia feedback pela área discreta no rodapé da Home.
-- Você lê tudo em: Supabase -> Table Editor -> feedback (ordenado por created_at).
-- Rodar no Supabase -> SQL Editor -> RUN.
-- ============================================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  mensagem text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback
  for insert to authenticated
  with check (auth.uid() = user_id);
