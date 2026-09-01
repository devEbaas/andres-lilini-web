import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { fijarIdioma } from "@/i18n/servidor";

export default async function ExpedientesPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  // Se lee con el cliente autenticado: la policy «admin lee expedientes» es
  // la que autoriza. Aquí hay datos de salud, así que importa más que en
  // ningún otro sitio del panel.
  const { data, error } = await supabase
    .from("expedientes")
    .select(
      "id, created_at, sprint_10, sprint_30, salto_cmj, agilidad_test, agilidad_seg, protocolo, contacto_nombre, contacto_tel, ok_salud, ok_imagen, imagen_alcance, firmante, firmante_nombre, applications(folio, nombre, posicion)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/expedientes]", error.message);
    return <Vacio texto="No pudimos cargar los expedientes." />;
  }
  if (!data?.length) {
    return (
      <Vacio texto="Todavía no hay expedientes. Se llenan desde el enlace que se genera en Postulaciones." />
    );
  }

  return (
    <div className="grid gap-6">
      <p className="m-0 max-w-[62ch] text-sm leading-[1.7] text-muted">
        Segunda fase de los preseleccionados. Los medibles sin protocolo sirven para ordenar
        candidatos, no para compararlos entre sí: dos décimas de diferencia pueden ser el
        cronómetro y no el jugador.
      </p>

      <Tabla
        cols={["Jugador", "Recibido", "Sprint", "Salto · Agilidad", "Protocolo", "Emergencia", "Permisos"]}
      >
        {data.map((e) => {
          const app = Array.isArray(e.applications) ? e.applications[0] : e.applications;
          return (
            <tr key={e.id}>
              <Celda>
                <span className="block">{app?.nombre ?? "—"}</span>
                <span className="block font-mono text-xs text-muted">{app?.folio}</span>
                {app?.posicion && (
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
                    {app.posicion}
                  </span>
                )}
              </Celda>
              <Celda mono>{fecha(e.created_at)}</Celda>
              <Celda mono>
                {[e.sprint_10 && `10m ${e.sprint_10}s`, e.sprint_30 && `30m ${e.sprint_30}s`]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Celda>
              <Celda mono>
                {[
                  e.salto_cmj && `CMJ ${e.salto_cmj}cm`,
                  e.agilidad_test && `${e.agilidad_test} ${e.agilidad_seg ?? "—"}s`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Celda>
              <Celda mono>
                {e.protocolo ?? (
                  <span className="text-danger-text">Sin protocolo</span>
                )}
              </Celda>
              <Celda mono>
                {e.contacto_nombre ? (
                  <>
                    <span className="block text-ink">{e.contacto_nombre}</span>
                    <span className="block">{e.contacto_tel}</span>
                  </>
                ) : (
                  "—"
                )}
              </Celda>
              <Celda>
                <span className="block font-mono text-xs text-muted">
                  Salud: {e.ok_salud ? "sí" : "no"}
                </span>
                <span className="block font-mono text-xs text-muted">
                  Imagen: {e.ok_imagen ? (e.imagen_alcance ?? "sí") : "no"}
                </span>
                <span className="block font-mono text-[10px] text-muted">
                  Firma: {e.firmante === "Tutor" ? "tutor" : "titular"} ·{" "}
                  {e.firmante_nombre ?? "—"}
                </span>
              </Celda>
            </tr>
          );
        })}
      </Tabla>
    </div>
  );
}
