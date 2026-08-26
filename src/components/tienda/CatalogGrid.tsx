"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CATEGORIES, type Product } from "@/lib/content/tienda";
import { money } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { chip, chipOff, chipOn } from "@/components/ui/styles";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<string>("Todo");
  const shown = products.filter((p) => cat === "Todo" || p.cat === cat);

  return (
    <>
      <div
        role="tablist"
        aria-label="Categorías"
        className="mb-7 flex gap-2 overflow-x-auto border-b border-hairline pb-[22px]"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`${chip} ${cat === c ? chipOn : chipOff}`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid gap-[clamp(14px,2vw,26px)] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: p.out ? 0.55 : 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden rounded-[22px] border border-hairline bg-panel transition-[transform,border-color,box-shadow] duration-[350ms] hover:-translate-y-[6px] hover:border-accent hover:shadow-soft"
            >
              <Link href={`/tienda/${p.id}`} className="block text-ink hover:text-ink">
                <PhotoSlot label={p.shot} ratio="1/1" className="border-0">
                  {p.out && (
                    <span className="absolute right-3.5 top-3.5 rounded-full border border-hairline-strong bg-bg px-3 py-[7px] text-[10px] font-extrabold uppercase tracking-[0.14em]">
                      Agotado
                    </span>
                  )}
                </PhotoSlot>
                <div className="p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {p.cat}
                  </span>
                  <h3 className="m-0 my-2.5 mb-1 text-[17px] font-bold">{p.name}</h3>
                  <p className="m-0 mb-3.5 text-sm leading-[1.6] text-muted">{p.sub}</p>
                  <span className="font-display text-2xl">{money(p.price)}</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-muted">
          Todavía no hay piezas en esta categoría.
        </p>
      )}
    </>
  );
}
