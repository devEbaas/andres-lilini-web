import "server-only";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import { getStripe } from "./client";

export type FulfilledLine = { name: string; qty: number; amount: number };

export type FulfilledOrder = {
  folio: string;
  email: string | null;
  lines: FulfilledLine[];
  shipping: number;
  total: number;
  address: string[] | null;
};

/**
 * Confirma un pedido a partir de su Checkout Session.
 *
 * La llaman el webhook y la página de gracias, así que puede ejecutarse varias
 * veces —incluso a la vez— con el mismo id. La idempotencia la da el filtro
 * `.neq("status", "pagado")` del update: la segunda vez no afecta ninguna fila.
 */
export async function fulfillCheckout(sessionId: string): Promise<FulfilledOrder | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch (e) {
    // Id inventado o de otra cuenta: no es un error nuestro que valga registrar
    // más allá del log.
    console.error("[fulfillCheckout] sesión no recuperable", (e as Error).message);
    return null;
  }

  // `unpaid` incluye las sesiones abandonadas y las que todavía no se pagan.
  if (session.payment_status === "unpaid") return null;

  const shipping = centsToPesos(session.shipping_cost?.amount_total ?? 0);
  const total = centsToPesos(session.amount_total ?? 0);
  const email = session.customer_details?.email ?? null;
  const shippingDetails = session.collected_information?.shipping_details ?? null;

  const lines: FulfilledLine[] = (session.line_items?.data ?? []).map((li) => ({
    name: li.description ?? "Artículo",
    qty: li.quantity ?? 1,
    amount: centsToPesos(li.amount_total),
  }));

  await persist(session, email, shippingDetails);

  return {
    folio: folioFor(session),
    email,
    lines,
    shipping,
    total,
    address: formatAddress(shippingDetails),
  };
}

/**
 * Marca como expirada una sesión que caducó sin pagarse. Recibe el objeto que
 * ya viene firmado en el evento: no hace falta volver a pedirlo a la API.
 */
export async function expireCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  const orderId = orderIdOf(session);
  if (!orderId) return;

  const { error } = await supabase
    .from("orders")
    .update({ status: "expirado" })
    .eq("id", orderId)
    .eq("status", "iniciado");

  if (error) console.error("[expireCheckout]", error.message);
}

async function persist(
  session: Stripe.Checkout.Session,
  email: string | null,
  shippingDetails: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null,
) {
  const supabase = createAdminClient();
  if (!supabase) return;

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Buscamos por el id del pedido y no por `stripe_session_id`: esa columna se
  // escribe *después* de crear la sesión, así que dejaría una ventana en la que
  // el webhook no encontraría la fila. El id viaja dentro de la sesión desde el
  // primer instante.
  const orderId = orderIdOf(session);
  if (!orderId) return;

  const { error } = await supabase
    .from("orders")
    .update({
      status: "pagado",
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntent,
      email,
      shipping_address: (shippingDetails as unknown as Json) ?? null,
    })
    .eq("id", orderId)
    // Idempotencia: la segunda entrega del mismo evento no afecta ninguna fila,
    // así que `paid_at` no se mueve y no hay que bloquear nada.
    .neq("status", "pagado");

  if (error) console.error("[fulfillCheckout] no se pudo guardar", error.message);
}

/** El uuid del pedido tal como se guardó al crear la sesión. */
function orderIdOf(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? session.metadata?.order_id ?? null;
}

/** El id del pedido si lo tenemos; si no, el de la sesión. Sólo para mostrar. */
function folioFor(session: Stripe.Checkout.Session): string {
  const ref = orderIdOf(session) ?? session.id;
  return `AL-${ref.replace(/-/g, "").slice(-8).toUpperCase()}`;
}

function formatAddress(
  details: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null,
): string[] | null {
  const a = details?.address;
  if (!a) return null;
  return [
    details.name,
    [a.line1, a.line2].filter(Boolean).join(", "),
    [a.postal_code, a.city, a.state].filter(Boolean).join(" · "),
  ].filter((l): l is string => Boolean(l));
}

function centsToPesos(cents: number): number {
  return cents / 100;
}
