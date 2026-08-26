import type { Metadata } from "next";
import Link from "next/link";

import { PROGRAMA_INTRO, RUBRIC } from "@/lib/content/programa";
import { ApplyForm } from "@/components/programa/ApplyForm";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary, h2Display } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Programa de atletas",
  description:
    "Cinco secciones, quince atributos evaluados y un dictamen por escrito. Jugadores de 12 a 21 años, cualquier posición y categoría.",
};

export default function ProgramaPage() {
  return (
    <>
      <section className="border-b border-rule pb-[clamp(38px,4vw,58px)] pt-[clamp(48px,6vw,86px)]">
        <div className="shell">
          <p className="eyebrow m-0 mb-[18px]">Programa de atletas · convocatoria abierta</p>
          <h1 className="m-0 max-w-[20ch] font-display text-[clamp(34px,5vw,64px)] font-normal leading-[1.1]">
            Solicitud de evaluación deportiva
          </h1>
          <p className="m-0 mb-[30px] mt-6 max-w-[58ch] text-[17px] leading-[1.8] text-pretty text-ink-soft">
            Cinco secciones, quince atributos evaluados y un dictamen por escrito. Jugadores de 12 a
            21 años, cualquier posición y categoría. El video de juego pesa más que el currículum.
          </p>
          <Link href="#form" className={btnPrimary}>
            Ir al formulario
          </Link>
        </div>
      </section>

      <section className="border-b border-rule bg-surface">
        <div className="shell grid gap-[clamp(22px,3vw,40px)] py-[clamp(28px,3.4vw,44px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {PROGRAMA_INTRO.map((it, i) => (
            <Reveal key={it.n} index={i} className="border-t border-ink pt-[18px]">
              <span className="font-mono text-[11px] tracking-[0.1em] text-accent">{it.n}</span>
              <h3 className="m-0 mb-2 mt-2.5 font-display text-xl font-medium">{it.title}</h3>
              <p className="m-0 text-[15px] leading-[1.75] text-ink-soft">{it.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-b border-rule bg-surface py-[clamp(46px,5.5vw,84px)]">
        <div className="shell">
          <Reveal className="eyebrow mb-3.5">Rúbrica de evaluación</Reveal>
          <Reveal as="h2" index={1} className={`${h2Display} mb-5 max-w-[22ch]`}>
            Quince atributos, calificados uno por uno
          </Reveal>
          <Reveal
            as="p"
            index={2}
            className="m-0 mb-[clamp(28px,3.6vw,46px)] max-w-[56ch] text-[17px] leading-[1.8] text-ink-soft"
          >
            Conviene leer la rúbrica antes de llenar la solicitud: el formulario pide exactamente el
            material con el que se califica cada uno de estos apartados.
          </Reveal>

          <div className="grid gap-px border border-rule bg-rule [grid-template-columns:repeat(auto-fill,minmax(min(100%,258px),1fr))]">
            {RUBRIC.map(([name, body], i) => (
              <Reveal
                key={name}
                index={i}
                className="bg-surface px-[clamp(16px,2vw,24px)] py-[clamp(18px,2.2vw,26px)]"
              >
                <span className="font-mono text-[11px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="m-0 my-2 font-display text-[19px] font-medium">{name}</h3>
                <p className="m-0 text-sm leading-[1.7] text-ink-soft">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="form"
        className="scroll-mt-[80px] border-b border-rule py-[clamp(44px,5vw,80px)]"
      >
        <div className="mx-auto max-w-[900px] px-[clamp(20px,5vw,56px)]">
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
