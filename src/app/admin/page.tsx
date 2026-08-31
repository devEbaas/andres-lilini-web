import Link from "next/link";

import { createServerSupabase } from "@/lib/supabase/server";
import { tieneMfa } from "@/lib/auth/dal";
import { money } from "@/lib/format";

/**
 * Todas las cuentas salen del cliente autenticado, que pasa por RLS. Si el
 * usuario no fuera admin, `count` vendría a cero en lugar de filtrar nada.
 */
async function resumen() {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const [pedidos, pagados, postulaciones, convocatoria, mensajes, boletin] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("status", "pagado"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("convocatoria_entries").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);

  const facturado = (pagados.data ?? []).reduce((a, o) => a + o.total, 0);

  return {
    pedidos: pedidos.count ?? 0,
    pagados: pagados.data?.length ?? 0,
    facturado,
    postulaciones: postulaciones.count ?? 0,
    convocatoria: convocatoria.count ?? 0,
    mensajes: mensajes.count ?? 0,
    boletin: boletin.count ?? 0,
  };
}

export default async function AdminPage() {
  const [r, mfa] = await Promise.all([resumen(), tieneMfa()]);

  if (!r) {
    return <p className="text-sm text-muted">Supabase no está configurado.</p>;
  }

  const tarjetas = [
    { label: "Pedidos", valor: String(r.pedidos), pie: `${r.pagados} pagados`, href: "/admin/pedidos" },
    { label: "Facturado", valor: money(r.facturado), pie: "Sólo pedidos pagados", href: "/admin/pedidos" },
    { label: "Postulaciones", valor: String(r.postulaciones), pie: "Programa de atletas", href: "/admin/postulaciones" },
    { label: "Convocatoria", valor: String(r.convocatoria), pie: "Participaciones", href: "/admin/convocatoria" },
    { label: "Mensajes", valor: String(r.mensajes), pie: "Sin atender", href: "/admin/mensajes" },
    { label: "Boletín", valor: String(r.boletin), pie: "Suscriptores", href: "/admin/boletin" },
  ];

  return (
    <>
      {!mfa && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-accent/40 bg-panel-2 px-5 py-4">
          <p className="m-0 text-sm leading-[1.6] text-muted">
            Esta cuenta no tiene verificación en dos pasos. Con acceso a las direcciones
            de todos los clientes, la contraseña sola es poco.
          </p>
          <Link
            href="/admin/seguridad"
            className="shrink-0 rounded-full border border-accent px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent transition hover:bg-panel"
          >
            Activar
          </Link>
        </div>
      )}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
      {tarjetas.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className="rounded-[22px] border border-hairline bg-panel p-6 transition duration-300 hover:-translate-y-[4px] hover:border-accent"
        >
          <p className="m-0 mb-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {t.label}
          </p>
          <p className="m-0 mb-1.5 font-display text-[clamp(28px,3vw,40px)] uppercase leading-none">
            {t.valor}
          </p>
          <p className="m-0 text-xs text-muted">{t.pie}</p>
        </Link>
      ))}
      </div>
    </>
  );
}
