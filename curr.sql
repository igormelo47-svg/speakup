-- ============================================================
-- CURR — Current User Retention Rate (métrica-guia do Duolingo)
-- "De quem estudou ONTEM e ANTEONTEM, quantos % voltaram HOJE?"
-- Rode no Supabase SQL Editor sempre que quiser ver (ou salve
-- como snippet). Usa progresso.dias_ativos (o app preenche sozinho).
-- ============================================================

-- ---- CURR dos últimos 14 dias, dia a dia
with dias as (
  select ((now() at time zone 'America/Sao_Paulo')::date - n) as dia
  from generate_series(0, 13) n
),
base as (
  select d.dia,
    count(*) filter (
      where p.dias_ativos ? to_char(d.dia - 1, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia - 2, 'YYYY-MM-DD')
    ) as elegiveis,   -- ativos nos 2 dias anteriores
    count(*) filter (
      where p.dias_ativos ? to_char(d.dia - 1, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia - 2, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia,     'YYYY-MM-DD')
    ) as voltaram     -- ...que também vieram no dia
  from dias d
  cross join progresso p
  group by d.dia
)
select
  to_char(dia, 'DD/MM (Dy)') as dia,
  elegiveis,
  voltaram,
  case when elegiveis > 0
    then round(100.0 * voltaram / elegiveis, 1) || '%'
    else '—' end as curr
from base
order by dia desc;

-- ---- Resumo da semana: CURR médio + DAU médio (últimos 7 dias)
with dias as (
  select ((now() at time zone 'America/Sao_Paulo')::date - n) as dia
  from generate_series(1, 7) n   -- exclui hoje (dia incompleto)
),
base as (
  select d.dia,
    count(*) filter (where p.dias_ativos ? to_char(d.dia, 'YYYY-MM-DD')) as dau,
    count(*) filter (
      where p.dias_ativos ? to_char(d.dia - 1, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia - 2, 'YYYY-MM-DD')
    ) as elegiveis,
    count(*) filter (
      where p.dias_ativos ? to_char(d.dia - 1, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia - 2, 'YYYY-MM-DD')
        and p.dias_ativos ? to_char(d.dia,     'YYYY-MM-DD')
    ) as voltaram
  from dias d
  cross join progresso p
  group by d.dia
)
select
  round(avg(dau), 1)                                        as dau_medio_7d,
  sum(elegiveis)                                            as elegiveis_7d,
  sum(voltaram)                                             as voltaram_7d,
  case when sum(elegiveis) > 0
    then round(100.0 * sum(voltaram) / sum(elegiveis), 1) || '%'
    else 'ainda sem dados (precisa de 3+ dias de uso)' end  as curr_7d
from base;
