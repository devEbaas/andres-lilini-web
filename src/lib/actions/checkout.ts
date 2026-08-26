"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { SHIPPING_MXN } from "@/lib/content/site";
import { getProducts } from "@/lib/data/products";
import { GENERIC_ERROR, type ActionResult } from "./types";

export type CartLineInput = { id: string; qty: number };

/**
 * Registra el pedido con precios tomados del catálogo del servidor
 * —nunca de los que manda el navegador— y devuelve su id para la pasarela.
 */
export async function createOrder(
  lines: CartLineInput[],
): Promise<ActionResult<{ orderId: string | null; total: number }>> {
  if (!lines.length) return { ok: false, error: "El pedido está vacío." };

  const catalog = await getProducts();
  const items = lines.flatMap((l) => {
    const p = catalog.find((c) => c.id === l.id);
    if (!p || p.out) return [];
    const qty = Math.max(1, Math.min(99, Math.trunc(l.qty)));
    return [{ id: p.id, name: p.name, price: p.price, qty }];
  });

  if (!items.length) {
    return { ok: false, error: "Los artículos del pedido ya no están disponibles." };
  }

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + SHIPPING_MXN;

  const supabase = createAdminClient();
  if (!supabase) return { ok: true, data: { orderId: null, total } };

  const { data, error } = await supabase
    .from("orders")
    .insert({ subtotal, shipping: SHIPPING_MXN, total, items: items as never })
    .select("id")
    .single();

  if (error) {
    console.error("[createOrder]", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true, data: { orderId: data.id, total } };
}
