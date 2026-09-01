import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

import { getTranslations } from "next-intl/server";

import { DerechosForm } from "@/components/privacidad/DerechosForm";
import { fijarIdioma } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe("/derechos", "derechos");
}

export default async function DerechosPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("derechos");

  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(60px,8vw,110px)]">
      <div className="shell">
        <div className="mx-auto max-w-[620px]">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(38px,7vw,86px)] uppercase leading-[0.9]">
            {t("titulo")}
          </h1>
          <p className="m-0 mb-8 max-w-[52ch] leading-[1.7] text-muted">
            {t("lead")}
          </p>

          <div className="mb-8 rounded-[18px] border border-hairline bg-panel px-5 py-4">
            <p className="m-0 text-sm leading-[1.7] text-muted">
              {t.rich("identidad", {
                cuenta: (chunks) => (
                  <Link
                    href="/cuenta/privacidad"
                    className="text-accent underline underline-offset-4"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>

          <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3.5vw,38px)] shadow-soft">
            <DerechosForm />
          </div>

          <p className="m-0 mt-6 text-sm text-muted">
            {t.rich("consulta", {
              aviso: (chunks) => (
                <Link
                  href={{ pathname: "/contenido/[doc]", params: { doc: "privacidad" } }}
                  className="text-accent underline underline-offset-4"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
