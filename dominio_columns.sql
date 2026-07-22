-- ============================================================================
-- Vonai — MODELO DE DOMÍNIO NO SERVIDOR (22/07/2026)
-- O "cérebro" do professor (o que o aluno realmente sabe) hoje vive só no
-- localStorage e some quando o aluno troca de celular ou reinstala o app.
-- Estas colunas guardam tudo no banco. Cole no Supabase -> SQL Editor -> RUN.
-- Seguro rodar mais de uma vez. Nenhuma RLS nova: progresso já protege por user_id.
-- ============================================================================

-- SRS por lição: { "Título da lição": { "box": 0-4, "due": "AAAA-MM-DD" } }
alter table progresso add column if not exists srs jsonb;

-- Vocabulário: { "palavra em inglês": "sabe" | "revisar" }
alter table progresso add column if not exists vocab_srs jsonb;

-- Banco de erros reais (questões que o aluno errou, máx. 30):
-- [ { "q": "...", "opts": [...], "ans": 0, "exp": "...", "ctx": "...", "licao": "...", "ok": 0 } ]
alter table progresso add column if not exists erros_qs jsonb;
