"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { FAQ } from "@/lib/content/docs";

export function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <div>
      {FAQ.map((q, i) => {
        const isOpen = open === i;
        return (
          <div key={q.q} className="border-b border-rule-soft">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex min-h-11 w-full cursor-pointer items-baseline justify-between gap-4 border-0 bg-transparent px-0 py-5 text-left"
            >
              <span className="font-display text-[19px] font-medium leading-[1.4]">{q.q}</span>
              <span aria-hidden className="shrink-0 font-mono text-base text-accent">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 0.7, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <p className="m-0 max-w-[60ch] pb-[22px] leading-[1.8] text-ink-soft">{q.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
