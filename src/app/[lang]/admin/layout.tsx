import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { routing, type RutaEstatica } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/dal";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { fijarIdioma } from "@/i18n/servidor";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

const SECCIONES: { href: RutaEstatica; label: string }[] = [
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

export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  // El panel es interno y sólo existe en español. Sin esto, `/en/admin`
  // renderizaría la interfaz en español bajo una URL que promete inglés.
  const { lang } = await params;
  if (lang !== routing.defaultLocale) notFound();

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
