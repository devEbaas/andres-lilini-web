import { createServerSupabase } from "@/lib/supabase/server";
import { vincularPedidosHuerfanos } from "@/lib/auth/pedidos";
import { money } from "@/lib/format";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";

const ETIQUETA: Record<string, string> = {
  pagado: "Pagado",
  iniciado: "Sin completar",
  expirado: "Caducado",
  pendiente: "Pendiente",
};

export default async function MisPedidosPage() {
  // Adopta los pedidos de invitado hechos con este correo. Es idempotente:
  // la segunda vez no encuentra ninguno y no hace nada.
  await vincularPedidosHuerfanos();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="No pudimos cargar tus pedidos." />;

  // Sin filtro por usuario: la policy «cliente lee sus pedidos» ya decide qué
  // filas existen para esta sesión. Añadirlo aquí no daría más seguridad.
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, total, items")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[cuenta/pedidos]", error.message);
    return <Vacio texto="No pudimos cargar tus pedidos." />;
  }
  if (!data?.length) {
    return <Vacio texto="Todavía no tienes pedidos. Los que hagas aparecerán aquí." />;
  }

  return (
    <Tabla cols={["Pedido", "Fecha", "Artículos", "Estado", "Total"]}>
      {data.map((o) => {
        const items = Array.isArray(o.items) ? o.items.length : 0;
        return (
          <tr key={o.id}>
            <Celda mono>{`AL-${o.id.replace(/-/g, "").slice(-8).toUpperCase()}`}</Celda>
            <Celda mono>{fecha(o.created_at)}</Celda>
            <Celda mono>{items || "—"}</Celda>
            <Celda>
              <span
                className={`text-[11px] font-extrabold uppercase tracking-[0.14em] ${
                  o.status === "pagado" ? "text-accent" : "text-muted"
                }`}
              >
                {ETIQUETA[o.status] ?? o.status}
              </span>
            </Celda>
            <Celda>{money(o.total)}</Celda>
          </tr>
        );
      })}
    </Tabla>
  );
}
