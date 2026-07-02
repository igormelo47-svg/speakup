-- ============================================================================
-- Vonai - Colunas para a trava de uso no SERVIDOR (proteção de custo da IA).
-- A rota /api/chat conta as chamadas por dia por usuário aqui (não dá pra burlar
-- pelo app). Cole no Supabase -> SQL Editor -> RUN. Seguro rodar 1x.
-- ============================================================================
alter table progresso add column if not exists chat_dia_data text;
alter table progresso add column if not exists chat_dia_count integer default 0;
