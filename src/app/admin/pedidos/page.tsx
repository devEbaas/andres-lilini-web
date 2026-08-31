import { createServerSupabase } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";

const TONO: Record<string, string> = {
  pagado: "text-accent",
  iniciado: "text-muted",
  expirado: "text-danger-text",
  pendiente: "text-muted",
};

export default async function PedidosPage() {
  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto="Supabase no está configurado." />;

  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, email, total, stripe_session_id")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/pedidos]", error.message);
    return <Vacio texto="No pudimos cargar los pedidos." />;
  }
  if (!data?.length) return <Vacio texto="Todavía no hay pedidos." />;

  return (
    <Tabla cols={["Pedido", "Fecha", "Estado", "Correo", "Total"]}>
      {data.map((o) => (
        <tr key={o.id}>
          <Celda mono>{`AL-${o.id.replace(/-/g, "").slice(-8).toUpperCase()}`}</Celda>
          <Celda mono>{fecha(o.created_at)}</Celda>
          <Celda>
            <span className={`text-[11px] font-extrabold uppercase tracking-[0.14em] ${TONO[o.status] ?? "text-muted"}`}>
              {o.status}
            </span>
          </Celda>
          <Celda mono>{o.email ?? "—"}</Celda>
          <Celda>{money(o.total)}</Celda>
        </tr>
      ))}
    </Tabla>
  );
}
