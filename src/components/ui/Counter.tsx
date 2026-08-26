"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: reduced ? 0 : 1.4,
      ease: [0, 0, 0.2, 1],
      onUpdate: (v) => setValue(Math.round(v)),
      onComplete: () => setValue(to),
    });
    return () => controls.stop();
  }, [inView, to, reduced]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
