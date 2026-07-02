-- ============================================================================
-- Vonai - Liga semanal (ranking de XP entre alunos).
-- Cole no Supabase -> SQL Editor -> RUN. Seguro rodar 1x.
-- A view expõe SOMENTE nome + XP da semana (não expõe e-mail, is_premium, etc.).
-- ============================================================================
alter table progresso add column if not exists nome text;
alter table progresso add column if not exists sem_num integer default 0;
alter table progresso add column if not exists sem_base_xp integer default 0;
alter table progresso add column if not exists sem_xp integer default 0;

-- View de leitura pública do ranking. security_invoker=off => roda como dono e
-- ignora o RLS da tabela, mas só devolve as 3 colunas seguras abaixo.
create or replace view ranking_semanal
  with (security_invoker = off) as
  select nome, sem_num, sem_xp
  from progresso
  where nome is not null;

grant select on ranking_semanal to anon, authenticated;
