"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { CATEGORIES, type Product } from "@/lib/content/tienda";
import { money } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { tab, tabOff, tabOn } from "@/components/ui/styles";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<string>("Todo");
  const shown = products.filter((p) => cat === "Todo" || p.cat === cat);

  return (
    <>
      <div
        role="tablist"
        aria-label="Categorías"
        className="mb-[34px] flex gap-6 overflow-x-auto border-b border-rule pb-4"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`${tab} ${cat === c ? tabOn : tabOff}`}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid gap-[clamp(20px,2.6vw,34px)] [grid-template-columns:repeat(auto-fill,minmax(248px,1fr))]"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: p.out ? 0.6 : 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 0.7, 0.25, 1] }}
            >
              <Link href={`/tienda/${p.id}`} className="block">
                <PhotoSlot
                  label={p.shot}
                  ratio="4/5"
                  className="transition-colors duration-250 hover:border-accent"
                >
                  {p.out && (
                    <span className="absolute left-0 top-0 bg-ink px-3 py-[7px] text-[9px] font-semibold uppercase tracking-[0.16em] text-paper">
                      Agotado
                    </span>
                  )}
                </PhotoSlot>
                <div className="pt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    {p.cat}
                  </span>
                  <h3 className="m-0 mb-1 mt-2.5 font-display text-xl font-medium">{p.name}</h3>
                  <p className="m-0 mb-3 text-sm leading-[1.6] text-ink-soft">{p.sub}</p>
                  <span className="font-mono text-sm">{money(p.price)}</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="py-16 text-center text-ink-soft">
          Todavía no hay piezas en esta categoría.
        </p>
      )}
    </>
  );
}
