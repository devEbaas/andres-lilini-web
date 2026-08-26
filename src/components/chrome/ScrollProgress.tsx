"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 340, damping: 40, restDelta: 0.001 });

  return (
    <div className="fixed inset-x-0 top-0 z-[120] h-0.5 bg-hairline" aria-hidden>
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="h-full bg-gradient-accent"
      />
    </div>
  );
}
