-- Diário de bordo dos webhooks de pagamento.
--
-- Motivo: em 17/08/2026 a primeira venda no Android foi paga na Kiwify e o aluno não
-- recebeu o Premium. Não deu para descobrir o porquê, porque uma chamada recusada (401)
-- não deixava rastro nenhum: pagamentos_pendentes só registra o que já passou pela
-- autenticação, e o plano grátis da Vercel não guarda os logs por tempo suficiente.
--
-- Esta tabela registra TODA batida na porta, autorizada ou não. Nunca guarda o segredo —
-- só se ele existe no servidor e se a chamada trouxe token/assinatura, que é o bastante
-- para separar "a Kiwify não chamou" de "chamou e a senha não confere".

create table if not exists webhook_recebidos (
  id             bigserial primary key,
  criado_em      timestamptz not null default now(),
  origem         text not null,              -- 'kiwify' | 'revenuecat'
  autorizado     boolean not null,           -- passou na autenticação?
  tem_segredo    boolean,                    -- a env do segredo existe no servidor?
  tem_token      boolean,                    -- a chamada veio com ?token=
  tem_assinatura boolean,                    -- a chamada veio com ?signature=
  tipo           text,                       -- tipo do evento, quando dá para ler
  bytes          integer                     -- tamanho do corpo recebido
);

create index if not exists webhook_recebidos_criado_em_idx on webhook_recebidos (criado_em desc);

-- Só o servidor (service_role) escreve e lê. Sem políticas, anon e usuário logado não veem nada.
alter table webhook_recebidos enable row level security;

-- Consulta do dia a dia — as últimas batidas:
--   select criado_em, origem, autorizado, tem_segredo, tem_token, tem_assinatura, tipo
--   from webhook_recebidos order by criado_em desc limit 20;
