import type { Metadata } from "next";
import Link from "next/link";

import { CAMPAIGNS } from "@/lib/content/fundacion";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary, h2Display } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Comunidad",
  description:
    "Trabajo conjunto con clubes de barrio, escuelas y ligas municipales para que la detección llegue antes de que el costo la vuelva imposible.",
};

export default function FundacionPage() {
  return (
    <>
      <section className="border-b border-rule pb-[clamp(34px,4vw,54px)] pt-[clamp(46px,6vw,84px)]">
        <div className="shell">
          <p className="eyebrow m-0 mb-[18px]">Programa de impacto comunitario</p>
          <h1 className="m-0 max-w-[22ch] font-display text-[clamp(32px,4.8vw,60px)] font-normal leading-[1.1]">
            El talento no elige código postal
          </h1>
          <p className="m-0 mt-6 max-w-[56ch] text-[17px] leading-[1.8] text-pretty text-ink-soft">
            Trabajo conjunto con clubes de barrio, escuelas y ligas municipales para que la
            detección llegue antes de que el costo la vuelva imposible.
          </p>
        </div>
      </section>

      <section className="border-b border-rule py-[clamp(40px,5vw,70px)]">
        <div className="shell grid gap-[clamp(22px,3vw,38px)] [grid-template-columns:repeat(auto-fill,minmax(270px,1fr))]">
          {CAMPAIGNS.map((c, i) => (
            <Reveal key={c.title} index={i}>
              <PhotoSlot label={c.photo} ratio="4/3">
                <span className="absolute left-0 top-0 border-b border-r border-rule bg-paper px-3 py-[7px] text-[9px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {c.status}
                </span>
              </PhotoSlot>
              <div className="pt-4">
                <h3 className="m-0 mb-2.5 font-display text-[21px] font-medium">{c.title}</h3>
                <p className="m-0 text-[15px] leading-[1.75] text-ink-soft">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-b border-rule bg-surface py-[clamp(44px,5vw,76px)]">
        <div className="shell flex flex-wrap items-center justify-between gap-7">
          <h2 className={`${h2Display} max-w-[26ch] text-[clamp(24px,3.2vw,40px)] leading-[1.2]`}>
            ¿Su escuela, liga u organización desea colaborar?
          </h2>
          <Link href="/contacto" className={`${btnPrimary} shrink-0`}>
            Proponer colaboración
          </Link>
        </div>
      </section>
    </>
  );
}
