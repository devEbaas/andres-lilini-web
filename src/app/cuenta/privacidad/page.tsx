import Link from "next/link";

import { getClaims } from "@/lib/auth/dal";
import { MisDatos } from "@/components/privacidad/MisDatos";
import { CancelarCuenta } from "@/components/privacidad/CancelarCuenta";

export default async function PrivacidadCuentaPage() {
  const claims = await getClaims();

  return (
    <div className="grid max-w-[560px] gap-10">
      <section>
        <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Tus datos</h2>
        <p className="m-0 mb-6 leading-[1.7] text-muted">
          Un archivo con tu perfil y todos tus pedidos, tal como los guardamos.
        </p>
        <MisDatos />
      </section>

      <section>
        <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Cancelar la cuenta</h2>
        <p className="m-0 mb-4 leading-[1.7] text-muted">
          Antes de pulsar, esto es exactamente lo que pasa:
        </p>

        <div className="mb-6 grid gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline">
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
              Se borra
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              Tu cuenta, tu contraseña y tus datos de perfil.
            </p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
              Se anonimiza
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              Tus pedidos pierden el correo y la dirección de envío. Los importes y las
              fechas se conservan porque la ley obliga a guardar la contabilidad.
            </p>
          </div>
          <div className="bg-panel px-5 py-4">
            <p className="m-0 mb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              No se toca
            </p>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              Postulaciones, participaciones en la convocatoria y mensajes de contacto:
              pueden estar en un proceso en curso. Para esos, usa el{" "}
              <Link href="/derechos" className="text-accent underline underline-offset-4">
                formulario de derechos
              </Link>
              .
            </p>
          </div>
        </div>

        {claims?.email && <CancelarCuenta email={claims.email} />}
      </section>
    </div>
  );
}
