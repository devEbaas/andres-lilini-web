import type { Metadata } from "next";
import Link from "next/link";

import { CONVOCATORIA_BRIEF } from "@/lib/content/fundacion";
import { ConvocatoriaForm } from "@/components/convocatoria/ConvocatoriaForm";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary, btnSecondary } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Beca de formación 2027",
  description:
    "Diez plazas completas: un año de seguimiento metodológico, equipamiento y acompañamiento académico. Cierra el 30 de noviembre de 2026.",
};

export default function ConvocatoriaPage() {
  return (
    <>
      <section className="border-b border-rule pb-[clamp(34px,4vw,54px)] pt-[clamp(46px,6vw,84px)]">
        <div className="shell">
          <p className="eyebrow m-0 mb-[18px]">
            Convocatoria abierta · cierre 30 de noviembre de 2026
          </p>
          <h1 className="m-0 max-w-[20ch] font-display text-[clamp(32px,4.8vw,60px)] font-normal leading-[1.1]">
            Beca de formación 2027
          </h1>
          <p className="m-0 mb-[30px] mt-6 max-w-[56ch] text-[17px] leading-[1.8] text-pretty text-ink-soft">
            Diez plazas completas: un año de seguimiento metodológico, equipamiento y acompañamiento
            académico para jugadores sin acceso a una estructura profesional.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#participar" className={btnPrimary}>
              Registrar participación
            </Link>
            <Link href="/contenido/bases" className={btnSecondary}>
              Bases completas
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-surface py-[clamp(40px,5vw,68px)]">
        <div className="shell">
          <div className="grid gap-[clamp(24px,3vw,40px)] [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {CONVOCATORIA_BRIEF.map((b, i) => (
              <Reveal key={b.n} index={i} className="border-t border-ink pt-5">
                <span className="font-mono text-[11px] text-accent">{b.n}</span>
                <h3 className="m-0 my-2.5 font-display text-[21px] font-medium">{b.title}</h3>
                <p className="m-0 text-[15px] leading-[1.75] text-ink-soft">{b.body}</p>
              </Reveal>
            ))}
          </div>
          <p className="m-0 mt-[26px] font-mono text-[11px] text-ink-faint">
            Formatos aceptados: PDF, JPG, PNG o MP4 · máximo 25 MB por archivo.
          </p>
        </div>
      </section>

      <section
        id="participar"
        className="scroll-mt-[80px] border-b border-rule pb-[clamp(56px,7vw,100px)] pt-[clamp(40px,5vw,70px)]"
      >
        <div className="mx-auto max-w-[840px] px-[clamp(20px,5vw,56px)]">
          <ConvocatoriaForm />
        </div>
      </section>
    </>
  );
}
