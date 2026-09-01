import type { Metadata } from "next";

import { ExpedienteForm } from "@/components/expediente/ExpedienteForm";
import { leerInvitacion } from "@/lib/expediente";
import { fijarIdioma } from "@/i18n/servidor";

type Props = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Expediente",
  // El enlace es privado: no debe acabar en un buscador.
  robots: { index: false, follow: false },
};

export default async function ExpedientePage({ params }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

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
            Este enlace no sirve
          </h1>
          <p className="m-0 leading-[1.7] text-muted">
            O caducó, o nunca existió. Si te invitamos a completar tu expediente y el enlace ya
            no funciona, escríbenos y te mandamos uno nuevo.
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
            Ya lo recibimos
          </h1>
          <p className="m-0 leading-[1.7] text-muted">
            El expediente de la postulación {invitacion.folio} ya está enviado. Si necesitas
            corregir algo, escríbenos y te habilitamos un enlace nuevo.
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
            Preselección · {invitacion.folio}
          </p>
          <h1 className="m-0 mb-[18px] font-display text-[clamp(36px,6vw,80px)] uppercase leading-[0.9]">
            Tu expediente
          </h1>
          <p className="m-0 mb-9 max-w-[54ch] leading-[1.7] text-muted">
            Hola, {invitacion.nombre.split(" ")[0]}. Pasaste el primer corte. Esto es lo último
            que necesitamos antes de citarte: nada de esto se pedía al postularte porque sólo
            hace falta ahora.
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
