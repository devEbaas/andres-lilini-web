"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";

import { createOrder } from "@/lib/actions/checkout";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";
import { btnSecondary } from "@/components/ui/styles";

export function CartDrawer() {
  const { lines, isOpen, close, setQty, remove, subtotal, shipping, total } = useCart();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const checkout = () => {
    setError("");
    startTransition(async () => {
      const res = await createOrder(lines.map((l) => ({ id: l.id, qty: l.qty })));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      close();
      flash("Redirigiendo a la pasarela de pago…");
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
            className="absolute inset-0 bg-[var(--scrim)]"
          />
          <motion.aside
            role="dialog"
            aria-label="Pedido"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-[min(420px,100%)] flex-col border-l border-rule bg-paper"
          >
            <div className="flex items-center justify-between border-b border-rule px-6 py-[22px]">
              <span className="font-display text-[22px] font-medium">Pedido</span>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="size-[38px] cursor-pointer border border-rule bg-transparent"
              >
                ×
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="grid flex-1 place-items-center p-[30px] text-center">
                <div>
                  <p className="m-0 mb-5 leading-[1.8] text-ink-soft">
                    No hay artículos en el pedido.
                  </p>
                  <Link href="/tienda" onClick={close} className={btnSecondary}>
                    Ver catálogo
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-start gap-3.5 border-b border-rule-soft py-5"
                    >
                      <span className="h-16 w-14 shrink-0 border border-rule bg-surface-2" />
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[17px] font-medium leading-[1.3]">
                          {l.name}
                        </div>
                        <div className="my-1.5 mb-2.5 font-mono text-xs text-ink-soft">
                          {money(l.price)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Quitar una unidad de ${l.name}`}
                            onClick={() => setQty(l.id, l.qty - 1)}
                            className="size-[30px] cursor-pointer border border-rule bg-transparent"
                          >
                            −
                          </button>
                          <span className="min-w-5 text-center font-mono text-[13px]">{l.qty}</span>
                          <button
                            type="button"
                            aria-label={`Agregar una unidad de ${l.name}`}
                            onClick={() => setQty(l.id, l.qty + 1)}
                            className="size-[30px] cursor-pointer border border-rule bg-transparent"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            className="ml-auto cursor-pointer border-0 bg-transparent text-[11px] uppercase tracking-[0.12em] text-ink-faint hover:text-accent"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-rule px-6 py-[22px]">
                  <div className="mb-2 flex justify-between text-sm text-ink-soft">
                    <span>Subtotal</span>
                    <span className="font-mono">{money(subtotal)}</span>
                  </div>
                  <div className="mb-3.5 flex justify-between text-sm text-ink-soft">
                    <span>Envío</span>
                    <span className="font-mono">{money(shipping)}</span>
                  </div>
                  <div className="flex justify-between border-t border-rule pt-3.5 font-display text-xl font-medium">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                  {error && (
                    <p className="m-0 mt-3 text-[13px] text-danger" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={checkout}
                    disabled={pending}
                    className="mt-5 min-h-[50px] w-full cursor-pointer border-0 bg-ink text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent disabled:opacity-60"
                  >
                    {pending ? "Preparando…" : "Continuar al pago"}
                  </button>
                  <p className="m-0 mt-3 text-center font-mono text-[10px] text-ink-faint">
                    Pago seguro en pasarela externa
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
