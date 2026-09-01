"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { FAQ } from "@/lib/content/docs";

export function FaqList() {
  const t = useTranslations("docs.faq.preguntas");
  const [open, setOpen] = useState(0);

  return (
    <div className="grid gap-2.5">
      {FAQ.map((clave, i) => {
        const isOpen = open === i;
        return (
          <div
            key={clave}
            className="overflow-hidden rounded-[18px] border border-hairline bg-panel"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent p-[22px] px-[22px] py-5 text-left"
            >
              <span className="text-base font-bold leading-[1.4]">{t(`${clave}.q`)}</span>
              <span aria-hidden className="shrink-0 text-xl text-accent">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <p className="m-0 max-w-[60ch] px-[22px] pb-[22px] leading-[1.75] text-muted">
                    {t(`${clave}.a`)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
