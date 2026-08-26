"use client";

import { AnimatePresence, motion } from "motion/react";
import { useToast } from "@/lib/store/toast";

export function Toast() {
  const { toast } = useToast();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 18, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 12, x: "-50%" }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed bottom-6 left-1/2 z-[140] flex items-center gap-2.5 rounded-full border border-accent bg-panel-2 px-6 py-[15px] text-[13px] font-semibold shadow-deep"
        >
          <span className="font-extrabold text-accent">✓</span>
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
