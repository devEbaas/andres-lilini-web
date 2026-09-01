import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { DOCS, DOCS_UPDATED, getDoc } from "@/lib/content/docs";
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
  const found = getDoc(doc);
  if (!found) return { title: "Contenido no encontrado" };
  return { title: found.title, description: found.lead };
}

export default async function DocPage({ params }: Params) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const { doc } = await params;
  const current = getDoc(doc);
  if (!current) notFound();

  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(50px,7vw,100px)]">
      <div className="shell">
        <nav
          aria-label="Secciones de contenido"
          className="mb-[clamp(34px,5vw,56px)] flex gap-2 overflow-x-auto border-b border-hairline pb-[26px]"
        >
          {DOCS.map((d) => (
            <Link
              key={d.slug}
              href={{ pathname: "/contenido/[doc]", params: { doc: d.slug } }}
              aria-current={d.slug === current.slug ? "page" : undefined}
              className={`${chip} ${d.slug === current.slug ? chipOn : chipOff}`}
            >
              {d.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto max-w-[760px]">
          <p className="m-0 mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-accent">
            {current.meta}
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,80px)] uppercase leading-[0.9]">
            {current.title}
          </h1>
          <p className="m-0 mb-[clamp(30px,4vw,48px)] text-[18px] leading-[1.7] text-pretty text-muted">
            {current.lead}
          </p>

          {current.kind === "faq" ? (
            <FaqList />
          ) : (
            <div>
              {current.body?.map((b, i) => (
                <Reveal key={b.h} index={i} className="mb-[30px]">
                  <h2 className="m-0 mb-3 text-[clamp(19px,2.2vw,26px)] font-bold tracking-[-0.01em]">
                    {b.h}
                  </h2>
                  <p className="m-0 text-base leading-[1.8] text-pretty text-muted">{b.p}</p>
                </Reveal>
              ))}
              <p className="m-0 mt-10 border-t border-hairline pt-5 font-mono text-[11px] text-muted">
                Última actualización: {DOCS_UPDATED}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
