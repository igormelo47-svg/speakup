-- ============================================================
-- PROTEÇÃO DE CUSTOS E ASSINATURA — rodar no Supabase SQL Editor
-- (uma vez; pode rodar de novo sem quebrar: tudo é IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- 1) USO DIÁRIO DE IA POR USUÁRIO (contagem atômica + custo)
create table if not exists uso_ia (
  user_id uuid not null,
  dia date not null,
  chat int not null default 0,
  tts int not null default 0,
  stt int not null default 0,
  custo_usd numeric(10,6) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, dia)
);
alter table uso_ia enable row level security;
-- Sem policies: cliente NÃO lê nem escreve; só o servidor (service_role) acessa.

-- 2) USO DIÁRIO POR IP (rede extra contra abuso em massa)
create table if not exists uso_ip (
  ip text not null,
  dia date not null,
  count int not null default 0,
  primary key (ip, dia)
);
alter table uso_ip enable row level security;

-- 3) CONTAGEM ATÔMICA: incrementa e checa o teto numa operação só.
--    Retorna true = pode usar; false = estourou o limite.
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
  if p_tipo not in ('chat','tts','stt') then
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

create or replace function incrementa_ip(p_ip text, p_limite int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dia date := (now() at time zone 'America/Sao_Paulo')::date;
  v_novo int;
begin
  insert into uso_ip (ip, dia) values (p_ip, v_dia)
  on conflict (ip, dia) do nothing;
  update uso_ip set count = count + 1
    where ip = p_ip and dia = v_dia and count < p_limite
    returning count into v_novo;
  return v_novo is not null;
end;
$$;

-- 4) REGISTRO DE CUSTO (chamado pelo servidor depois de cada chamada de IA)
create or replace function registra_custo(p_user uuid, p_custo numeric)
returns void
language sql
security definer
set search_path = public
as $$
  update uso_ia set custo_usd = custo_usd + p_custo, updated_at = now()
  where user_id = p_user and dia = (now() at time zone 'America/Sao_Paulo')::date;
$$;

-- Só o servidor pode chamar as funções (revoga do cliente).
revoke execute on function incrementa_uso(uuid, text, int) from anon, authenticated;
revoke execute on function incrementa_ip(text, int) from anon, authenticated;
revoke execute on function registra_custo(uuid, numeric) from anon, authenticated;

-- 5) BLINDAGEM: is_premium (progresso) e trial_expira/plano (profiles)
--    só mudam via servidor (service_role). O app pode continuar fazendo upsert
--    das outras colunas — o trigger preserva as protegidas.
create or replace function protege_progresso()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    if tg_op = 'UPDATE' then
      new.is_premium := old.is_premium;
    else
      new.is_premium := false;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_protege_progresso on progresso;
create trigger trg_protege_progresso
  before insert or update on progresso
  for each row execute function protege_progresso();

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
      -- Cadastro: o trial de 2 dias é definido AQUI, não pelo app.
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

-- 6) RELATÓRIO RÁPIDO DE CUSTO (para acompanhar depois):
-- select dia, count(*) alunos, sum(chat) chat, sum(tts) tts, sum(stt) stt,
--        round(sum(custo_usd), 4) custo_usd
-- from uso_ia group by dia order by dia desc limit 14;
--
-- Top gastadores de hoje:
-- select u.user_id, p.email, u.chat, u.tts, u.stt, round(u.custo_usd,4) custo
-- from uso_ia u left join profiles p on p.id = u.user_id
-- where u.dia = (now() at time zone 'America/Sao_Paulo')::date
-- order by u.custo_usd desc limit 20;
