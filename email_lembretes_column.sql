-- Descadastro dos lembretes por e-mail (item 5 da política de privacidade).
-- Aplicar no Supabase: SQL Editor -> colar -> RUN.
--
-- Default TRUE porque o lembrete é comunicação de serviço sobre uma conta que a
-- pessoa criou, com descadastro em um clique em todo e-mail. Quem clicar vira FALSE
-- e nunca mais recebe.
--
-- A rota /api/send-reminders funciona ANTES desta coluna existir (trata o erro e
-- segue mandando), mas o descadastro em /api/descadastrar SÓ funciona depois.
-- Enquanto não aplicar, quem clicar em "não quero mais" vê mensagem de erro e
-- continua recebendo -- que é exatamente o caminho para uma marcação de spam.
-- Ou seja: aplicar ANTES de ligar o envio.

alter table progresso add column if not exists email_lembretes boolean default true;

-- Índice para o cron não varrer a tabela inteira quando a base crescer.
create index if not exists progresso_email_lembretes_idx
  on progresso (email_lembretes)
  where email_lembretes = false;
