-- ─────────────────────────────────────────────────────────────
-- Andrés Lillini — Stripe Checkout sobre `orders`
-- ─────────────────────────────────────────────────────────────
-- El cobro se hace con Checkout alojado: creamos la sesión desde
-- la Server Action y el webhook confirma el pago. La tabla necesita
-- guardar la referencia a esa sesión y lo que Stripe recoge por
-- nosotros (correo y dirección de envío).

alter table public.orders
  add column if not exists stripe_session_id     text,
  add column if not exists stripe_payment_intent text,
  add column if not exists email                 text,
  add column if not exists shipping_address      jsonb,
  add column if not exists paid_at               timestamptz;

-- Es la llave con la que el webhook localiza el pedido. Único para
-- que dos entregas del mismo evento no puedan escribir historias
-- distintas. Postgres admite varios NULL, así que los pedidos sin
-- sesión (Stripe no configurado) siguen siendo válidos.
create unique index if not exists orders_stripe_session_id_key
  on public.orders (stripe_session_id);

-- Máquina de estados:
--   iniciado → sesión creada, esperando el pago
--   pagado   → el webhook confirmó payment_status
--   expirado → la sesión caducó sin pagarse
-- 'pendiente' se conserva porque es el default histórico de la tabla.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pendiente', 'iniciado', 'pagado', 'expirado'));
