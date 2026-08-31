-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — cuentas de cliente
-- ─────────────────────────────────────────────────────────────
-- El checkout es de invitado y así se queda: obligar a registrarse
-- antes de pagar es la forma más eficaz de perder compras. La
-- cuenta es opcional y sirve para ver el historial.

-- Nullable a propósito: la mayoría de los pedidos no tendrán dueño.
alter table public.orders
  add column if not exists user_id uuid references auth.users on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_email_idx   on public.orders (lower(email));

-- ⚠️ SEGURIDAD — leer antes de tocar nada de esto.
--
-- La segunda rama del OR deja ver los pedidos de invitado cuyo correo
-- coincide con el de la sesión. Sólo es segura mientras la confirmación
-- de correo sea obligatoria (`enable_confirmations = true`), porque
-- entonces una sesión autenticada implica correo verificado.
--
-- Si alguien desactiva esa opción, esto se convierte en «regístrate con
-- el correo de cualquiera y mira su dirección postal». No la desactives
-- sin quitar antes esta rama.
drop policy if exists "cliente lee sus pedidos" on public.orders;
create policy "cliente lee sus pedidos"
  on public.orders for select
  to authenticated
  using (
    (select public.is_active_user())
    and (
      user_id = (select auth.uid())
      or (
        user_id is null
        and email is not null
        and lower(email) = lower((select auth.jwt() ->> 'email'))
      )
    )
  );

-- Vinculación de pedidos huérfanos ────────────────────────────
-- Al entrar por primera vez, los pedidos de invitado hechos con el
-- mismo correo pasan a ser suyos. A partir de ahí manda `user_id` y
-- se deja de depender de la comparación por correo.
--
-- Security definer para poder leer `email_confirmed_at`, que es la
-- comprobación que sostiene todo esto: sin correo confirmado no se
-- vincula nada, pase lo que pase en la aplicación.
create or replace function public.vincular_pedidos_huerfanos()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid;
  v_email text;
  v_filas integer;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return 0;
  end if;

  select u.email
    into v_email
  from auth.users u
  where u.id = v_uid
    and u.email_confirmed_at is not null;

  if v_email is null then
    return 0;
  end if;

  update public.orders
  set user_id = v_uid
  where user_id is null
    and email is not null
    and lower(email) = lower(v_email);

  get diagnostics v_filas = row_count;
  return v_filas;
end;
$$;

revoke execute on function public.vincular_pedidos_huerfanos() from anon, public;
grant  execute on function public.vincular_pedidos_huerfanos() to authenticated;
