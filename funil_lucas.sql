-- =====================================================================
-- FUNIL — os dois últimos degraus que o Lucas pediu (desde 13/08)
-- Rodar no SQL Editor do Supabase. Só leitura, exceto o UPDATE do bloco 2
-- (que apenas marca leads_teste.virou_conta e é seguro repetir).
--
-- O Lucas entrega, pelo Meta: quantos chegaram na landing, quantos
-- começaram o teste e quantos terminaram as 12 perguntas (= "Lead").
-- Estas consultas entregam o resto: quantos viraram cadastro, quantos
-- ativaram e quantos voltaram no dia seguinte.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) CADASTROS POR DIA, POR ORIGEM  ← o número que ele pede há 16 dias
--    Compare a coluna "meta" com os leads que ele reporta no mesmo dia
--    (17 no dia 25, 14 no 26, 6 no 27, 8 no 28).
-- ---------------------------------------------------------------------
select
  (criado_em at time zone 'America/Sao_Paulo')::date as dia,
  count(*)                                                              as cadastros_total,
  count(*) filter (where attrib->>'fbclid' is not null
                      or attrib->>'utm_source' in ('facebook','instagram','fb','ig'))  as meta,
  count(*) filter (where attrib->>'gclid' is not null
                      or attrib->>'utm_source' = 'google')              as google,
  count(*) filter (where attrib is null or attrib = '{}'::jsonb)        as sem_atribuicao
from progresso
where criado_em >= (now() at time zone 'America/Sao_Paulo')::date - 20
group by 1
order by 1 desc;


-- ---------------------------------------------------------------------
-- 2) TESTE CONCLUÍDO → CADASTRO (para quem deixou e-mail no resultado)
--    Atenção: leads_teste só tem quem deixou e-mail (campo opcional),
--    então o total aqui é MENOR que o nº de "Leads" do Meta. A taxa
--    virou_conta, porém, é a melhor estimativa que existe hoje.
-- ---------------------------------------------------------------------
update public.leads_teste l
   set virou_conta = true
  from auth.users u
 where lower(u.email) = lower(l.email)
   and l.virou_conta = false;

select
  count(*)                                        as deixaram_email,
  count(*) filter (where virou_conta)             as viraram_conta,
  round(100.0 * count(*) filter (where virou_conta) / nullif(count(*),0), 1) as taxa_pct
from public.leads_teste
where created_at >= (now() at time zone 'America/Sao_Paulo')::date - 20;

-- Mesma coisa, dia a dia:
select
  (created_at at time zone 'America/Sao_Paulo')::date as dia,
  count(*)                            as deixaram_email,
  count(*) filter (where virou_conta) as viraram_conta
from public.leads_teste
where created_at >= (now() at time zone 'America/Sao_Paulo')::date - 20
group by 1
order by 1 desc;


-- ---------------------------------------------------------------------
-- 3) O DEGRAU DEPOIS DO CADASTRO — cadastro → ativação → volta no D1
--    Só de quem veio de anúncio, últimos 20 dias.
--    É aqui que o buraco apareceu na última leitura (15 contas de
--    anúncio, zero voltaram no 2º dia).
-- ---------------------------------------------------------------------
with anuncio as (
  select
    user_id,
    (criado_em at time zone 'America/Sao_Paulo')::date as dia_cadastro,
    ativado_em,
    dias_ativos
  from progresso
  where criado_em >= (now() at time zone 'America/Sao_Paulo')::date - 20
    and (attrib->>'fbclid' is not null
         or attrib->>'gclid' is not null
         or attrib->>'utm_source' is not null)
)
select
  count(*)                                                            as cadastros_anuncio,
  count(ativado_em)                                                   as ativaram,
  round(100.0 * count(ativado_em) / nullif(count(*),0), 1)            as ativacao_pct,
  count(*) filter (where dias_ativos ? to_char(dia_cadastro + 1, 'YYYY-MM-DD')) as voltaram_d1,
  round(100.0 * count(*) filter (where dias_ativos ? to_char(dia_cadastro + 1, 'YYYY-MM-DD'))
        / nullif(count(*),0), 1)                                      as d1_pct
from anuncio;


-- ---------------------------------------------------------------------
-- 4) TRÁFEGO OU PRODUTO? — ativação de quem veio de anúncio vs orgânico.
--    Taxas parecidas = o problema está DEPOIS do cadastro (produto),
--    não na segmentação do Lucas.
-- ---------------------------------------------------------------------
select
  case when attrib->>'fbclid' is not null
         or attrib->>'gclid'  is not null
         or attrib->>'utm_source' is not null then 'anuncio' else 'organico' end as origem,
  count(*)                                                  as contas,
  count(ativado_em)                                         as ativados,
  round(100.0 * count(ativado_em) / nullif(count(*), 0), 1) as taxa_pct
from progresso
where criado_em >= (now() at time zone 'America/Sao_Paulo')::date - 30
group by 1;


-- ---------------------------------------------------------------------
-- 5) CONTROLE — a estreia pela fala subiu em 28/08. Rodar esta a partir
--    de 31/08 para ver se a ativação de quem entra por anúncio mudou.
-- ---------------------------------------------------------------------
select
  case when criado_em < timestamptz '2026-08-28 00:00-03' then 'antes da estreia pela fala'
       else 'depois' end                                    as fase,
  count(*)                                                  as contas,
  count(ativado_em)                                         as ativados,
  round(100.0 * count(ativado_em) / nullif(count(*), 0), 1) as ativacao_pct
from progresso
where criado_em >= (now() at time zone 'America/Sao_Paulo')::date - 20
  and (attrib->>'fbclid' is not null
       or attrib->>'gclid' is not null
       or attrib->>'utm_source' is not null)
group by 1
order by 1 desc;
