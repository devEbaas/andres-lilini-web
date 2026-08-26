"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { EMAILS, NAV } from "@/lib/content/site";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
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
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[110] flex flex-col overflow-y-auto bg-paper px-[clamp(20px,6vw,56px)] pb-10 pt-6"
        >
          <div className="flex items-center justify-between border-b border-rule pb-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-faint">
              Índice del sitio
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="h-[38px] w-11 cursor-pointer border border-rule bg-transparent text-base"
            >
              ×
            </button>
          </div>

          <nav aria-label="Índice del sitio" className="mt-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="border-b border-rule-soft py-4 font-display text-[clamp(26px,7vw,38px)] font-normal"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-1.5 pt-8 font-mono text-xs text-ink-soft">
            {EMAILS.map((e) => (
              <a key={e} href={`mailto:${e}`} className="text-ink-soft">
                {e}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
