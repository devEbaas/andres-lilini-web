"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";

import { SHIPPING_MXN } from "@/lib/content/site";
import {
  addLine,
  clearLines,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setLineQty,
  subscribe,
  type CartLine,
} from "./cart-store";

export type { CartLine };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // La bolsa vive en localStorage: el servidor renderiza siempre una bolsa vacía
  // y el cliente la sincroniza al hidratar, sin desajustes de HTML.
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    return {
      lines,
      count: lines.reduce((a, l) => a + l.qty, 0),
      subtotal,
      shipping: SHIPPING_MXN,
      total: subtotal + SHIPPING_MXN,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: addLine,
      setQty: setLineQty,
      remove: removeLine,
      clear: clearLines,
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
