-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — expediente del preseleccionado
-- ─────────────────────────────────────────────────────────────
-- Segunda fase de la postulación: lo que sólo tiene sentido pedir a
-- quien ya pasó el corte. Medibles con su protocolo, salud, contacto
-- de emergencia y el consentimiento de imagen.
--
-- Va en tabla aparte y no en más columnas de `applications` por dos
-- razones. Una práctica: se llena para un puñado de candidatos, y
-- veinte columnas casi siempre nulas ensucian la tabla principal.
-- Otra de fondo: aquí hay datos de salud, que la LFPDPPP trata como
-- sensibles. Separarlos permite darles su propio acceso y su propio
-- consentimiento, y no recogerlos de cientos de personas que nunca
-- van a pisar una concentración.

-- ── Invitación ────────────────────────────────────────────────
-- El enlace privado es la credencial: quien lo tiene, entra. Por eso
-- se guarda el SHA-256 y no el token — si la base se filtrara, los
-- enlaces no serían utilizables. El enlace se muestra una sola vez al
-- generarlo; si se pierde, se regenera.
alter table public.applications
  add column if not exists expediente_token_hash text,
  add column if not exists expediente_expira     timestamptz,
  add column if not exists expediente_enviado_at timestamptz;

create index if not exists applications_expediente_token_idx
  on public.applications (expediente_token_hash)
  where expediente_token_hash is not null;

-- ── Expediente ────────────────────────────────────────────────
create table if not exists public.expedientes (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications on delete cascade,

  -- Medibles. `protocolo` no es decorativo: un 30 m a cronómetro manual
  -- y otro con fotocélulas se diferencian en más de lo que separa a un
  -- jugador rápido de uno normal. Sin saber cómo se midió, los números
  -- sirven para ordenar candidatos pero no para compararlos.
  sprint_10     numeric(4, 2),
  sprint_30     numeric(4, 2),
  salto_cmj     integer,
  agilidad_test text,
  agilidad_seg  numeric(5, 2),
  yoyo          text,
  protocolo     text,
  medido_en     date,

  -- Salud y seguridad. Necesarios sólo porque hay concentraciones
  -- presenciales; si no las hubiera, no habría por qué pedirlos.
  contacto_nombre     text,
  contacto_parentesco text,
  contacto_tel        text,
  alergias            text,
  condiciones         text,
  lesiones            text,
  seguro              text,

  -- Consentimientos. El de salud va aparte del de imagen porque
  -- autorizan cosas distintas, y el de imagen lleva alcance: no es lo
  -- mismo evaluar un video internamente que publicarlo.
  ok_salud        boolean not null default false,
  ok_imagen       boolean not null default false,
  imagen_alcance  text,
  -- Quién firmó. En un menor tiene que ser el tutor.
  firmante        text,
  firmante_nombre text,

  created_at timestamptz not null default now(),

  constraint expedientes_protocolo_check check (
    protocolo is null or protocolo in ('Cronómetro manual', 'Fotocélulas', 'App móvil')
  ),
  constraint expedientes_firmante_check check (
    firmante is null or firmante in ('Titular', 'Tutor')
  ),
  constraint expedientes_imagen_check check (
    imagen_alcance is null or imagen_alcance in
      ('Sólo evaluación interna', 'Materiales del programa', 'Redes sociales')
  ),
  -- Rangos de cordura sobre los medibles: descartan lo imposible, no
  -- pretenden validar. Un 10 m por debajo de 1 s o un salto de 2 m no
  -- son datos, son erratas.
  constraint expedientes_medibles_check check (
    (sprint_10 is null or sprint_10 between 1 and 5)
    and (sprint_30 is null or sprint_30 between 3 and 10)
    and (salto_cmj is null or salto_cmj between 10 and 120)
    and (agilidad_seg is null or agilidad_seg between 1 and 30)
  ),
  -- Sin consentimiento de salud no se guardan datos de salud.
  constraint expedientes_salud_check check (
    ok_salud
    or (alergias is null and condiciones is null and lesiones is null and seguro is null)
  )
);

alter table public.expedientes enable row level security;

-- Sin policy de insert: escribe la service role desde la Server Action,
-- autorizada por el token del enlace, no por una sesión.
drop policy if exists "admin lee expedientes" on public.expedientes;
create policy "admin lee expedientes"
  on public.expedientes for select
  to authenticated
  using ((select public.is_admin()));
