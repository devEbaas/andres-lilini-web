"use client";

import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { ErrorRef } from "@/lib/actions/types";
import { useErrores } from "@/lib/errores";

import { startCheckout } from "@/lib/actions/checkout";
import { money } from "@/lib/format";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/store/cart";
import { useToast } from "@/lib/store/toast";
import { btnQuiet } from "@/components/ui/styles";

export function CartDrawer() {
  const err = useErrores();
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { lines, isOpen, close, setQty, remove, subtotal, shipping, total } = useCart();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<ErrorRef | null>(null);

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
    setError(null);
    startTransition(async () => {
      const res = await startCheckout(
        lines.map((l) => ({ id: l.id, qty: l.qty })),
        locale,
      );
      if (!res.ok) {
        setError(res.code);
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
      flash(t("pedidoRegistrado"));
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
            aria-label={t("titulo")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="relative flex h-full w-[min(420px,100%)] flex-col border-l border-hairline bg-panel shadow-deep"
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-[22px]">
              <span className="font-display text-[22px] uppercase">{t("titulo")}</span>
              <button
                type="button"
                onClick={close}
                aria-label={t("cerrar")}
                className="size-10 cursor-pointer rounded-full border border-hairline bg-transparent text-base"
              >
                ×
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="grid flex-1 place-items-center p-10 text-center">
                <div>
                  <div className="mx-auto mb-[22px] grid size-20 place-items-center rounded-[22px] border border-dashed border-hairline-strong font-mono text-[10px] tracking-[0.14em] text-muted">
                    {t("vaciaEtiqueta")}
                  </div>
                  <p className="m-0 mb-[22px] leading-[1.7] text-muted">
                    {t("vacia")}
                  </p>
                  <Link href="/tienda" onClick={close} className={btnQuiet}>
                    {t("verTienda")}
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
                          {t("cadaUno", { precio: money(l.price, locale) })}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center rounded-full border border-hairline">
                            <button
                              type="button"
                              aria-label={t("quitarUnidad", { producto: l.name })}
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
                              aria-label={t("agregarUnidad", { producto: l.name })}
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
                            {t("quitar")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2.5 border-t border-hairline px-6 py-[22px]">
                  <div className="flex justify-between text-sm text-muted">
                    <span>{t("subtotal")}</span>
                    <span>{money(subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted">
                    <span>{t("envio")}</span>
                    <span>{money(shipping, locale)}</span>
                  </div>
                  <div className="mt-1.5 flex justify-between font-display text-2xl uppercase">
                    <span>{t("total")}</span>
                    <span>{money(total, locale)}</span>
                  </div>
                  {error && (
                    <p className="m-0 text-[13px] text-danger-text" role="alert">
                      {err(error)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={checkout}
                    disabled={pending}
                    className="mt-3 min-h-[52px] cursor-pointer rounded-full border-0 bg-gradient-accent text-[12px] font-extrabold uppercase tracking-[0.18em] text-on-accent disabled:opacity-60"
                  >
                    {pending ? t("preparando") : t("irAPagar")}
                  </button>
                  <p className="m-0 mt-1 text-center font-mono text-[10px] text-muted">
                    {t("pagoSeguro")}
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
