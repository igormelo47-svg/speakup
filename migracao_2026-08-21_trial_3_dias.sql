-- ============================================================================
-- Vonai — MIGRAÇÃO 21/08/2026: trial de 3 dias + colunas de retenção
-- Cole no Supabase -> SQL Editor -> RUN. Idempotente: seguro rodar mais de uma vez.
--
-- Decisão do dono (21/08/2026, noite): trial de 3 dias, com onboarding de 8 telas e resumo do
-- plano antes de liberar o app (padrão Lucida). Substitui a migração de 7 dias aplicada mais
-- cedo no mesmo dia. Quem já ganhou 7 fica com 7.
--
-- NÃO altera trials já concedidos. Rode JUNTO com o deploy que muda PRECO.diasGratis para 3
-- (app/_marketing/ui.tsx) — senão o site promete 3 e o banco dá 7.
-- ============================================================================
begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, plano, ativo, trial_expira)
  values (new.id, new.email,
          coalesce(nullif(new.raw_user_meta_data->>'nome', ''),
                   nullif(new.raw_user_meta_data->>'full_name', ''),
                   nullif(new.raw_user_meta_data->>'name', ''),
                   split_part(new.email, '@', 1)),
          'free', true, now() + interval '3 days')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function protege_profiles()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    if tg_op = 'UPDATE' then
      new.trial_expira := old.trial_expira;
      new.plano := old.plano;
    else
      -- Cadastro: trial de 3 dias definido AQUI (21/08/2026). O app não decide isso.
      new.trial_expira := now() + interval '3 days';
      new.plano := 'free';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_protege_profiles on profiles;
create trigger trg_protege_profiles
  before insert or update on profiles
  for each row execute function protege_profiles();

-- Colunas que os lembretes do dia 2/3 e o WhatsApp usam (seguras se já existirem).
alter table progresso add column if not exists criado_em timestamptz default now();
alter table progresso add column if not exists whatsapp text;
alter table progresso add column if not exists emails_enviados jsonb default '{}'::jsonb;
alter table progresso add column if not exists dias_ativos jsonb default '[]'::jsonb;

commit;

-- Conferência (opcional): as duas funções devem conter "interval '3 days'".
--   select proname, prosrc from pg_proc where proname in ('handle_new_user', 'protege_profiles');
