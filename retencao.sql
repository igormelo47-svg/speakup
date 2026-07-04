-- ============================================================
-- RETENÇÃO DO VONAI — rode no painel do Supabase (SQL Editor)
-- ============================================================
-- Passo 1 (UMA VEZ): cria a coluna que o app passou a preencher.
-- O app grava um marcador por dia de uso em progresso.dias_ativos
-- (array de datas 'YYYY-MM-DD', máximo 60 dias).

alter table progresso add column if not exists dias_ativos jsonb default '[]'::jsonb;

-- ============================================================
-- Passo 2: consultas prontas (rode quando quiser ver os números)
-- ============================================================

-- ---- Visão geral: alunos, ativos hoje, ativos nos últimos 7 dias
select
  count(*)                                                              as alunos_total,
  count(*) filter (where dias_ativos ? to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM-DD')) as ativos_hoje,
  count(*) filter (where exists (
    select 1 from jsonb_array_elements_text(dias_ativos) d
    where d::date >= (now() at time zone 'America/Sao_Paulo')::date - 6
  ))                                                                    as ativos_7_dias
from progresso;

-- ---- Retenção D1 / D7 / D30 por coorte de cadastro
-- Lê: dos alunos que se cadastraram em cada dia, quantos % voltaram
-- 1, 7 e 30 dias depois. (Considera coortes com pelo menos 1 aluno.)
with base as (
  select
    user_id,
    (criado_em at time zone 'America/Sao_Paulo')::date as dia_cadastro,
    dias_ativos
  from progresso
  where criado_em is not null
)
select
  dia_cadastro,
  count(*) as cadastros,
  round(100.0 * count(*) filter (where dias_ativos ? to_char(dia_cadastro + 1,  'YYYY-MM-DD')) / count(*), 1) as d1_pct,
  round(100.0 * count(*) filter (where dias_ativos ? to_char(dia_cadastro + 7,  'YYYY-MM-DD')) / count(*), 1) as d7_pct,
  round(100.0 * count(*) filter (where dias_ativos ? to_char(dia_cadastro + 30, 'YYYY-MM-DD')) / count(*), 1) as d30_pct
from base
where dia_cadastro <= (now() at time zone 'America/Sao_Paulo')::date - 1
group by dia_cadastro
order by dia_cadastro desc
limit 30;

-- ---- Distribuição de engajamento: quantos dias cada aluno usou nos últimos 30
select
  case
    when dias_30 = 0 then '0 dias (sumiu)'
    when dias_30 between 1 and 3 then '1-3 dias'
    when dias_30 between 4 and 10 then '4-10 dias'
    when dias_30 between 11 and 20 then '11-20 dias'
    else '21-30 dias (viciado 🔥)'
  end as faixa,
  count(*) as alunos
from (
  select user_id, (
    select count(*) from jsonb_array_elements_text(dias_ativos) d
    where d::date >= (now() at time zone 'America/Sao_Paulo')::date - 29
  ) as dias_30
  from progresso
) t
group by faixa
order by min(dias_30);

-- ---- Alunos em risco: tinham sequência boa e pararam há 2+ dias (para campanhas)
select user_id, email, streak, ultima_atividade
from progresso
where streak >= 3
  and ultima_atividade < to_char((now() at time zone 'America/Sao_Paulo')::date - 1, 'YYYY-MM-DD')::date
order by streak desc
limit 50;

-- Obs.: eventos de produto (licao_concluida, professor_mensagem, simulador_mensagem,
-- pronuncia_avaliada, cadastro, login) aparecem no painel da Vercel:
-- vercel.com → projeto speakup → Analytics → Events.
