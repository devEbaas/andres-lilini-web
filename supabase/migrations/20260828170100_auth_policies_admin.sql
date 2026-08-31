-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — acceso del panel admin
-- ─────────────────────────────────────────────────────────────
-- Hasta ahora estas tablas no tenían ninguna policy: `anon` queda
-- bloqueado y todo entra por Server Actions con service role, que
-- ignora RLS por diseño.
--
-- El panel NO usa esa llave. Lee con el cliente autenticado del
-- admin, y por tanto pasa por estas policies. Así, si el gate de
-- rutas fallara, Postgres sigue devolviendo cero filas: la
-- frontera está en la base, no en un `if` de la aplicación.

-- Pedidos ─────────────────────────────────────────────────────
drop policy if exists "admin lee pedidos" on public.orders;
create policy "admin lee pedidos"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

-- Postulaciones ───────────────────────────────────────────────
drop policy if exists "admin lee postulaciones" on public.applications;
create policy "admin lee postulaciones"
  on public.applications for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admin actualiza postulaciones" on public.applications;
create policy "admin actualiza postulaciones"
  on public.applications for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Convocatoria ────────────────────────────────────────────────
drop policy if exists "admin lee convocatoria" on public.convocatoria_entries;
create policy "admin lee convocatoria"
  on public.convocatoria_entries for select
  to authenticated
  using ((select public.is_admin()));

-- Mensajes de contacto ────────────────────────────────────────
drop policy if exists "admin lee mensajes" on public.contact_messages;
create policy "admin lee mensajes"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admin marca mensajes" on public.contact_messages;
create policy "admin marca mensajes"
  on public.contact_messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Boletín ─────────────────────────────────────────────────────
drop policy if exists "admin lee boletin" on public.newsletter_subscribers;
create policy "admin lee boletin"
  on public.newsletter_subscribers for select
  to authenticated
  using ((select public.is_admin()));

-- Sin policies de delete para nadie: borrar se hace desde el SQL
-- editor, deliberadamente incómodo.

-- Registro de acciones ────────────────────────────────────────
-- Es lo único que responde «¿quién descargó esto?» cuando alguien
-- lo pregunte. Se escribe con service role desde las Server
-- Actions; los admins sólo pueden leerlo.
create table if not exists public.admin_audit (
  id           bigint generated always as identity primary key,
  actor_id     uuid references auth.users on delete set null,
  actor_email  text,   -- copia: sobrevive al borrado de la cuenta
  action       text not null,
  target_table text,
  target_id    text,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists admin_audit_created_at_idx
  on public.admin_audit (created_at desc);

alter table public.admin_audit enable row level security;

drop policy if exists "admin lee la auditoría" on public.admin_audit;
create policy "admin lee la auditoría"
  on public.admin_audit for select
  to authenticated
  using ((select public.is_admin()));

-- Sin policy de insert a propósito: escribe la service role.
