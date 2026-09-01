import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

import { DerechosForm } from "@/components/privacidad/DerechosForm";
import { fijarIdioma } from "@/i18n/servidor";

export const metadata: Metadata = {
  title: "Ejercer tus derechos",
  description:
    "Solicita acceso, rectificación, cancelación u oposición sobre tus datos personales.",
};

export default async function DerechosPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(60px,8vw,110px)]">
      <div className="shell">
        <div className="mx-auto max-w-[620px]">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            Datos personales
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(38px,7vw,86px)] uppercase leading-[0.9]">
            Tus derechos
          </h1>
          <p className="m-0 mb-8 max-w-[52ch] leading-[1.7] text-muted">
            Puedes pedirnos acceso a tus datos, corregirlos, cancelarlos u oponerte a que
            los usemos. No hace falta tener cuenta: si alguna vez rellenaste un formulario
            del sitio, esto también es para ti.
          </p>

          <div className="mb-8 rounded-[18px] border border-hairline bg-panel px-5 py-4">
            <p className="m-0 text-sm leading-[1.7] text-muted">
              Antes de entregar o borrar nada tenemos que comprobar que eres quien dices
              ser. Te escribiremos para acreditarlo. Si tienes cuenta, en{" "}
              <Link href="/cuenta/privacidad" className="text-accent underline underline-offset-4">
                tu cuenta
              </Link>{" "}
              puedes descargar tus datos y darte de baja al momento.
            </p>
          </div>

          <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3.5vw,38px)] shadow-soft">
            <DerechosForm />
          </div>

          <p className="m-0 mt-6 text-sm text-muted">
            Consulta el{" "}
            <Link
              href={{ pathname: "/contenido/[doc]", params: { doc: "privacidad" } }}
              className="text-accent underline underline-offset-4"
            >
              aviso de privacidad
            </Link>{" "}
            para saber qué datos guardamos y por qué.
          </p>
        </div>
      </div>
    </section>
  );
}
