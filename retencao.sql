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

-- ---- Retenção D1 / D7 / D30 AGREGADA (um número único de cada, para
-- comparar com as metas: D1 ≥ 25%, D7 ≥ 12%, D30 ≥ 8%).
-- Cada taxa só conta alunos "elegíveis" (cadastrados há tempo suficiente
-- para poderem ter voltado) e usa janela (D7 = voltou em algum dos dias
-- 5-7; D30 = dias 25-30), mais estável com poucos alunos que o dia exato.
with base as (
  select
    user_id,
    (criado_em at time zone 'America/Sao_Paulo')::date as dia_cadastro,
    dias_ativos
  from progresso
  where criado_em is not null
),
hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d),
flags as (
  select
    b.dia_cadastro,
    b.dias_ativos ? to_char(b.dia_cadastro + 1, 'YYYY-MM-DD') as d1,
    b.dias_ativos ?| array[
      to_char(b.dia_cadastro + 5, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 6, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 7, 'YYYY-MM-DD')
    ] as d7,
    b.dias_ativos ?| array[
      to_char(b.dia_cadastro + 25, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 26, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 27, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 28, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 29, 'YYYY-MM-DD'),
      to_char(b.dia_cadastro + 30, 'YYYY-MM-DD')
    ] as d30
  from base b
)
select
  count(*) filter (where dia_cadastro <= (select d from hoje) - 1)  as coorte_d1,
  round(100.0 * count(*) filter (where d1 and dia_cadastro <= (select d from hoje) - 1)
        / nullif(count(*) filter (where dia_cadastro <= (select d from hoje) - 1), 0), 1)  as d1_pct,
  count(*) filter (where dia_cadastro <= (select d from hoje) - 7)  as coorte_d7,
  round(100.0 * count(*) filter (where d7 and dia_cadastro <= (select d from hoje) - 7)
        / nullif(count(*) filter (where dia_cadastro <= (select d from hoje) - 7), 0), 1)  as d7_pct,
  count(*) filter (where dia_cadastro <= (select d from hoje) - 30) as coorte_d30,
  round(100.0 * count(*) filter (where d30 and dia_cadastro <= (select d from hoje) - 30)
        / nullif(count(*) filter (where dia_cadastro <= (select d from hoje) - 30), 0), 1) as d30_pct
from flags;

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
