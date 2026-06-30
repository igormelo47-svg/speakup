-- ============================================================================
-- CORREÇÃO: XP / progresso não eram salvos
-- ----------------------------------------------------------------------------
-- Causa: progresso.user_id tem FK -> profiles.id, mas o RLS da tabela
-- "profiles" bloqueava a criação do perfil pelo app. Sem perfil, toda gravação
-- em "progresso" (XP, streak, lições) falhava silenciosamente.
--
-- Como aplicar: Supabase -> SQL Editor -> cole tudo -> RUN.
-- É seguro rodar mais de uma vez (idempotente).
-- ============================================================================

-- 1) Permite que cada usuário CRIE e LEIA a própria linha em profiles
drop policy if exists "users_insert_own_profile" on public.profiles;
create policy "users_insert_own_profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "users_select_own_profile" on public.profiles;
create policy "users_select_own_profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- 2) Backfill: cria profiles para todos os usuários já cadastrados que estão sem
insert into public.profiles (id, email, nome, plano, ativo, trial_expira)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)),
       'free', true, now() + interval '7 days'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Cria o profile automaticamente para todo NOVO cadastro (à prova de falhas,
--    funciona mesmo quando o usuário confirma o e-mail por link)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, plano, ativo, trial_expira)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
          'free', true, now() + interval '7 days')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
