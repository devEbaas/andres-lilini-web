import type { Metadata } from "next";

import { Gallery } from "@/components/trayectoria/Gallery";
import { Milestones } from "@/components/trayectoria/Milestones";
import { Reveal } from "@/components/ui/Reveal";
import { h2Display } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Trayectoria",
  description:
    "Expediente profesional documentado con fechas, cargos e instituciones verificables: Morelia, Boca Juniors, CSKA Moscú, Pumas y selecciones nacionales menores.",
};

export default function TrayectoriaPage() {
  return (
    <>
      <section className="border-b border-rule py-[clamp(56px,7vw,100px)]">
        <div className="shell">
          <div className="mb-[clamp(40px,5vw,66px)] grid gap-[clamp(24px,4vw,56px)] border-b border-rule pb-[34px] nav:[grid-template-columns:180px_1fr]">
            <Reveal className="eyebrow">Expediente profesional</Reveal>
            <div>
              <Reveal
                as="h1"
                index={1}
                className={`${h2Display} max-w-[26ch] text-[clamp(28px,3.6vw,48px)]`}
              >
                Tres países, una misma disciplina de trabajo
              </Reveal>
              <Reveal
                as="p"
                index={2}
                className="m-0 mt-[18px] max-w-[58ch] text-[17px] leading-[1.8] text-pretty text-ink-soft"
              >
                Cada etapa está documentada con fechas, cargos e instituciones verificables. Sin
                cifras estimadas ni títulos atribuidos.
              </Reveal>
            </div>
          </div>

          <Milestones />
        </div>
      </section>

      <section className="border-b border-rule bg-surface py-[clamp(50px,6vw,88px)]">
        <div className="shell">
          <Reveal className="eyebrow mb-3.5">Archivo fotográfico</Reveal>
          <Reveal
            as="h2"
            index={1}
            className={`${h2Display} mb-[clamp(30px,4vw,48px)] max-w-[24ch] text-[clamp(26px,3.2vw,40px)]`}
          >
            Registro de campo, vestidor y visorías
          </Reveal>
          <Gallery />
        </div>
      </section>
    </>
  );
}
