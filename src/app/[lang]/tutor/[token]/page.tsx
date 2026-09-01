import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

import { getTranslations } from "next-intl/server";

import { ConfirmarTutor } from "@/components/tutor/ConfirmarTutor";
import { leerVerificacionTutor } from "@/lib/tutor";
import { fijarIdioma } from "@/i18n/servidor";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Autorización del tutor",
  // Enlace privado sobre la postulación de un menor: fuera de los buscadores.
  robots: { index: false, follow: false },
};

function Aviso({ titulo, cuerpo }: { titulo: string; cuerpo: string }) {
  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="max-w-[560px] px-[clamp(18px,4vw,44px)] text-center">
        <h1 className="m-0 mb-3.5 font-display text-[clamp(30px,5vw,56px)] uppercase leading-[0.95]">
          {titulo}
        </h1>
        <p className="m-0 leading-[1.7] text-muted">{cuerpo}</p>
      </div>
    </section>
  );
}

export default async function TutorPage({ params }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("tutor");
  const tv = await getTranslations("vocab");

  const { token } = await params;
  const v = await leerVerificacionTutor(token);

  // Token inventado, caducado o de una postulación borrada: misma pantalla.
  // Quien prueba enlaces al azar no debe poder deducir qué menores existen.
  if (!v) {
    return (
      <Aviso
        titulo={t("invalidoTitulo")}
        cuerpo={t("invalidoTexto")}
      />
    );
  }

  if (v.yaVerificado) {
    return (
      <Aviso
        titulo={t("yaTitulo")}
        cuerpo={t("yaTexto", { folio: v.folio })}
      />
    );
  }

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[560px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          {t("eyebrow", { folio: v.folio })}
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(32px,5vw,64px)] uppercase leading-[0.9]">
          {t("titulo")}
        </h1>

        <div className="mb-7 grid gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline">
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t("jugador")}
            </p>
            <p className="m-0 text-sm text-ink">{v.jugador}</p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              {t("teSenalo")}
            </p>
            <p className="m-0 text-sm text-ink">{tv(v.parentesco ?? "Tutor legal")}</p>
          </div>
        </div>

        <p className="m-0 mb-7 max-w-[54ch] leading-[1.7] text-muted">
          {t.rich("aviso", {
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

        <ConfirmarTutor token={token} />

        <p className="m-0 mt-6 text-sm leading-[1.7] text-muted">
          {t("noReconoces")}
        </p>
      </div>
    </section>
  );
}
