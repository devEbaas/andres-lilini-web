import type { Metadata } from "next";

import { RecuperarForm } from "@/components/auth/RecuperarForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecuperarPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,110px)]">
      <div className="w-full max-w-[440px] px-[clamp(18px,4vw,44px)]">
        <h1 className="m-0 mb-[18px] font-display text-[clamp(32px,5vw,56px)] uppercase leading-[0.9]">
          Recuperar
        </h1>
        <p className="m-0 mb-9 leading-[1.7] text-muted">
          Te mandamos un enlace para poner una contraseña nueva.
        </p>

        <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(22px,3vw,34px)] shadow-soft">
          <RecuperarForm />
        </div>
      </div>
    </section>
  );
}
