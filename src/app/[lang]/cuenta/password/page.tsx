import { getTranslations } from "next-intl/server";

import { PasswordForm } from "@/components/auth/PasswordForm";
import { fijarIdioma } from "@/i18n/servidor";

export default async function PasswordPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("account");

  return (
    <div>
      <h2 className="m-0 mb-3.5 font-display text-2xl uppercase">{t("passwordTitulo")}</h2>
      <p className="m-0 mb-7 max-w-[52ch] leading-[1.7] text-muted">
        {t("passwordLead")}
      </p>

      <PasswordForm />
    </div>
  );
}
