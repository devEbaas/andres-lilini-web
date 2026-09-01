import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Idioma, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { ResolverArco } from "@/components/admin/ResolverArco";
import { BuscarPorCorreo } from "@/components/admin/BuscarPorCorreo";
import { fijarIdioma } from "@/i18n/servidor";

const TIPO: Record<string, string> = {
  acceso: "Acceso",
  rectificacion: "Rectificación",
  cancelacion: "Cancelación",
  oposicion: "Oposición",
};

export default async function ArcoPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const supabase = await createServerSupabase();

  const { data, error } = supabase
    ? await supabase
        .from("arco_requests")
        .select("id, tipo, nombre, email, locale, detalle, status, nota, created_at")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: null, error: null };

  if (error) console.error("[admin/arco]", error.message);

  return (
    <div className="grid gap-9">
      <section>
        <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">Solicitudes</h2>
        <p className="m-0 mb-6 max-w-[62ch] leading-[1.7] text-muted">
          Acredita la identidad del solicitante antes de entregar o borrar nada, y anota
          cómo lo hiciste. Cada resolución queda en la auditoría.
        </p>

        {!data?.length ? (
          <Vacio texto="No hay solicitudes." />
        ) : (
          <Tabla cols={["Fecha", "Derecho", "Quién", "Detalle", "Estado y nota"]}>
            {data.map((s) => (
              <tr key={s.id}>
                <Celda mono>{fecha(s.created_at)}</Celda>
                <Celda>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                    {TIPO[s.tipo] ?? s.tipo}
                  </span>
                </Celda>
                <Celda>
                  <span className="block">{s.nombre}</span>
                  <span className="block font-mono text-xs text-muted">{s.email}</span>
                  <Idioma locale={s.locale} />
                </Celda>
                <Celda>
                  <span className="block max-w-[40ch] leading-[1.6] text-muted">
                    {s.detalle || "—"}
                  </span>
                </Celda>
                <Celda>
                  <ResolverArco id={s.id} status={s.status} nota={s.nota ?? ""} />
                </Celda>
              </tr>
            ))}
          </Tabla>
        )}
      </section>

      <section className="max-w-[620px]">
        <BuscarPorCorreo />
      </section>
    </div>
  );
}
