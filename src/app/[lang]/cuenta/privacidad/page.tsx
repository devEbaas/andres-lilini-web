import { Link } from "@/i18n/navigation";

import { getTranslations } from "next-intl/server";

import { getClaims } from "@/lib/auth/dal";
import { MisDatos } from "@/components/privacidad/MisDatos";
import { CancelarCuenta } from "@/components/privacidad/CancelarCuenta";
import { fijarIdioma } from "@/i18n/servidor";

export default async function PrivacidadCuentaPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const t = await getTranslations("account");
  const claims = await getClaims();

  return (
    <div className="grid max-w-[560px] gap-10">
      <section>
        <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">{t("privDatosTitulo")}</h2>
        <p className="m-0 mb-6 leading-[1.7] text-muted">
          {t("privDatosLead")}
        </p>
        <MisDatos />
      </section>

      <section>
        <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">{t("cancelarTitulo")}</h2>
        <p className="m-0 mb-4 leading-[1.7] text-muted">
          {t("cancelarLead")}
        </p>

        <div className="mb-6 grid gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline">
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
              {t("seBorra")}
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              {t("seBorraTexto")}
            </p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
              {t("seAnonimiza")}
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              {t("seAnonimizaTexto")}
            </p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t("noSeToca")}
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              {t.rich("noSeTocaTexto", {
                derechos: (chunks) => (
                  <Link href="/derechos" className="text-accent underline underline-offset-4">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>

        {claims?.email && <CancelarCuenta email={claims.email} />}
      </section>
    </div>
  );
}
