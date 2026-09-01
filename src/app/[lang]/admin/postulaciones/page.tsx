import { createServerSupabase } from "@/lib/supabase/server";
import { Celda, Idioma, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { EstadoPostulacion } from "@/components/admin/EstadoPostulacion";
import { EnlaceExpediente } from "@/components/admin/EnlaceExpediente";
import { fijarIdioma } from "@/i18n/servidor";

export default async function PostulacionesPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("applications")
    .select("id, folio, created_at, nombre, email, locale, status, video_url, es_menor, tutor_nombre, tutor_tel, posicion, pie, nivel, club, escolaridad, expediente_enviado_at, tutor_email, tutor_verificado_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/postulaciones]", error.message);
    return <Vacio texto="No pudimos cargar las postulaciones." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay postulaciones." />;

  return (
    <Tabla cols={["Folio", "Fecha", "Jugador", "Perfil", "Tutor", "Estado", "Expediente", "Vídeo"]}>
      {data.map((a) => (
        <tr key={a.id}>
          <Celda mono>{a.folio}</Celda>
          <Celda mono>{fecha(a.created_at)}</Celda>
          <Celda>
            <span className="block">{a.nombre}</span>
            <span className="block font-mono text-xs text-muted">{a.email}</span>
            <Idioma locale={a.locale} />
            {a.es_menor && (
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent">
                Menor de edad
              </span>
            )}
          </Celda>
          <Celda>
            {a.posicion ? (
              <>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                  {a.posicion}
                </span>
                <span className="block font-mono text-xs text-muted">
                  {[a.pie, a.club].filter(Boolean).join(" · ") || "—"}
                </span>
                <span className="block font-mono text-xs text-muted">
                  {[a.nivel, a.escolaridad].filter(Boolean).join(" · ") || "—"}
                </span>
              </>
            ) : (
              <span className="font-mono text-xs text-muted">—</span>
            )}
          </Celda>
          <Celda mono>
            {a.tutor_nombre ? (
              <>
                <span className="block text-ink">{a.tutor_nombre}</span>
                <span className="block">{a.tutor_tel}</span>
                {/* Sin verificar, el consentimiento sigue siendo declarativo:
                    la casilla la pudo marcar el propio menor. */}
                <span
                  className={`mt-1 block text-[10px] font-extrabold uppercase tracking-[0.14em] ${
                    a.tutor_verificado_at ? "text-accent" : "text-danger-text"
                  }`}
                >
                  {a.tutor_verificado_at ? "Verificado" : "Sin verificar"}
                </span>
              </>
            ) : (
              "—"
            )}
          </Celda>
          <Celda>
            <EstadoPostulacion id={a.id} inicial={a.status} />
          </Celda>
          <Celda>
            <EnlaceExpediente id={a.id} enviado={a.expediente_enviado_at ?? null} />
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
