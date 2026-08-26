import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DOCS, DOCS_UPDATED, getDoc } from "@/lib/content/docs";
import { FaqList } from "@/components/contenido/FaqList";
import { Reveal } from "@/components/ui/Reveal";
import { tab, tabOff, tabOn } from "@/components/ui/styles";

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
  const { doc } = await params;
  const current = getDoc(doc);
  if (!current) notFound();

  return (
    <section className="border-b border-rule pb-[clamp(56px,7vw,96px)] pt-[clamp(40px,5vw,72px)]">
      <div className="shell">
        <nav
          aria-label="Secciones de contenido"
          className="mb-[clamp(34px,4vw,54px)] flex gap-[26px] overflow-x-auto border-b border-rule pb-4"
        >
          {DOCS.map((d) => (
            <Link
              key={d.slug}
              href={`/contenido/${d.slug}`}
              aria-current={d.slug === current.slug ? "page" : undefined}
              className={`${tab} ${d.slug === current.slug ? tabOn : tabOff}`}
            >
              {d.label}
            </Link>
          ))}
        </nav>

        <div className="max-w-[720px]">
          <p className="eyebrow m-0 mb-4">{current.meta}</p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(30px,4.2vw,54px)] font-normal leading-[1.1]">
            {current.title}
          </h1>
          <p className="m-0 mb-[clamp(30px,4vw,46px)] border-b border-rule pb-[clamp(26px,3vw,38px)] text-[18px] leading-[1.8] text-pretty text-ink-soft">
            {current.lead}
          </p>

          {current.kind === "faq" ? (
            <FaqList />
          ) : (
            <div>
              {current.body?.map((b, i) => (
                <Reveal key={b.h} index={i} className="mb-[34px] grid gap-2.5">
                  <h2 className="m-0 font-display text-[clamp(20px,2.2vw,25px)] font-medium leading-[1.3]">
                    {b.h}
                  </h2>
                  <p className="m-0 text-base leading-[1.85] text-pretty text-ink-soft">{b.p}</p>
                </Reveal>
              ))}
              <p className="m-0 mt-10 border-t border-rule pt-5 font-mono text-[11px] text-ink-faint">
                Última actualización: {DOCS_UPDATED}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
