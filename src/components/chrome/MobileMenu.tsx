"use client";

import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { NAV, SOCIAL } from "@/lib/content/site";
import { SelectorIdioma } from "./SelectorIdioma";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("header");
  const tl = useTranslations("links");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[110] flex flex-col bg-bg px-[clamp(20px,6vw,60px)] pb-10 pt-[22px]"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              {t("menuTitulo")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("cerrarMenu")}
              className="size-11 cursor-pointer rounded-full border border-hairline bg-panel text-base"
            >
              ×
            </button>
          </div>

          <nav className="my-auto flex flex-col gap-1.5">
            {NAV.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.045, duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="font-display text-[clamp(34px,10vw,56px)] uppercase leading-none tracking-[0.01em] text-ink hover:text-accent"
                >
                  {tl(item.key)}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="mb-5 flex">
            {/* El menú a pantalla completa tapa la cabecera, así que sin esto
                no hay forma de cambiar de idioma desde el móvil. */}
            <SelectorIdioma />
          </div>

          <div className="flex flex-wrap gap-2">
            {SOCIAL.map((s) => (
              <span
                key={s}
                className="rounded-full border border-hairline px-4 py-[11px] text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
