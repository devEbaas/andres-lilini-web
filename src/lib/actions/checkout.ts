"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getClaims } from "@/lib/auth/dal";
import { SHIPPING_MXN } from "@/lib/content/site";
import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/data/products";
import { getStripe, siteUrl, toCents } from "@/lib/stripe/client";
import { GENERIC_ERROR, normalizaLocale, type ActionResult } from "./types";

export type CartLineInput = { id: string; qty: number };

type CheckoutResult = {
  orderId: string | null;
  total: number;
  /** URL de la pasarela. `null` cuando Stripe no está configurado. */
  url: string | null;
};

const CHECKOUT_ERROR = "No pudimos abrir la pasarela de pago. Inténtalo de nuevo.";

export async function startCheckout(
  lines: CartLineInput[],
  /**
   * Idioma del comprador. Llega del formulario porque una Server Action no
   * puede resolverlo: sólo decide con qué nombre viaja el producto a Stripe y
   * qué queda registrado en el pedido, nunca un precio ni un permiso.
   */
  locale?: string,
): Promise<ActionResult<CheckoutResult>> {
  if (!lines.length) return { ok: false, error: "Tu bolsa está vacía." };

  // Los precios se recalculan contra el catálogo: lo que manda el navegador
  // sólo dice *qué* y *cuánto*, nunca a qué precio.
  const catalog = await getProducts(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);
  const items = lines.flatMap((l) => {
    const p = catalog.find((c) => c.id === l.id);
    if (!p || p.out) return [];
    const qty = Math.max(1, Math.min(99, Math.trunc(l.qty)));
    return [{ id: p.id, name: p.name, price: p.price, qty }];
  });

  if (!items.length) {
    return { ok: false, error: "Los artículos de tu bolsa ya no están disponibles." };
  }

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + SHIPPING_MXN;

  const supabase = createAdminClient();
  if (!supabase) return { ok: true, data: { orderId: null, total, url: null } };

  // Si hay sesión, el pedido nace con dueño. Si no, queda de invitado y se
  // vincula solo cuando esa persona se registre con el mismo correo.
  const claims = await getClaims();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      // El mismo idioma con el que se resolvió el catálogo: el pedido queda
      // registrado en la lengua que vio quien compró.
      locale: normalizaLocale(locale),
      subtotal,
      shipping: SHIPPING_MXN,
      total,
      items: items as never,
      status: "iniciado",
      user_id: claims?.userId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[startCheckout]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  const orderId = data.id;

  const stripe = getStripe();
  // Sin claves el sitio sigue funcionando: el pedido queda registrado y el
  // cajón avisa de que el cobro se hará por otra vía.
  if (!stripe) return { ok: true, data: { orderId, total, url: null } };

  const base = siteUrl();

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "es",
        line_items: items.map((i) => ({
          quantity: i.qty,
          price_data: {
            currency: "mxn",
            unit_amount: toCents(i.price),
            product_data: { name: i.name },
          },
        })),
        // El envío va como shipping_option y no como una partida más: así el
        // total que cobra Stripe coincide al centavo con el que vio el cliente.
        shipping_address_collection: { allowed_countries: ["MX"] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Envío estándar · 3 a 5 días hábiles",
              fixed_amount: { amount: toCents(SHIPPING_MXN), currency: "mxn" },
            },
          },
        ],
        client_reference_id: orderId,
        metadata: { order_id: orderId },
        success_url: `${base}/tienda/gracias?session_id={CHECKOUT_SESSION_ID}`,
        // Sin parámetros a propósito: /tienda es estática y leer searchParams
        // ahí la volvería dinámica. El cliente vuelve con su bolsa intacta.
        cancel_url: `${base}/tienda`,
      },
      // Un doble clic en «Ir a pagar» no abre dos sesiones para el mismo pedido.
      { idempotencyKey: `order_${orderId}` },
    );

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return { ok: true, data: { orderId, total, url: session.url } };
  } catch (e) {
    console.error("[startCheckout] Stripe", (e as Error).message);
    return { ok: false, error: CHECKOUT_ERROR };
  }
}
