import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/dal";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

const SECCIONES = [
  { href: "/cuenta", label: "Perfil" },
  { href: "/cuenta/pedidos", label: "Mis pedidos" },
  { href: "/cuenta/password", label: "Contraseña" },
  { href: "/cuenta/privacidad", label: "Privacidad" },
];

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/cuenta");

  return (
    <section className="py-[clamp(40px,6vw,80px)]">
      <div className="shell">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
              Cuenta
            </p>
            <h1 className="m-0 font-display text-[clamp(28px,4vw,48px)] uppercase leading-[0.95]">
              Mi cuenta
            </h1>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="font-mono text-[11px] text-muted">{user.email}</span>
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
