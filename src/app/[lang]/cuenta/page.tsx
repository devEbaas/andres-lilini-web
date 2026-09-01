import { getClaims } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { PerfilForm } from "@/components/auth/PerfilForm";
import { fijarIdioma } from "@/i18n/servidor";

export default async function CuentaPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const claims = await getClaims();
  const supabase = await createServerSupabase();

  // La policy «perfil propio: leer» ya limita la fila; el `.eq` es sólo para
  // no pedir la tabla entera.
  const { data } = claims && supabase
    ? await supabase
        .from("profiles")
        .select("nombre, apellido, telefono")
        .eq("id", claims.userId)
        .maybeSingle()
    : { data: null };

  return (
    <div>
      <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Tus datos</h2>
      <p className="m-0 mb-7 max-w-[52ch] leading-[1.7] text-muted">
        Sólo lo usamos para los envíos y para responderte. Tu correo se cambia desde
        soporte, porque es la llave de la cuenta.
      </p>

      <PerfilForm
        inicial={{
          nombre: data?.nombre ?? "",
          apellido: data?.apellido ?? "",
          telefono: data?.telefono ?? "",
        }}
      />
    </div>
  );
}
