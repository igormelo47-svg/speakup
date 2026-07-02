-- ============================================================================
-- Vonai - Gamificação: moedas e proteção de sequência (streak freeze).
-- Cole no Supabase -> SQL Editor -> RUN. Seguro rodar 1x.
-- ============================================================================
alter table progresso add column if not exists moedas integer default 0;
alter table progresso add column if not exists streak_freezes integer default 0;
