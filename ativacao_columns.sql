-- Aplicar no SQL Editor do Supabase ANTES do deploy (03/08/2026). Seguro rodar de novo.
--
-- ATIVAÇÃO: o momento em que o aluno deixou de ser "cadastro" e virou "aluno" — ele
-- concluiu o nivelamento, a 1ª lição ou a 1ª conversa, o que vier primeiro.
--
-- Fica no nosso banco (e não só no GA4) por dois motivos: dá pra cruzar ativação com a
-- origem do tráfego (progresso.attrib->>'gclid') sem depender do GTM/GA4 de ninguém, e a
-- idempotência passa a ser por USUÁRIO — o localStorage do cliente esquece quando o aluno
-- troca de aparelho, e o evento dispararia de novo.

alter table progresso add column if not exists ativado_em timestamptz;
alter table progresso add column if not exists ativado_por text;

-- Consulta que responde "o gargalo é tráfego ou produto?": compara a taxa de ativação
-- de quem veio de anúncio com a de quem veio orgânico. Se as duas forem parecidas, o
-- problema está depois do cadastro (produto), não na segmentação.
--
--   select
--     case when attrib->>'gclid' is not null then 'anuncio' else 'organico' end as origem,
--     count(*) as contas,
--     count(ativado_em) as ativados,
--     round(100.0 * count(ativado_em) / nullif(count(*), 0), 1) as taxa_pct
--   from progresso
--   group by 1;
