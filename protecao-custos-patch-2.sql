-- ============================================================
-- PATCH 2 — fecha a brecha das RPCs (rodar no SQL Editor do Supabase)
-- Motivo: no Postgres, funções nascem com EXECUTE para PUBLIC; 'authenticated'
-- herda de PUBLIC. Revogar só de anon/authenticated não bastava — qualquer
-- aluno logado conseguia chamar incrementa_uso direto (com p_limite gigante
-- ou com o UUID de outra pessoa). Testado e confirmado antes deste patch.
-- ============================================================

revoke all on function incrementa_uso(uuid, text, int) from public, anon, authenticated;
revoke all on function incrementa_ip(text, int)        from public, anon, authenticated;
revoke all on function registra_custo(uuid, numeric)   from public, anon, authenticated;

grant execute on function incrementa_uso(uuid, text, int) to service_role;
grant execute on function incrementa_ip(text, int)        to service_role;
grant execute on function registra_custo(uuid, numeric)   to service_role;

-- Depois de rodar, confirme quem tem permissão (deve listar só service_role):
-- select p.proname, r.rolname
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral aclexplode(p.proacl) a
-- join pg_roles r on r.oid = a.grantee
-- where n.nspname = 'public'
--   and p.proname in ('incrementa_uso','incrementa_ip','registra_custo')
--   and a.privilege_type = 'EXECUTE';
