import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

import { getTranslations } from "next-intl/server";

import { CONVOCATORIA_BRIEF } from "@/lib/content/fundacion";
import { ConvocatoriaForm } from "@/components/convocatoria/ConvocatoriaForm";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary } from "@/components/ui/styles";
import { fijarIdioma } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe("/convocatoria", "convocatoria");
}

export default async function ConvocatoriaPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("convocatoria");

  return (
    <>
      <section className="relative overflow-hidden pb-[clamp(40px,5vw,70px)] pt-[clamp(70px,9vw,130px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 80% at 20% 10%, oklch(0.905 0.125 128 / 0.10), transparent 68%)",
          }}
        />
        <div className="shell relative">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 max-w-[16ch] font-display text-[clamp(40px,9vw,132px)] uppercase leading-[0.86]">
            {t("titulo")}
          </h1>
          <p className="m-0 my-[26px] mb-8 max-w-[56ch] text-[17px] leading-[1.7] text-pretty text-muted">
            {t("lead")}
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Ancla dentro de la propia página: salto nativo, sin router. */}
            <a href="#participar" className={btnPrimary}>
              {t("participar")}
            </a>
            <Link
              href={{ pathname: "/contenido/[doc]", params: { doc: "bases" } }}
              className="inline-flex min-h-[48px] items-center rounded-full border border-hairline px-[30px] text-[12px] font-extrabold uppercase tracking-[0.18em] text-muted transition hover:border-hairline-strong hover:text-ink"
            >
              {t("leerBases")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline py-[clamp(50px,6vw,90px)]">
        <div className="shell">
          <div className="grid gap-[clamp(16px,2vw,26px)] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {CONVOCATORIA_BRIEF.map((b, i) => (
              <Reveal
                key={b.key}
                index={i}
                className="rounded-[22px] border border-hairline bg-panel p-[30px]"
              >
                <span className="text-gradient block font-display text-[32px] leading-none">
                  {b.n}
                </span>
                <h3 className="m-0 my-3.5 mb-2.5 text-[18px] font-bold">
                  {t(`brief.${b.key}.title`)}
                </h3>
                <p className="m-0 text-[15px] leading-[1.7] text-muted">
                  {t(`brief.${b.key}.body`)}
                </p>
              </Reveal>
            ))}
          </div>
          <p className="m-0 mt-[22px] font-mono text-[11px] text-muted">
            {t("formatos")}
          </p>
        </div>
      </section>

      <section
        id="participar"
        className="scroll-mt-[90px] pb-[clamp(70px,9vw,120px)] pt-[clamp(40px,5vw,70px)]"
      >
        <div className="mx-auto max-w-[820px] px-[clamp(18px,4vw,44px)]">
          <ConvocatoriaForm />
        </div>
      </section>
    </>
  );
}
