-- ============================================================================
-- Vonai — MIGRAÇÃO 21/08/2026: trial de 7 dias + colunas de retenção
-- Cole no Supabase -> SQL Editor -> RUN. Idempotente: seguro rodar mais de uma vez.
--
-- Por quê (painel de 21/08): 97% dos alunos usam o app UM dia; 1 em 32 volta num segundo
-- dia; 0 assinantes vindos de anúncio. Com trial de 2 dias ninguém forma hábito nem chega
-- ao dia 7 da "aposta de 7 dias" que o app passou a propor no fim da 1ª sessão.
-- Benchmarks de Educação (RevenueCat, State of Subscription Apps 2026): metade dos apps usa
-- trial de 5–9 dias; trials mais longos convertem até 70% melhor que os curtos.
--
-- NÃO altera trials já concedidos. Rode JUNTO com o deploy que muda PRECO.diasGratis para 7
-- (app/_marketing/ui.tsx) — senão o site promete 7 e o banco dá 2.
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
          'free', true, now() + interval '7 days')
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
      -- Cadastro: trial de 7 dias definido AQUI (21/08/2026). O app não decide isso.
      new.trial_expira := now() + interval '7 days';
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

-- Conferência (opcional): as duas funções devem conter "interval '7 days'".
--   select proname, prosrc from pg_proc where proname in ('handle_new_user', 'protege_profiles');
