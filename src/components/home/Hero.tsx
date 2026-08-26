import Link from "next/link";

import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary, btnSecondary, btnTertiary } from "@/components/ui/styles";

export function Hero() {
  return (
    <section className="border-b border-rule pb-[clamp(40px,5vw,70px)] pt-[clamp(48px,7vw,92px)]">
      <div className="shell grid items-start gap-[clamp(32px,5vw,64px)] nav:[grid-template-columns:1.35fr_0.85fr]">
        <div>
          <Reveal className="mb-[26px] flex items-center gap-3.5">
            <span aria-hidden className="block h-px w-[34px] bg-accent" />
            <span className="eyebrow">Entrenador y formador de futbolistas</span>
          </Reveal>

          <Reveal
            as="h1"
            index={1}
            className="m-0 max-w-[22ch] font-display text-[clamp(38px,5.4vw,72px)] font-normal leading-[1.08] tracking-[-0.015em]"
          >
            Veintisiete años dedicados a que un jugador joven llegue, y se sostenga.
          </Reveal>

          <Reveal
            as="p"
            index={2}
            className="m-0 mt-7 max-w-[56ch] text-[clamp(16px,1.3vw,18px)] leading-[1.8] text-pretty text-ink-soft"
          >
            Canteras en México, Argentina y Rusia. Dos años y medio al frente de un primer equipo de
            la Liga MX con quince debutantes propios. Hoy, la estructura de selecciones nacionales
            menores de México.
          </Reveal>

          <Reveal index={3} className="mt-9 flex flex-wrap gap-3">
            <Link href="/programa" className={btnPrimary}>
              Postular a un jugador
            </Link>
            <Link href="/trayectoria" className={btnSecondary}>
              Trayectoria
            </Link>
            <Link href="/contenido/prensa" className={btnTertiary}>
              Sala de prensa
            </Link>
          </Reveal>
        </div>

        <Reveal as="figure" index={4} className="m-0">
          <PhotoSlot
            label="Retrato vertical 4:5 · Andrés Lillini en campo de entrenamiento"
            ratio="4/5"
            className="p-[22px]"
          />
          <figcaption className="mt-3 font-display text-sm italic leading-[1.6] text-ink-soft">
            Ciudad de México, 2026. Fotografía pendiente de sustitución.
          </figcaption>
        </Reveal>
      </div>
    </section>
  );
}
