import { createServerSupabase } from "@/lib/supabase/server";
import { bytesToMb } from "@/lib/format";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { DescargarArchivo } from "@/components/admin/DescargarArchivo";

export default async function ConvocatoriaPage() {
  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("convocatoria_entries")
    .select("id, folio, created_at, nombre, email, link, file_name, file_size")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/convocatoria]", error.message);
    return <Vacio texto="No pudimos cargar las participaciones." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay participaciones." />;

  return (
    <>
      <Tabla cols={["Folio", "Fecha", "Nombre", "Correo", "Enlace", "Archivo"]}>
        {data.map((c) => (
          <tr key={c.id}>
            <Celda mono>{c.folio}</Celda>
            <Celda mono>{fecha(c.created_at)}</Celda>
            <Celda>{c.nombre}</Celda>
            <Celda mono>{c.email}</Celda>
            <Celda mono>
              {c.link ? (
                <a
                  href={c.link}
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
            <Celda mono>
              {c.file_name ? (
                <DescargarArchivo
                  id={c.id}
                  nombre={`${c.file_name} · ${bytesToMb(c.file_size ?? 0)}`}
                />
              ) : (
                "—"
              )}
            </Celda>
          </tr>
        ))}
      </Tabla>

      <p className="mt-5 font-mono text-[11px] leading-[1.8] text-muted">
        Los enlaces se firman al pulsar y caducan en 60 segundos. Cada descarga queda
        registrada en <code>admin_audit</code>: una URL firmada sigue siendo válida
        aunque cierres sesión, así que conviene saber quién la pidió.
      </p>
    </>
  );
}
