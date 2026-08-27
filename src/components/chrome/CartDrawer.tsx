"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";

import { startCheckout } from "@/lib/actions/checkout";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";
import { btnQuiet } from "@/components/ui/styles";

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
      const res = await startCheckout(lines.map((l) => ({ id: l.id, qty: l.qty })));
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Redirigimos desde el cliente en vez de con `redirect()` en la acción:
      // así el estado de carga y el error siguen viviendo en el componente,
      // igual que en el resto de formularios del sitio. La bolsa no se vacía
      // aquí, sino al confirmar: si abandona el pago, la conserva.
      if (res.data.url) {
        window.location.href = res.data.url;
        return;
      }
      close();
      flash("Pedido registrado. Te contactamos para completar el pago.");
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
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
          />
          <motion.aside
            role="dialog"
            aria-label="Tu bolsa"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-[min(420px,100%)] flex-col border-l border-hairline bg-panel shadow-deep"
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-[22px]">
              <span className="font-display text-[22px] uppercase">Tu bolsa</span>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="size-10 cursor-pointer rounded-full border border-hairline bg-transparent text-base"
              >
                ×
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="grid flex-1 place-items-center p-10 text-center">
                <div>
                  <div className="mx-auto mb-[22px] grid size-20 place-items-center rounded-[22px] border border-dashed border-hairline-strong font-mono text-[10px] tracking-[0.14em] text-muted">
                    VACÍA
                  </div>
                  <p className="m-0 mb-[22px] leading-[1.7] text-muted">
                    Todavía no agregas nada.
                  </p>
                  <Link href="/tienda" onClick={close} className={btnQuiet}>
                    Ver la tienda
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {lines.map((l) => (
                    <div key={l.id} className="flex gap-3.5 border-b border-hairline py-[18px]">
                      <span className="photo-slot size-16 shrink-0 rounded-[14px] border border-hairline" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold leading-[1.4]">{l.name}</div>
                        <div className="my-1 mb-2.5 font-mono text-[11px] text-muted">
                          {money(l.price)} c/u
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center rounded-full border border-hairline">
                            <button
                              type="button"
                              aria-label={`Quitar una unidad de ${l.name}`}
                              onClick={() => setQty(l.id, l.qty - 1)}
                              className="size-8 cursor-pointer border-0 bg-transparent"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-[13px] font-bold">
                              {l.qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`Agregar una unidad de ${l.name}`}
                              onClick={() => setQty(l.id, l.qty + 1)}
                              className="size-8 cursor-pointer border-0 bg-transparent"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            className="cursor-pointer border-0 bg-transparent text-[11px] font-bold uppercase tracking-[0.12em] text-muted hover:text-danger-text"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2.5 border-t border-hairline px-6 py-[22px]">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted">
                    <span>Envío</span>
                    <span>{money(shipping)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between font-display text-2xl uppercase">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                  {error && (
                    <p className="m-0 text-[13px] text-danger-text" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={checkout}
                    disabled={pending}
                    className="mt-3 min-h-[52px] cursor-pointer rounded-full border-0 bg-gradient-accent text-[12px] font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
                  >
                    {pending ? "Preparando…" : "Ir a pagar"}
                  </button>
                  <p className="m-0 mt-1 text-center font-mono text-[10px] text-muted">
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
