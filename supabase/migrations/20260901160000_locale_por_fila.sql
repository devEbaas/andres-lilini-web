-- ─────────────────────────────────────────────────────────────
-- Idioma de cada persona
--
-- Sin esto, quien se postula en inglés recibe la confirmación en español tres
-- días después. El valor se guarda con la fila porque el correo se manda mucho
-- más tarde que el envío del formulario, y para entonces no queda ni petición
-- ni sesión de la que deducirlo.
--
-- Es un dato controlado por el cliente: elige en qué lengua se le escribe.
-- Nunca un permiso.
-- ─────────────────────────────────────────────────────────────

alter table public.applications           add column if not exists locale text not null default 'es';
alter table public.convocatoria_entries   add column if not exists locale text not null default 'es';
alter table public.contact_messages       add column if not exists locale text not null default 'es';
alter table public.orders                 add column if not exists locale text not null default 'es';
alter table public.newsletter_subscribers add column if not exists locale text not null default 'es';
alter table public.profiles               add column if not exists locale text not null default 'es';

-- El CHECK se aplica en bucle para no repetir seis veces la misma línea y que
-- añadir una tabla al conjunto sea una entrada más en el array.
do $$
declare tabla text;
begin
  foreach tabla in array array[
    'applications', 'convocatoria_entries', 'contact_messages',
    'orders', 'newsletter_subscribers', 'profiles'
  ]
  loop
    execute format('alter table public.%I drop constraint if exists %I', tabla, tabla || '_locale_check');
    execute format(
      'alter table public.%I add constraint %I check (locale in (''es'', ''en''))',
      tabla, tabla || '_locale_check'
    );
  end loop;
end $$;

-- El perfil lo crea este trigger al darse de alta, así que el idioma tiene que
-- viajar en los metadatos del registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre, apellido, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellido', ''),
    -- Se normaliza aquí y no se confía en el CHECK: `raw_user_meta_data` lo
    -- controla quien se registra, y un valor inesperado abortaría el alta
    -- entera en vez de caer al idioma por defecto.
    case when new.raw_user_meta_data ->> 'locale' = 'en' then 'en' else 'es' end
  );

  -- 'cliente' literal, nunca desde el input: `raw_user_meta_data`
  -- viene del formulario de registro y lo controla quien se apunta.
  insert into public.user_roles (user_id, role, is_active)
  values (new.id, 'cliente', true);

  return new;
end;
$$;
