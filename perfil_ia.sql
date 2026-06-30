-- ============================================================================
-- SpeakUp — Memória da IA (perfil de aprendizado por aluno)
-- Guarda o histórico vivo do aluno: objetivo, tópicos fracos, dominados, erros.
-- Esse perfil é injetado no prompt do Professor e do Simulador para a IA
-- "lembrar" do aluno entre sessões.
-- Rodar no Supabase -> SQL Editor -> RUN. Seguro rodar 1x.
-- ============================================================================

alter table public.progresso
  add column if not exists perfil_ia jsonb default '{}'::jsonb;
