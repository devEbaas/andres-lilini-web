import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { RegistroForm } from "@/components/auth/RegistroForm";
import { getClaims } from "@/lib/auth/dal";
import { fijarIdioma, rutaLocal } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe("/registro", "registro");
}

export default async function RegistroPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const t = await getTranslations("auth");

  if (await getClaims()) redirect(await rutaLocal("/cuenta"));

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[500px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          {t("registroEyebrow")}
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,64px)] uppercase leading-[0.9]">
          {t("registroTitulo")}
        </h1>
        <p className="m-0 mb-9 leading-[1.7] text-muted">
          {t("registroLead")}
        </p>

        <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)] shadow-soft">
          <RegistroForm />
        </div>

        <p className="m-0 mt-6 text-center text-sm text-muted">
          {t("yaTienesCuenta")}{" "}
          <Link href="/login" className="text-accent underline underline-offset-4">
            {t("entrar")}
          </Link>
        </p>
      </div>
    </section>
  );
}
