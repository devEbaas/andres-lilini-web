import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { expireCheckout, fulfillCheckout } from "@/lib/stripe/fulfill";

// El SDK de Stripe necesita el runtime de Node. Los handlers POST nunca se
// cachean, así que no hace falta nada más de configuración.
export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !WEBHOOK_SECRET) {
    return new Response("Stripe no está configurado", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Falta la firma", { status: 400 });

  // Cuerpo crudo: si se parsea el JSON antes, la firma deja de validar.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, WEBHOOK_SECRET);
  } catch (e) {
    console.error("[stripe webhook] firma inválida", (e as Error).message);
    return new Response("Firma inválida", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await fulfillCheckout(event.data.object.id);
        break;
      case "checkout.session.expired":
        await expireCheckout(event.data.object);
        break;
      default:
        // Todo lo demás se acusa con 200: devolver error haría que Stripe
        // reintentara indefinidamente eventos que no nos interesan.
        break;
    }
  } catch (e) {
    // 500 para que Stripe reintente: el evento es legítimo y algo nuestro falló.
    console.error("[stripe webhook]", event.type, (e as Error).message);
    return new Response("Error al procesar el evento", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
