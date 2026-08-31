-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — perfil estructurado del postulante
-- ─────────────────────────────────────────────────────────────
-- Hasta ahora TODO el detalle de una postulación vivía dentro de
-- `payload`, un jsonb. Funciona para guardar, pero no para trabajar:
-- no se puede filtrar por posición, ordenar por categoría ni contar
-- cuántos porteros hay sin recorrer el blob fila por fila.
--
-- Se promueven a columna los campos por los que un evaluador querría
-- filtrar u ordenar. El resto —medibles, disponibilidad, textos
-- largos— se queda en `payload` a propósito: son muchos, se leen de
-- uno en uno y nadie va a consultarlos en conjunto.

alter table public.applications
  -- Residencia
  add column if not exists pais            text,
  add column if not exists estado          text,
  add column if not exists ciudad          text,
  -- Perfil deportivo
  add column if not exists posicion        text,
  add column if not exists posicion_sec    text,
  add column if not exists pie             text,
  add column if not exists estatura        integer,
  add column if not exists peso            integer,
  add column if not exists club            text,
  add column if not exists liga            text,
  add column if not exists anios_practica  integer,
  add column if not exists nivel           text,
  -- Contexto académico. El jurado ya lo evaluaba y no se preguntaba.
  add column if not exists escolaridad     text,
  add column if not exists estudia         boolean,
  add column if not exists turno           text;

-- Rellena las filas que ya existían leyendo su propio `payload`. Sin
-- esto las postulaciones anteriores quedarían invisibles a cualquier
-- filtro nuevo, que es justo lo que se intenta arreglar.
--
-- `nullif(...,'')` porque el formulario guarda cadenas vacías para los
-- campos opcionales que nadie llenó, y '' no es lo mismo que NULL.
update public.applications set
  pais           = coalesce(pais,         nullif(payload ->> 'pais', '')),
  estado         = coalesce(estado,       nullif(payload ->> 'estado', '')),
  ciudad         = coalesce(ciudad,       nullif(payload ->> 'ciudad', '')),
  posicion       = coalesce(posicion,     nullif(payload ->> 'pos1', '')),
  posicion_sec   = coalesce(posicion_sec, nullif(payload ->> 'pos2', '')),
  pie            = coalesce(pie,          nullif(payload ->> 'pie', '')),
  club           = coalesce(club,         nullif(payload ->> 'equipo', '')),
  liga           = coalesce(liga,         nullif(payload ->> 'liga', '')),
  nivel          = coalesce(nivel,        nullif(payload ->> 'nivel', '')),
  -- Los numéricos llegan como texto y pueden traer basura: se ignora
  -- lo que no sea un entero en vez de reventar la migración entera.
  estatura       = coalesce(estatura,
                     case when payload ->> 'estatura' ~ '^\d+$'
                          then (payload ->> 'estatura')::integer end),
  peso           = coalesce(peso,
                     case when payload ->> 'peso' ~ '^\d+$'
                          then (payload ->> 'peso')::integer end),
  anios_practica = coalesce(anios_practica,
                     case when payload ->> 'anios' ~ '^\d+$'
                          then (payload ->> 'anios')::integer end)
where payload is not null;

-- Los conjuntos viven en `src/lib/content/jugador.ts`.
alter table public.applications drop constraint if exists applications_posicion_check;
alter table public.applications add constraint applications_posicion_check
  check (posicion is null or posicion in
    ('Portero', 'Lateral', 'Central', 'Mediocentro', 'Interior', 'Extremo', 'Delantero'));

alter table public.applications drop constraint if exists applications_pie_check;
alter table public.applications add constraint applications_pie_check
  check (pie is null or pie in ('Derecho', 'Izquierdo', 'Ambos'));

-- Rangos de cordura. No pretenden validar: descartan lo imposible.
alter table public.applications drop constraint if exists applications_medidas_check;
alter table public.applications add constraint applications_medidas_check
  check (
    (estatura is null or estatura between 120 and 230)
    and (peso is null or peso between 25 and 150)
    and (anios_practica is null or anios_practica between 0 and 30)
  );

create index if not exists applications_posicion_idx on public.applications (posicion);
create index if not exists applications_nivel_idx    on public.applications (nivel);

-- ── Historial de clubes ───────────────────────────────────────
-- Tabla hija y no un array dentro del payload: es una lista con vida
-- propia que se ordena por fecha y se cuenta. Un jugador con cinco
-- clubes en tres años cuenta una historia distinta a uno con seis años
-- en el mismo sitio, y eso es contexto — uno de los tres criterios que
-- el jurado dice evaluar.
create table if not exists public.application_clubs (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications on delete cascade,
  club           text not null,
  categoria      text,
  desde          integer,
  hasta          integer,
  orden          integer not null default 0,
  created_at     timestamptz not null default now(),
  constraint application_clubs_anios_check check (
    (desde is null or desde between 1990 and 2100)
    and (hasta is null or hasta between 1990 and 2100)
    and (desde is null or hasta is null or hasta >= desde)
  )
);

create index if not exists application_clubs_application_idx
  on public.application_clubs (application_id, orden);
create index if not exists application_clubs_club_idx
  on public.application_clubs (lower(club));

alter table public.application_clubs enable row level security;

-- Sin policy de insert: escribe la service role desde la Server Action,
-- igual que la postulación a la que pertenece.
drop policy if exists "admin lee historial de clubes" on public.application_clubs;
create policy "admin lee historial de clubes"
  on public.application_clubs for select
  to authenticated
  using ((select public.is_admin()));
