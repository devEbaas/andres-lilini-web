"use client";

import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { CREDENTIALS } from "@/lib/content/home";
import { btnGhost, btnPrimary, btnSecondary } from "@/components/ui/styles";
import { Particles } from "./Particles";

const EASE = [0.2, 0.7, 0.2, 1] as const;

function line(delay: number) {
  return {
    initial: { opacity: 0, y: 22, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: EASE, delay },
  };
}

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const slowDown = useTransform(scrollY, (v) => (reduced ? 0 : v * 0.22));
  const slowUp = useTransform(scrollY, (v) => (reduced ? 0 : v * -0.14));
  const drift = useTransform(scrollY, (v) => (reduced ? 0 : v * 0.08));

  return (
    <section className="relative flex min-h-[min(92vh,900px)] items-center overflow-hidden px-0 pb-[100px] pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, oklch(1 0 0 / 0.06) 0%, transparent 60%), radial-gradient(80% 60% at 80% 110%, oklch(0.79 0.175 138 / 0.13) 0%, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        style={{ y: slowDown }}
        className="pointer-events-none absolute -top-[10%] left-[12%] size-[min(46vw,520px)] animate-pulse-halo rounded-full"
      >
        <div
          className="size-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.79 0.175 138 / 0.16) 0%, transparent 68%)",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ y: slowUp }}
        className="pointer-events-none absolute -bottom-[20%] right-[4%] size-[min(52vw,600px)] animate-pulse-halo rounded-full"
      >
        <div
          className="size-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.905 0.125 128 / 0.10) 0%, transparent 66%)",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{
          y: drift,
          backgroundImage:
            "repeating-linear-gradient(90deg, oklch(1 0 0 / 0.035) 0 1px, transparent 1px 96px)",
        }}
        className="pointer-events-none absolute inset-0 opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35 mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(oklch(1 0 0 / 0.5) 0.5px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 240px 60px oklch(0 0 0 / 0.55)" }}
      />
      <Particles />

      <div className="shell relative w-full">
        <motion.div
          {...line(0)}
          className="mb-[26px] font-mono text-[11px] uppercase tracking-[0.42em] text-accent"
        >
          Formador de talento · desde 1998
        </motion.div>

        <h1 className="m-0 max-w-[14ch] font-display text-[clamp(52px,13vw,220px)] uppercase leading-[0.84] tracking-[-0.01em]">
          <motion.span {...line(0.08)} className="block">
            Andrés
          </motion.span>
          <motion.span {...line(0.16)} className="text-gradient block">
            Lillini
          </motion.span>
        </h1>

        <motion.div
          {...line(0.24)}
          className="mt-[34px] flex flex-wrap items-center gap-x-[18px] gap-y-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted"
        >
          {CREDENTIALS.map((c, i) => (
            <span key={c} className="flex items-center gap-[18px]">
              {c}
              {i < CREDENTIALS.length - 1 && (
                <span className="block size-1 rounded-full bg-accent" />
              )}
            </span>
          ))}
        </motion.div>

        <motion.p
          {...line(0.32)}
          className="mt-[30px] max-w-[56ch] text-[clamp(16px,1.5vw,19px)] leading-[1.7] text-pretty text-muted"
        >
          Veintisiete años detectando y desarrollando futbolistas: canteras en México, Argentina y
          Rusia, un primer equipo en Liga MX construido con quince debutantes y, hoy, la estructura
          de selecciones menores de un país entero.
        </motion.p>

        <motion.div {...line(0.4)} className="mt-10 flex flex-wrap gap-3">
          <Link href="/programa" className={btnPrimary}>
            Postular a un atleta
          </Link>
          {/* Ancla dentro de la propia página: salto nativo, sin router. */}
          <a href="#trayectoria" className={btnSecondary}>
            Ver trayectoria
          </a>
          <Link
            href={{ pathname: "/contenido/[doc]", params: { doc: "prensa" } }}
            className={btnGhost}
          >
            Prensa
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted">Scroll</span>
        <span className="relative block h-[34px] w-px overflow-hidden bg-hairline-strong">
          <span className="absolute left-0 top-0 block h-3 w-px animate-scroll-dot bg-accent" />
        </span>
      </div>
    </section>
  );
}
