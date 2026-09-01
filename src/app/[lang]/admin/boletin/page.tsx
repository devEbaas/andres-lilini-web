import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { fijarIdioma } from "@/i18n/servidor";

export default async function BoletinPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[admin/boletin]", error.message);
    return <Vacio texto="No pudimos cargar los suscriptores." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay suscriptores." />;

  return (
    <Tabla cols={["Correo", "Alta"]}>
      {data.map((s) => (
        <tr key={s.id}>
          <Celda mono>{s.email}</Celda>
          <Celda mono>{fecha(s.created_at)}</Celda>
        </tr>
      ))}
    </Tabla>
  );
}
