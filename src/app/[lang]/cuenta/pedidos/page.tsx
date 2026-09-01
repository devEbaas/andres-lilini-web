import { getTranslations } from "next-intl/server";

import { createServerSupabase } from "@/lib/supabase/server";
import { vincularPedidosHuerfanos } from "@/lib/auth/pedidos";
import { money } from "@/lib/format";
import { Celda, Tabla, Vacio, fecha } from "@/components/admin/Tabla";
import { fijarIdioma } from "@/i18n/servidor";

export default async function MisPedidosPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  // Adopta los pedidos de invitado hechos con este correo. Es idempotente:
  // la segunda vez no encuentra ninguno y no hace nada.
  const t = await getTranslations("account");

  await vincularPedidosHuerfanos();

  const supabase = await createServerSupabase();
  if (!supabase) return <Vacio texto={t("pedidosError")} />;

  // Sin filtro por usuario: la policy «cliente lee sus pedidos» ya decide qué
  // filas existen para esta sesión. Añadirlo aquí no daría más seguridad.
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, total, items")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[cuenta/pedidos]", error.message);
    return <Vacio texto={t("pedidosError")} />;
  }
  if (!data?.length) {
    return <Vacio texto={t("pedidosVacio")} />;
  }

  return (
    <Tabla
      cols={[
        t("pedidosCols.pedido"),
        t("pedidosCols.fecha"),
        t("pedidosCols.articulos"),
        t("pedidosCols.estado"),
        t("pedidosCols.total"),
      ]}
    >
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
                {t.has(`pedidosEstado.${o.status}`) ? t(`pedidosEstado.${o.status}`) : o.status}
              </span>
            </Celda>
            <Celda>{money(o.total)}</Celda>
          </tr>
        );
      })}
    </Tabla>
  );
}
