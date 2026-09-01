import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

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

  const { token } = await params;
  const v = await leerVerificacionTutor(token);

  // Token inventado, caducado o de una postulación borrada: misma pantalla.
  // Quien prueba enlaces al azar no debe poder deducir qué menores existen.
  if (!v) {
    return (
      <Aviso
        titulo="Este enlace no sirve"
        cuerpo="O caducó, o nunca existió. Si te invitaron a autorizar una postulación y el enlace ya no funciona, escríbenos y te mandamos uno nuevo."
      />
    );
  }

  if (v.yaVerificado) {
    return (
      <Aviso
        titulo="Ya está autorizada"
        cuerpo={`La postulación ${v.folio} tiene tu autorización registrada. No hace falta que hagas nada más.`}
      />
    );
  }

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[560px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          Autorización · {v.folio}
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(32px,5vw,64px)] uppercase leading-[0.9]">
          ¿Autorizas esta postulación?
        </h1>

        <div className="mb-7 grid gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline">
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              Jugador
            </p>
            <p className="m-0 text-sm text-ink">{v.jugador}</p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              Te señaló como
            </p>
            <p className="m-0 text-sm text-ink">{v.parentesco ?? "Tutor legal"}</p>
          </div>
        </div>

        <p className="m-0 mb-7 max-w-[54ch] leading-[1.7] text-muted">
          Es menor de edad, así que no podemos evaluar su postulación sin tu autorización
          expresa. Al confirmar, aceptas el tratamiento de sus datos según el{" "}
          <Link
            href={{ pathname: "/contenido/[doc]", params: { doc: "privacidad" } }}
            className="text-accent underline underline-offset-4"
          >
            aviso de privacidad
          </Link>
          .
        </p>

        <ConfirmarTutor token={token} />

        <p className="m-0 mt-6 text-sm leading-[1.7] text-muted">
          Si no reconoces esta postulación, no hagas nada: sin tu confirmación no se evalúa.
        </p>
      </div>
    </section>
  );
}
