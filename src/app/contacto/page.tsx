import type { Metadata } from "next";

import { CHANNELS } from "@/lib/content/site";
import { ContactForm } from "@/components/contacto/ContactForm";

export const metadata: Metadata = {
  title: "Correspondencia",
  description:
    "Seleccione el tema para que la solicitud llegue directamente al área responsable.",
};

export default function ContactoPage() {
  return (
    <section className="border-b border-rule pb-[clamp(56px,7vw,96px)] pt-[clamp(46px,6vw,80px)]">
      <div className="shell">
        <p className="eyebrow m-0 mb-[18px]">Contacto</p>
        <h1 className="m-0 mb-4 font-display text-[clamp(32px,4.4vw,56px)] font-normal leading-[1.1]">
          Correspondencia
        </h1>
        <p className="m-0 mb-[clamp(34px,5vw,54px)] max-w-[50ch] text-[17px] leading-[1.8] text-ink-soft">
          Seleccione el tema para que la solicitud llegue directamente al área responsable.
        </p>

        <div className="grid items-start gap-[clamp(28px,4vw,56px)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {/* El directorio va primero en la lectura: el canvas lo coloca a la izquierda. */}
          <div className="order-first">
            <h2 className="m-0 mb-5 font-display text-2xl font-normal">Directorio</h2>
            <div className="border-t border-ink">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.k}
                  className="flex items-baseline justify-between gap-3.5 border-b border-rule-soft py-4"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    {ch.k}
                  </span>
                  <span className="text-right font-mono text-xs text-ink-soft">{ch.v}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-5 font-mono text-[11px] leading-[1.9] text-ink-faint">
              Prensa: 24 horas hábiles · Programa: 15 días hábiles · Pedidos: 48 horas
            </p>
          </div>

          <div className="border border-rule bg-surface p-[clamp(24px,3.5vw,38px)]">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
