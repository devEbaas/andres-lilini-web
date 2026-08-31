import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/dal";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

const SECCIONES = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/postulaciones", label: "Postulaciones" },
  { href: "/admin/convocatoria", label: "Convocatoria" },
  { href: "/admin/expedientes", label: "Expedientes" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/boletin", label: "Boletín" },
  { href: "/admin/arco", label: "Derechos" },
  { href: "/admin/seguridad", label: "Seguridad" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defensa en profundidad, no la frontera: las policies de RLS ya niegan las
  // filas a quien no sea admin. Si esta comprobación fallara, el panel se
  // vería vacío en lugar de filtrar datos.
  const admin = await requireAdmin("/admin");

  return (
    <section className="py-[clamp(40px,6vw,80px)]">
      <div className="shell">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
              Panel
            </p>
            <h1 className="m-0 font-display text-[clamp(28px,4vw,48px)] uppercase leading-[0.95]">
              Administración
            </h1>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="font-mono text-[11px] text-muted">{admin.email}</span>
            <SignOutButton />
          </div>
        </header>

        <nav className="mb-9 flex flex-wrap gap-2.5">
          {SECCIONES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-hairline px-[18px] py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition hover:border-accent hover:text-ink"
            >
              {s.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </section>
  );
}
