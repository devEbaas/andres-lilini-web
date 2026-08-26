"use client";

import { useReducedMotion } from "motion/react";

/** Motas que suben en el hero. Posiciones deterministas: mismo HTML en servidor y cliente. */
export function Particles() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute -bottom-2.5 block rounded-full"
          style={{
            left: `${(6 + i * 6.7) % 96}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: i % 4 === 0 ? "var(--accent)" : "oklch(1 0 0 / 0.5)",
            animation: `floatUp ${9 + (i % 5) * 2.4}s linear ${i * 0.9}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
