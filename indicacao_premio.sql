-- 12/08/2026 — Prêmio de indicação estilo Nubank (diagnóstico de marketing, Erro 6).
-- Quando o aluno INDICADO vira ASSINANTE, quem indicou ganha +30 dias de Premium (trial_expira).
-- Idempotente; rodar no Supabase SQL Editor.

-- Trava do prêmio em coluna própria e protegida (mesmo padrão do indicado_por):
-- perfil_ia/attrib são graváveis pelo cliente e não servem de trava.
alter table progresso add column if not exists indicacao_premiada_em timestamptz;

-- Resgate atômico: só a 1ª chamada casa (indicacao_premiada_em is null) — renovações
-- mensais chamam de novo e NÃO premiam duas vezes. Devolve o user_id do indicador
-- premiado, ou null se não havia indicador / já foi premiado.
create or replace function premia_indicacao(p_indicado uuid, p_dias int)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_ref uuid;
begin
  update progresso set indicacao_premiada_em = now(), updated_at = now()
  where user_id = p_indicado and indicado_por is not null and indicacao_premiada_em is null
  returning indicado_por into v_ref;
  if v_ref is null then return null; end if;

  -- +30 dias de acesso Premium pro indicador, a partir de agora ou do fim do acesso atual
  -- (mesmo mecanismo do bônus de trial do /api/indicacao).
  update profiles
     set trial_expira = greatest(coalesce(trial_expira, now()), now()) + make_interval(days => p_dias)
   where id = v_ref;
  return v_ref;
end;
$$;

revoke all on function premia_indicacao(uuid, int) from public, anon, authenticated;
grant execute on function premia_indicacao(uuid, int) to service_role;

-- Blindagem: cliente não escreve a coluna nova (versão estendida do protege_progresso
-- de seguranca_extra.sql — só acrescenta a linha do indicacao_premiada_em).
create or replace function protege_progresso()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    if tg_op = 'UPDATE' then
      new.is_premium := old.is_premium;
      new.premium_expira := old.premium_expira;
      new.indicado_por := old.indicado_por;
      new.indicacao_premiada_em := old.indicacao_premiada_em;
      if new.xp is not null and old.xp is not null and new.xp < old.xp then
        new.xp := old.xp;
      end if;
    else
      new.is_premium := false;
      new.premium_expira := null;
      new.indicado_por := null;
      new.indicacao_premiada_em := null;
    end if;
  end if;
  return new;
end;
$$;
