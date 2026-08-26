"use client";

import { useState } from "react";
import type { Product } from "@/lib/content/tienda";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";

export function ProductActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, open } = useCart();
  const { flash } = useToast();

  const onAdd = () => {
    if (product.out) return;
    add({ id: product.id, name: product.name, price: product.price }, qty);
    setAdded(true);
    flash("Artículo añadido al pedido");
    open();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center border border-rule">
        <button
          type="button"
          aria-label="Quitar una unidad"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-12 w-11 cursor-pointer border-0 bg-transparent text-[17px]"
        >
          −
        </button>
        <span aria-live="polite" className="min-w-9 text-center font-mono text-sm">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Agregar una unidad"
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="h-12 w-11 cursor-pointer border-0 bg-transparent text-[17px]"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={product.out}
        className="min-h-12 flex-1 basis-[200px] cursor-pointer border-0 bg-ink px-[26px] py-[15px] text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {product.out ? "Agotado" : added ? "Añadido al pedido" : "Añadir al pedido"}
      </button>
    </div>
  );
}
