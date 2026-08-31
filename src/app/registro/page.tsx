import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegistroForm } from "@/components/auth/RegistroForm";
import { getClaims } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta para seguir tus pedidos.",
};

export default async function RegistroPage() {
  if (await getClaims()) redirect("/cuenta");

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[500px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          Cuenta
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,64px)] uppercase leading-[0.9]">
          Crear cuenta
        </h1>
        <p className="m-0 mb-9 leading-[1.7] text-muted">
          Para seguir tus pedidos y no volver a escribir tu dirección. Comprar no la
          necesita.
        </p>

        <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)] shadow-soft">
          <RegistroForm />
        </div>

        <p className="m-0 mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
