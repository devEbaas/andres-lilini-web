"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/content/tienda";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";

export function ProductActions({ product }: { product: Product }) {
  const t = useTranslations("store");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, open } = useCart();
  const { flash } = useToast();

  const onAdd = () => {
    if (product.out) return;
    add({ id: product.id, name: product.name, price: product.price }, qty);
    setAdded(true);
    flash(t("anadidoToast"));
    open();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center overflow-hidden rounded-full border border-hairline">
        <button
          type="button"
          aria-label={t("quitarUnidad")}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-12 w-[46px] cursor-pointer border-0 bg-transparent text-lg"
        >
          −
        </button>
        <span aria-live="polite" className="min-w-[38px] text-center font-bold">
          {qty}
        </span>
        <button
          type="button"
          aria-label={t("agregarUnidad")}
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="h-12 w-[46px] cursor-pointer border-0 bg-transparent text-lg"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={product.out}
        className="min-h-12 flex-1 basis-[200px] cursor-pointer rounded-full border-0 bg-gradient-accent px-7 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {product.out ? t("agotado") : added ? t("anadido") : t("anadir")}
      </button>
    </div>
  );
}
