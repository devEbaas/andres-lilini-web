import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { metadatosDe } from "@/i18n/metadata";
import { localeActual } from "@/i18n/servidor";

import { DOCS, DOCS_LEGALES, getDoc } from "@/lib/content/docs";
import { FaqList } from "@/components/contenido/FaqList";
import { Reveal } from "@/components/ui/Reveal";
import { chip, chipOff, chipOn } from "@/components/ui/styles";
import { fijarIdioma } from "@/i18n/servidor";

type Params = { params: Promise<{ doc: string }> };

export function generateStaticParams() {
  return DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { doc } = await params;
  const t = await getTranslations("docs");
  if (!getDoc(doc)) return { title: t("noEncontrado") };

  const base = await metadatosDe({ pathname: "/contenido/[doc]", params: { doc } }, "inicio");
  const title = t(`${doc}.title`);
  const description = t(`${doc}.lead`);
  return {
    ...base,
    title,
    description,
    openGraph: { ...base.openGraph, title, description },
  };
}

export default async function DocPage({ params }: Params) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const t = await getTranslations("docs");
  const locale = await localeActual();

  const { doc } = await params;
  const current = getDoc(doc);
  if (!current) notFound();

  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(50px,7vw,100px)]">
      <div className="shell">
        <nav
          aria-label={t("navLabel")}
          className="mb-[clamp(34px,5vw,56px)] flex gap-2 overflow-x-auto border-b border-hairline pb-[26px]"
        >
          {DOCS.map((d) => (
            <Link
              key={d.slug}
              href={{ pathname: "/contenido/[doc]", params: { doc: d.slug } }}
              aria-current={d.slug === current.slug ? "page" : undefined}
              className={`${chip} ${d.slug === current.slug ? chipOn : chipOff}`}
            >
              {t(`${d.slug}.label`)}
            </Link>
          ))}
        </nav>

        <div className="mx-auto max-w-[760px]">
          <p className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-accent">
            {t(`${current.slug}.meta`)}
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,80px)] uppercase leading-[0.9]">
            {t(`${current.slug}.title`)}
          </h1>
          <p className="m-0 mb-[clamp(30px,4vw,48px)] text-[18px] leading-[1.7] text-pretty text-muted">
            {t(`${current.slug}.lead`)}
          </p>

          {/* Un documento legal traducido no vincula: lo dice él mismo y enlaza
              al original, en vez de dejarlo en una nota de la fase siguiente. */}
          {locale !== routing.defaultLocale && DOCS_LEGALES.includes(current.slug) && (
            <p className="m-0 mb-8 rounded-[14px] border border-hairline-strong bg-panel px-5 py-4 text-sm leading-[1.7] text-muted">
              {t("avisoLegal")}{" "}
              <Link
                href={{ pathname: "/contenido/[doc]", params: { doc: current.slug } }}
                locale={routing.defaultLocale}
                className="text-accent underline underline-offset-4"
              >
                {t("verOriginal")}
              </Link>
              .
            </p>
          )}

          {current.kind === "faq" ? (
            <FaqList />
          ) : (
            <div>
              {current.sections?.map((clave, i) => (
                <Reveal key={clave} index={i} className="mb-[30px]">
                  <h2 className="m-0 mb-3 text-[clamp(19px,2.2vw,26px)] font-bold tracking-[-0.01em]">
                    {t(`${current.slug}.s.${clave}.h`)}
                  </h2>
                  <p className="m-0 text-base leading-[1.8] text-pretty text-muted">
                    {t(`${current.slug}.s.${clave}.p`)}
                  </p>
                </Reveal>
              ))}
              <p className="m-0 mt-10 border-t border-hairline pt-5 font-mono text-[11px] text-muted">
                {t("actualizado", { fecha: t("fechaActualizacion") })}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
