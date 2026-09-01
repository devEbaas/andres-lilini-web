import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { ExpedienteForm } from "@/components/expediente/ExpedienteForm";
import { leerInvitacion } from "@/lib/expediente";
import { fijarIdioma } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

type Props = { params: Promise<{ token: string }> };

// El enlace es privado: `indexable: false` lo deja fuera de los buscadores y
// sin alternativas de idioma, que aquí no significan nada.
export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe({ pathname: "/expediente/[token]", params: { token: "" } }, "expediente", {
    indexable: false,
  });
}

export default async function ExpedientePage({ params }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("expediente");

  const { token } = await params;
  const invitacion = await leerInvitacion(token);

  // Un token inventado, uno caducado y uno de una postulación borrada dan
  // exactamente la misma pantalla: quien prueba enlaces al azar no debe
  // poder deducir cuáles existieron.
  if (!invitacion) {
    return (
      <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
        <div className="max-w-[560px] px-[clamp(18px,4vw,44px)] text-center">
          <h1 className="m-0 mb-3.5 font-display text-[clamp(30px,5vw,56px)] uppercase leading-[0.95]">
            {t("invalidoTitulo")}
          </h1>
          <p className="m-0 leading-[1.7] text-muted">
            {t("invalidoTexto")}
          </p>
        </div>
      </section>
    );
  }

  if (invitacion.yaEnviado) {
    return (
      <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
        <div className="max-w-[560px] px-[clamp(18px,4vw,44px)] text-center">
          <h1 className="m-0 mb-3.5 font-display text-[clamp(30px,5vw,56px)] uppercase leading-[0.95]">
            {t("enviadoTitulo")}
          </h1>
          <p className="m-0 leading-[1.7] text-muted">
            {t("enviadoTexto", { folio: invitacion.folio })}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(60px,8vw,110px)]">
      <div className="shell">
        <div className="mx-auto max-w-[680px]">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            {t("eyebrow", { folio: invitacion.folio })}
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(36px,6vw,80px)] uppercase leading-[0.9]">
            {t("titulo")}
          </h1>
          <p className="m-0 mb-9 max-w-[54ch] leading-[1.7] text-muted">
            {t("lead", { nombre: invitacion.nombre.split(" ")[0] })}
          </p>

          <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3.5vw,38px)] shadow-soft">
            <ExpedienteForm
              token={token}
              esMenor={invitacion.esMenor}
              tutorNombre={invitacion.tutorNombre}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
