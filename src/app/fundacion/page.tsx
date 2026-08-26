import type { Metadata } from "next";
import Link from "next/link";

import { CAMPAIGNS } from "@/lib/content/fundacion";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Fundación",
  description:
    "Clubes de barrio, escuelas y ligas municipales: detección que llega antes de que el costo la vuelva imposible.",
};

export default function FundacionPage() {
  return (
    <>
      <section className="pb-[clamp(40px,5vw,70px)] pt-[clamp(70px,9vw,130px)]">
        <div className="shell">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            Impacto comunitario
          </p>
          <h1 className="m-0 max-w-[18ch] font-display text-[clamp(40px,8.5vw,124px)] uppercase leading-[0.87]">
            El talento no elige código postal
          </h1>
          <p className="m-0 mt-[26px] max-w-[56ch] text-[17px] leading-[1.7] text-pretty text-muted">
            Trabajamos con clubes de barrio, escuelas y ligas municipales para que la detección
            llegue antes de que el costo la vuelva imposible.
          </p>
        </div>
      </section>

      <section className="pb-[clamp(60px,8vw,100px)]">
        <div className="shell grid gap-[clamp(16px,2vw,26px)] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {CAMPAIGNS.map((c, i) => (
            <Reveal
              key={c.title}
              index={i}
              className="overflow-hidden rounded-[22px] border border-hairline bg-panel transition duration-[350ms] hover:-translate-y-[6px] hover:border-accent"
            >
              <PhotoSlot label={c.photo} ratio="4/3" className="border-0">
                <span className="absolute left-3.5 top-3.5 rounded-full border border-accent bg-bg px-3 py-[7px] text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
                  {c.status}
                </span>
              </PhotoSlot>
              <div className="p-6">
                <h3 className="m-0 mb-2.5 text-[19px] font-bold">{c.title}</h3>
                <p className="m-0 text-[15px] leading-[1.7] text-muted">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline bg-panel py-[clamp(60px,8vw,110px)]">
        <div className="shell flex flex-wrap items-center justify-between gap-[30px]">
          <h2 className="m-0 max-w-[22ch] font-display text-[clamp(28px,4.5vw,62px)] uppercase leading-[0.95]">
            ¿Tu escuela, liga u organización quiere colaborar?
          </h2>
          <Link href="/contacto" className={`${btnPrimary} shrink-0`}>
            Proponer colaboración
          </Link>
        </div>
      </section>
    </>
  );
}
