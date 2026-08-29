import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { EstadoPostulacion } from "@/components/admin/EstadoPostulacion";

export default async function PostulacionesPage() {
  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("applications")
    .select("id, folio, created_at, nombre, email, status, video_url")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/postulaciones]", error.message);
    return <Vacio texto="No pudimos cargar las postulaciones." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay postulaciones." />;

  return (
    <Tabla cols={["Folio", "Fecha", "Nombre", "Correo", "Estado", "Vídeo"]}>
      {data.map((a) => (
        <tr key={a.id}>
          <Celda mono>{a.folio}</Celda>
          <Celda mono>{fecha(a.created_at)}</Celda>
          <Celda>{a.nombre}</Celda>
          <Celda mono>{a.email}</Celda>
          <Celda>
            <EstadoPostulacion id={a.id} inicial={a.status} />
          </Celda>
          <Celda mono>
            {a.video_url ? (
              <a
                href={a.video_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent underline underline-offset-4"
              >
                Abrir
              </a>
            ) : (
              "—"
            )}
          </Celda>
        </tr>
      ))}
    </Tabla>
  );
}
