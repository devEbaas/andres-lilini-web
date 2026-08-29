-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — estados de las postulaciones
-- ─────────────────────────────────────────────────────────────
-- La columna existía con default 'recibida' y sin restricción: el
-- panel ya escribe en ella, así que el conjunto de valores deja de
-- ser una convención y pasa a estar en la base. Mismo criterio que
-- `orders_status_check`.
--
--   recibida        → entró por el formulario, sin revisar
--   en_revision     → alguien la está viendo
--   preseleccionada → pasa a la siguiente fase
--   aceptada        → dentro del programa
--   descartada      → no continúa

update public.applications
set status = 'recibida'
where status not in ('recibida', 'en_revision', 'preseleccionada', 'aceptada', 'descartada');

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('recibida', 'en_revision', 'preseleccionada', 'aceptada', 'descartada'));
