import type { Metadata } from "next";
import Link from "next/link";

import { PROGRAMA_INTRO, RUBRIC } from "@/lib/content/programa";
import { ApplyForm } from "@/components/programa/ApplyForm";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Programa de atletas",
  description:
    "Un formulario, quince atributos y un informe real. Evaluamos jugadores de 12 a 21 años en cualquier posición y liga.",
};

export default function ProgramaPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-[clamp(50px,6vw,80px)] pt-[clamp(70px,9vw,130px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 70% at 70% 0%, oklch(0.79 0.175 138 / 0.12), transparent 70%)",
          }}
        />
        <div className="shell relative">
          <p className="m-0 mb-[22px] font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            Programa de atletas · convocatoria abierta
          </p>
          <h1 className="m-0 max-w-[16ch] font-display text-[clamp(42px,9vw,138px)] uppercase leading-[0.86]">
            Si juega, queremos verlo
          </h1>
          <p className="m-0 my-7 mb-[34px] max-w-[58ch] text-[17px] leading-[1.7] text-pretty text-muted">
            Un formulario, quince atributos y un informe real. Evaluamos jugadores de 12 a 21 años
            en cualquier posición y liga; el video pesa más que el currículum.
          </p>
          <Link href="#form" className={btnPrimary}>
            Ir al formulario
          </Link>
        </div>
      </section>

      <section className="border-t border-hairline py-[clamp(40px,5vw,64px)]">
        <div className="shell grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {PROGRAMA_INTRO.map((it, i) => (
            <Reveal key={it.n} index={i} className="border-l border-hairline pl-[22px]">
              <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{it.n}</span>
              <h3 className="m-0 my-2.5 mb-2 text-[17px] font-bold">{it.title}</h3>
              <p className="m-0 text-[15px] leading-[1.7] text-muted">{it.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="form" className="scroll-mt-[90px] py-[clamp(50px,6vw,90px)]">
        <div className="mx-auto max-w-[920px] px-[clamp(18px,4vw,44px)]">
          <ApplyForm />
        </div>
      </section>

      <section className="border-t border-hairline bg-panel py-[clamp(60px,8vw,110px)]">
        <div className="shell">
          <Reveal className="eyebrow mb-4">Rúbrica de evaluación</Reveal>
          <Reveal
            as="h2"
            index={1}
            className="m-0 mb-[clamp(36px,4vw,56px)] max-w-[18ch] font-display text-[clamp(32px,5.5vw,78px)] uppercase leading-[0.9]"
          >
            Quince atributos, uno por uno
          </Reveal>
          <div className="grid gap-px bg-hairline [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {RUBRIC.map(([name, body], i) => (
              <Reveal
                key={name}
                index={i}
                className="bg-panel px-[22px] py-[26px] transition-colors duration-300 hover:bg-panel-2"
              >
                <span className="block font-display text-[30px] leading-none text-hairline-strong">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="m-0 my-3 mb-2 text-base font-bold tracking-[0.01em]">{name}</h3>
                <p className="m-0 text-sm leading-[1.65] text-muted">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
