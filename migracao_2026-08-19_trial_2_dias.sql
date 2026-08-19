-- ============================================================================
-- Vonai — MIGRAÇÃO 19/08/2026: trial volta para 2 dias (paywall duro de novo)
-- Cole no Supabase -> SQL Editor -> RUN. Idempotente: seguro rodar mais de uma vez.
--
-- O que mudou no produto (ver MONETIZACAO.md):
--   - Trial volta de 7 para 2 dias de Premium completo, sem cartão.
--   - Depois do trial o app TRANCA na tela de assinatura (sem plano grátis). O servidor
--     voltou a responder 402 em chat/tts/stt para quem não tem trial nem assinatura.
--   - O freemium de 18/08 (migracao_2026-08-18_freemium.sql) ficou no histórico do git.
--     As outras partes daquela migração (pagamentos_pendentes, webhook_recebidos.s1,
--     progresso.emails_enviados) CONTINUAM valendo — esta só mexe na duração do trial.
--
-- NÃO altera trials já concedidos: quem ganhou 7 dias em 18/08 fica com os 7 dias.
-- ============================================================================
begin;

-- ---------------------------------------------------------------------------
-- TRIAL DE 2 DIAS — dois lugares decidem a duração, e os dois precisam mudar:
--
--   1) handle_new_user: trigger de auth.users que cria o profile no cadastro.
--   2) protege_profiles (protecao-custos.sql): trigger BEFORE INSERT/UPDATE em profiles
--      que, para qualquer chamada que não seja service_role, IGNORA o trial_expira que
--      veio e grava now() + 2 days. Como o handle_new_user roda no contexto do auth (sem
--      JWT de service_role), é ESTE trigger que dá a palavra final — mudar só o
--      handle_new_user deixaria o trial em 7 dias sem ninguém entender por quê.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, plano, ativo, trial_expira)
  values (new.id, new.email,
          -- Nome opcional no cadastro (AuthForm) e no login com Google: cai na parte antes do @.
          coalesce(nullif(new.raw_user_meta_data->>'nome', ''),
                   nullif(new.raw_user_meta_data->>'full_name', ''),
                   nullif(new.raw_user_meta_data->>'name', ''),
                   split_part(new.email, '@', 1)),
          'free', true, now() + interval '2 days')
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
      -- Cadastro: o trial de 2 dias é definido AQUI, não pelo app (foi 7 dias só em 18/08/2026).
      new.trial_expira := now() + interval '2 days';
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

commit;

-- Conferência (opcional): a função tem que conter "interval '2 days'".
--   select prosrc from pg_proc where proname in ('handle_new_user', 'protege_profiles');
