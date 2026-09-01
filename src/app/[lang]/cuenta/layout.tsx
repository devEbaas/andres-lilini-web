import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import type { RutaEstatica } from "@/i18n/routing";

import { getTranslations } from "next-intl/server";

import { requireUser } from "@/lib/auth/dal";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { fijarIdioma } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe("/cuenta", "cuenta", { indexable: false });
}

const SECCIONES: { href: RutaEstatica; key: string }[] = [
  { href: "/cuenta", key: "perfil" },
  { href: "/cuenta/pedidos", key: "pedidos" },
  { href: "/cuenta/password", key: "password" },
  { href: "/cuenta/privacidad", key: "privacidad" },
];

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const t = await getTranslations("account");
  const user = await requireUser("/cuenta");

  return (
    <section className="py-[clamp(40px,6vw,80px)]">
      <div className="shell">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
              {t("eyebrow")}
            </p>
            <h1 className="m-0 font-display text-[clamp(28px,4vw,48px)] uppercase leading-[0.95]">
              {t("titulo")}
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
              key={s.key}
              href={s.href}
              className="rounded-full border border-hairline px-[18px] py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition hover:border-accent hover:text-ink"
            >
              {t(`secciones.${s.key}`)}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </section>
  );
}
