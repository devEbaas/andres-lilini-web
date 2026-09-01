import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/auth/redirect";
import { fijarIdioma } from "@/i18n/servidor";

type Props = { searchParams: Promise<{ next?: string }> };

export const metadata: Metadata = {
  title: "Acceso",
  description: "Acceso al panel de administración.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const { next } = await searchParams;

  // Se valida aquí y no sólo al redirigir: lo que llegue por la URL no se
  // vuelve a tocar sin pasar por `safeNext`.
  const destino = safeNext(next, "");

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[440px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          Acceso
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,64px)] uppercase leading-[0.9]">
          Entrar
        </h1>
        <p className="m-0 mb-9 leading-[1.7] text-muted">
          Área privada. Si no tienes cuenta, no hay nada que ver aquí.
        </p>

        <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)] shadow-soft">
          <LoginForm next={destino || undefined} />
        </div>
      </div>
    </section>
  );
}
