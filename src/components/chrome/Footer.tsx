import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { FOOTER_COLS, SOCIAL } from "@/lib/content/site";
import { NewsletterForm } from "./NewsletterForm";

export async function Footer() {
  const t = await getTranslations("footer");
  const tl = await getTranslations("links");

  return (
    <footer className="border-t border-hairline bg-panel pb-[30px] pt-[clamp(50px,7vw,90px)]">
      <div className="shell">
        <div className="grid gap-[clamp(30px,4vw,50px)] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] nav:[grid-template-columns:repeat(7,minmax(0,1fr))]">
          {/* A partir de 640px la rejilla tiene dos columnas o más; por debajo
              sólo hay una y `col-span-2` abría una columna implícita que
              desbordaba la pantalla.

              La marca ocupa dos huecos, así que con cinco columnas de enlaces
              la rejilla necesita siete: con seis, la última caía a una segunda
              fila. */}
          <div className="min-w-0 sm:col-span-2 nav:col-span-1">
            {/* Aquí va la marca completa: ya trae el nombre y el descriptor,
                así que no se repiten al lado. */}
            <Image
              src="/images/logo.png"
              alt={t("logoAlt")}
              width={640}
              height={719}
              className="h-[clamp(140px,14vw,152px)] w-auto"
            />
            <p className="m-0 my-[18px] mb-[22px] max-w-[34ch] leading-[1.7] text-muted">
              {t("lema")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map((s) => (
                <span
                  key={s}
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-hairline text-[9px] font-extrabold tracking-[0.08em] text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.key}>
              <div className="label-caps mb-4">{t(`cols.${col.key}`)}</div>
              <div className="flex flex-col gap-[11px]">
                {col.links.map((l) => (
                  <Link key={l.key} href={l.href} className="text-sm text-ink hover:text-accent">
                    {tl(l.key)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] grid items-center gap-[26px] border-t border-hairline pt-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div>
            <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em]">
              {t("boletinTitulo")}
            </div>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              {t("boletinTexto")}
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-[34px] flex flex-wrap justify-between gap-x-[22px] gap-y-2 font-mono text-[11px] text-muted">
          <span>{t("copyright")}</span>
          <span className="flex gap-5">
            <Link
              href={{ pathname: "/contenido/[doc]", params: { doc: "privacidad" } }}
              className="text-muted hover:text-accent"
            >
              {t("privacidad")}
            </Link>
            <Link
              href={{ pathname: "/contenido/[doc]", params: { doc: "terminos" } }}
              className="text-muted hover:text-accent"
            >
              {t("terminos")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
