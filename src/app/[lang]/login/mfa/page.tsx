import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { MfaChallengeForm } from "@/components/auth/MfaChallengeForm";
import { getClaims, mfaPendiente } from "@/lib/auth/dal";
import { safeNext } from "@/lib/auth/redirect";
import { fijarIdioma, rutaLocal } from "@/i18n/servidor";
import { metadatosDe } from "@/i18n/metadata";

type Props = { searchParams: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return metadatosDe("/login/mfa", "mfa", { indexable: false });
}

export default async function MfaPage({ searchParams }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("auth");

  const { next } = await searchParams;
  const destino = safeNext(next, "");

  // Sin sesión no hay nada que verificar; con el factor ya resuelto, tampoco.
  const claims = await getClaims();
  if (!claims) redirect(await rutaLocal("/login"));
  if (!(await mfaPendiente())) redirect(destino || (await rutaLocal("/")));

  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[440px] px-[clamp(18px,4vw,44px)]">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          {t("mfaEyebrow")}
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(34px,6vw,64px)] uppercase leading-[0.9]">
          {t("mfaTitulo")}
        </h1>
        <p className="m-0 mb-9 leading-[1.7] text-muted">
          {t("mfaLead")}
        </p>

        <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)] shadow-soft">
          <MfaChallengeForm next={destino || undefined} />
        </div>
      </div>
    </section>
  );
}
