-- 29/07/2026 — endurecimento pós-auditoria (APLICADO em 29/07). Idempotente.

-- 1) Trial do trigger de novo usuário: 2 dias (estava 7; o trigger de proteção mascarava —
--    mas a duração do produto não pode depender só da blindagem).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, plano, ativo, trial_expira)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
          'free', true, now() + interval '2 days')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Trava de indicação em coluna própria (perfil_ia é gravável pelo cliente — a trava
--    antiga podia ser apagada pelo próprio aluno pra resgatar o bônus de novo).
alter table progresso add column if not exists indicado_por uuid;

-- Resgate atômico: só a 1ª chamada casa (indicado_por is null) — mata a race de N requests.
create or replace function marca_indicacao(p_user uuid, p_ref uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_ok int;
begin
  update progresso set indicado_por = p_ref, updated_at = now()
  where user_id = p_user and indicado_por is null
  returning 1 into v_ok;
  return v_ok is not null;
end;
$$;

-- Moedas atômicas (o read-modify-write do servidor perdia updates concorrentes).
create or replace function soma_moedas(p_user uuid, p_qtd int)
returns void
language sql
security definer
set search_path = public
as $$
  update progresso set moedas = coalesce(moedas, 0) + p_qtd, updated_at = now()
  where user_id = p_user;
$$;

revoke all on function marca_indicacao(uuid, uuid) from public, anon, authenticated;
revoke all on function soma_moedas(uuid, int) from public, anon, authenticated;
grant execute on function marca_indicacao(uuid, uuid) to service_role;
grant execute on function soma_moedas(uuid, int) to service_role;

-- 3) Rate limit de feedback usa o mesmo contador atômico das rotas de IA.
alter table uso_ia add column if not exists feedback int not null default 0;
create or replace function incrementa_uso(p_user uuid, p_tipo text, p_limite int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dia date := (now() at time zone 'America/Sao_Paulo')::date;
  v_novo int;
begin
  if p_tipo not in ('chat','tts','stt','feedback') then
    return false;
  end if;
  insert into uso_ia (user_id, dia) values (p_user, v_dia)
  on conflict (user_id, dia) do nothing;

  execute format(
    'update uso_ia set %I = %I + 1, updated_at = now()
     where user_id = $1 and dia = $2 and %I < $3
     returning %I', p_tipo, p_tipo, p_tipo, p_tipo)
  into v_novo using p_user, v_dia, p_limite;

  return v_novo is not null;
end;
$$;

-- 4) Blindagem do progresso: além de is_premium, preserva premium_expira e indicado_por,
--    e nunca aceita XP menor vindo do app (aparelho com estado velho não regride o aluno).
create or replace function protege_progresso()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    if tg_op = 'UPDATE' then
      new.is_premium := old.is_premium;
      new.premium_expira := old.premium_expira;
      new.indicado_por := old.indicado_por;
      if new.xp is not null and old.xp is not null and new.xp < old.xp then
        new.xp := old.xp;
      end if;
    else
      new.is_premium := false;
      new.premium_expira := null;
      new.indicado_por := null;
    end if;
  end if;
  return new;
end;
$$;
