-- Contatos deixados no RESULTADO do teste de nível público (/teste-de-nivel-de-ingles).
--
-- Por que existe: a campanha do Meta otimiza por "Lead" = teste concluído, mas até aqui
-- ninguém que concluía o teste deixava contato. Quem não clicava em "criar conta" na hora
-- sumia para sempre — pagávamos pelo clique e jogávamos a pessoa fora. Esta tabela é o
-- único jeito de chamar essa gente de volta (e-mail é o canal que não depende de verba).
--
-- O teste continua SEM cadastro e SEM e-mail obrigatório: o campo aparece depois do
-- resultado, é opcional, e recusar não esconde nada.

create table if not exists public.leads_teste (
  id          bigserial primary key,
  email       text not null,
  nivel       text,
  acertos     int,
  attrib      jsonb,                    -- gclid/fbclid/utm do primeiro toque (speakup_attrib)
  origem      text default 'teste-nivel',
  virou_conta boolean default false,    -- preenchido pela conferência periódica abaixo
  created_at  timestamptz default now()
);

-- Mesma pessoa pode refazer o teste; um contato só na lista. O índice é na coluna crua
-- (e não em lower(email)) de propósito: o upsert do Supabase precisa apontar para uma
-- coluna, não para uma expressão. Quem normaliza para minúsculas é a rota /api/lead-email.
create unique index if not exists leads_teste_email_uk
  on public.leads_teste (email);

create index if not exists leads_teste_created_idx
  on public.leads_teste (created_at desc);

-- A tabela é escrita SÓ pelo servidor (rota /api/lead-email com service role, que ignora
-- RLS). Ligar RLS sem nenhuma policy = ninguém lê nem escreve pelo anon/authenticated.
-- É de propósito: lista de e-mail exposta é vazamento de dado pessoal.
alter table public.leads_teste enable row level security;

-- Quantos contatos entraram e quantos já viraram conta (rodar quando quiser olhar):
--
--   update public.leads_teste l
--      set virou_conta = true
--     from auth.users u
--    where lower(u.email) = lower(l.email)
--      and l.virou_conta = false;
--
--   select count(*) filter (where not virou_conta) as ainda_nao_criaram_conta,
--          count(*) filter (where virou_conta)     as viraram_conta,
--          count(*)                                as total
--     from public.leads_teste;
