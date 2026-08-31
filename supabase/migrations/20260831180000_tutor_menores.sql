-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — consentimiento del tutor para menores
-- ─────────────────────────────────────────────────────────────
-- El aviso de privacidad ya prometía que toda postulación de un
-- menor requiere consentimiento expreso del tutor «incluidos nombre
-- completo, parentesco y medio de contacto verificable». Los campos
-- existían en el programa pero eran opcionales, y en la convocatoria
-- no existían: se prometía algo que no se recogía.
--
-- La convocatoria es para jugadores de 12 a 21 años, así que la
-- mayoría de quienes se postulan son menores. Esto no es un caso
-- borde: es el caso normal.

-- ── Postulaciones al programa ─────────────────────────────────
-- `nacimiento` sale del blob `payload` a una columna propia: es lo
-- que decide si hacen falta los datos del tutor, y no puede quedar
-- enterrado en un jsonb que no se puede filtrar.
alter table public.applications
  add column if not exists nacimiento       date,
  add column if not exists es_menor         boolean not null default false,
  add column if not exists tutor_nombre     text,
  add column if not exists tutor_parentesco text,
  add column if not exists tutor_tel        text,
  add column if not exists tutor_email      text;

-- ── Participaciones en la convocatoria ────────────────────────
alter table public.convocatoria_entries
  add column if not exists es_menor         boolean not null default false,
  add column if not exists tutor_nombre     text,
  add column if not exists tutor_parentesco text,
  add column if not exists tutor_tel        text,
  add column if not exists tutor_email      text;

-- El conjunto vive también en `src/lib/content/fundacion.ts`.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_parentesco_check'
  ) then
    alter table public.applications add constraint applications_parentesco_check
      check (tutor_parentesco is null or tutor_parentesco in ('Padre', 'Madre', 'Tutor legal'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'convocatoria_parentesco_check'
  ) then
    alter table public.convocatoria_entries add constraint convocatoria_parentesco_check
      check (tutor_parentesco is null or tutor_parentesco in ('Padre', 'Madre', 'Tutor legal'));
  end if;
end
$$;

-- Un menor sin datos de tutor no debería poder existir. Se comprueba
-- en la base y no sólo en la aplicación porque es la regla que el
-- aviso de privacidad promete por escrito: si un día alguien inserta
-- desde otro sitio, la base sigue diciendo que no.
--
-- Las filas anteriores a esta migración tienen `es_menor = false` por
-- defecto, así que no las invalida: nadie declaró nada sobre ellas.
alter table public.applications drop constraint if exists applications_tutor_check;
alter table public.applications add constraint applications_tutor_check
  check (
    not es_menor
    or (tutor_nombre is not null and tutor_parentesco is not null and tutor_tel is not null)
  );

alter table public.convocatoria_entries drop constraint if exists convocatoria_tutor_check;
alter table public.convocatoria_entries add constraint convocatoria_tutor_check
  check (
    not es_menor
    or (tutor_nombre is not null and tutor_parentesco is not null and tutor_tel is not null)
  );

-- El panel necesita distinguirlos de un vistazo: a un expediente de
-- menor se le aplican reglas distintas.
create index if not exists applications_es_menor_idx
  on public.applications (es_menor) where es_menor;
create index if not exists convocatoria_es_menor_idx
  on public.convocatoria_entries (es_menor) where es_menor;
