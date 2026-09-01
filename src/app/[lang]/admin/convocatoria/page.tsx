import { createServerSupabase } from "@/lib/supabase/server";
import { bytesToMb } from "@/lib/format";
import { edadAlCierre } from "@/lib/content/fundacion";
import { Celda, Idioma, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { DescargarArchivo } from "@/components/admin/DescargarArchivo";
import { fijarIdioma } from "@/i18n/servidor";

export default async function ConvocatoriaPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("convocatoria_entries")
    .select("id, folio, created_at, nombre, email, locale, link, file_name, file_size, nacimiento, estado, categoria, posicion, pie, es_menor, tutor_nombre, tutor_tel")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/convocatoria]", error.message);
    return <Vacio texto="No pudimos cargar las participaciones." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay participaciones." />;

  return (
    <>
      <Tabla cols={["Folio", "Fecha", "Jugador", "Edad", "Perfil", "Tutor", "Enlace", "Archivo"]}>
        {data.map((c) => (
          <tr key={c.id}>
            <Celda mono>{c.folio}</Celda>
            <Celda mono>{fecha(c.created_at)}</Celda>
            <Celda>
              <span className="block">{c.nombre}</span>
              <span className="block font-mono text-xs text-muted">{c.email}</span>
              <Idioma locale={c.locale} />
              {c.estado && (
                <span className="block font-mono text-xs text-muted">{c.estado}</span>
              )}
            </Celda>
            <Celda mono>
              {/* Edad al cierre, no la de hoy: es la que fijan las bases. */}
              {c.nacimiento ? `${edadAlCierre(c.nacimiento) ?? "—"} años` : "—"}
              {c.es_menor && (
                <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent">
                  Menor
                </span>
              )}
            </Celda>
            <Celda>
              {c.categoria ? (
                <>
                  <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                    {c.categoria}
                  </span>
                  <span className="block font-mono text-xs text-muted">
                    {[c.posicion, c.pie].filter(Boolean).join(" · ") || "—"}
                  </span>
                </>
              ) : (
                <span className="font-mono text-xs text-muted">—</span>
              )}
            </Celda>
            <Celda mono>
              {c.tutor_nombre ? (
                <>
                  <span className="block text-ink">{c.tutor_nombre}</span>
                  <span className="block">{c.tutor_tel}</span>
                </>
              ) : (
                "—"
              )}
            </Celda>
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
