-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — esquema inicial
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Catálogo de tienda ──────────────────────────────────────────
create table if not exists public.products (
  id          text primary key,
  cat         text        not null,
  name        text        not null,
  sub         text        not null default '',
  price       integer     not null check (price >= 0),
  shot        text        not null default '',
  description text        not null default '',
  sold_out    boolean     not null default false,
  sort        integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- Postulaciones al programa de atletas ────────────────────────
create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  folio      text        not null unique,
  nombre     text        not null,
  email      text        not null,
  video_url  text,
  payload    jsonb       not null default '{}'::jsonb,
  status     text        not null default 'recibida',
  created_at timestamptz not null default now()
);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- Participaciones en la convocatoria ──────────────────────────
create table if not exists public.convocatoria_entries (
  id         uuid primary key default gen_random_uuid(),
  folio      text        not null unique,
  nombre     text        not null,
  email      text        not null,
  link       text,
  propuesta  text        not null default '',
  file_path  text,
  file_name  text,
  file_size  bigint,
  created_at timestamptz not null default now()
);
create unique index if not exists convocatoria_one_per_email on public.convocatoria_entries (lower(email));

-- Mensajes de contacto ────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  nombre     text        not null,
  email      text        not null,
  topic      text        not null default 'General',
  message    text        not null,
  handled    boolean     not null default false,
  created_at timestamptz not null default now()
);

-- Boletín ─────────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text        not null,
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_email_idx on public.newsletter_subscribers (lower(email));

-- Pedidos ─────────────────────────────────────────────────────
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  subtotal   integer     not null,
  shipping   integer     not null default 120,
  total      integer     not null,
  items      jsonb       not null default '[]'::jsonb,
  status     text        not null default 'pendiente',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- RLS: el público sólo lee el catálogo. Las escrituras entran
-- por Server Actions con service role, nunca desde el navegador.
-- ─────────────────────────────────────────────────────────────
alter table public.products               enable row level security;
alter table public.applications           enable row level security;
alter table public.convocatoria_entries   enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders                 enable row level security;

drop policy if exists "products readable by anyone" on public.products;
create policy "products readable by anyone"
  on public.products for select
  to anon, authenticated
  using (true);

-- Sin policies de insert/select para el resto: anon queda bloqueado
-- y el service role las omite por diseño.

-- Almacenamiento de archivos de la convocatoria ───────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'convocatoria',
  'convocatoria',
  false,
  26214400,
  array['application/pdf','image/jpeg','image/png','video/mp4']
)
on conflict (id) do nothing;
