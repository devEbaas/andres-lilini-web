"use client";

import { useEffect } from "react";

import { useCart } from "@/lib/store/cart";

/**
 * Vacía la bolsa al llegar a la confirmación. Vive en `localStorage`, así que
 * sólo el cliente puede hacerlo. Se vacía aquí y no al pulsar «Ir a pagar»:
 * si el cliente abandona el Checkout, vuelve a la tienda con su bolsa intacta.
 */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
