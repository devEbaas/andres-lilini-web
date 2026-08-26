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
          initial={{ opacity: 0, y: 14, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 10, x: "-50%" }}
          transition={{ duration: 0.26, ease: [0.22, 0.7, 0.25, 1] }}
          className="fixed bottom-6 left-1/2 z-[140] flex items-center gap-2.5 bg-ink px-[22px] py-3.5 text-[13px] text-paper"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
