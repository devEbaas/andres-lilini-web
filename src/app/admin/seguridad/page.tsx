import { MfaEnroll } from "@/components/auth/MfaEnroll";
import { tieneMfa } from "@/lib/auth/dal";

export default async function SeguridadPage() {
  const activo = await tieneMfa();

  return (
    <div className="max-w-[520px]">
      <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Verificación en dos pasos</h2>
      <p className="m-0 mb-7 leading-[1.7] text-muted">
        Un código temporal además de la contraseña. Es la diferencia entre que una
        contraseña filtrada sea un susto o una fuga de datos.
      </p>

      <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)]">
        <MfaEnroll activo={activo} />
      </div>
    </div>
  );
}
