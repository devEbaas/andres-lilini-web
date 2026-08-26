import type { Metadata } from "next";

import { CHANNELS } from "@/lib/content/site";
import { ContactForm } from "@/components/contacto/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Elige el tema correcto y llega directo a quien lo resuelve.",
};

export default function ContactoPage() {
  return (
    <section className="pb-[clamp(70px,9vw,120px)] pt-[clamp(60px,8vw,110px)]">
      <div className="shell">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          Contacto
        </p>
        <h1 className="m-0 mb-[18px] font-display text-[clamp(40px,8vw,116px)] uppercase leading-[0.88]">
          Escríbenos
        </h1>
        <p className="m-0 mb-[clamp(36px,5vw,58px)] max-w-[50ch] leading-[1.7] text-muted">
          Elige el tema correcto y llega directo a quien lo resuelve.
        </p>

        <div className="grid items-start gap-[clamp(28px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div className="rounded-[26px] border border-hairline bg-panel p-[clamp(24px,3.5vw,40px)] shadow-soft">
            <ContactForm />
          </div>

          <div>
            <h2 className="m-0 mb-[18px] font-display text-2xl uppercase">Otras vías</h2>
            <div className="grid gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.k}
                  className="flex items-center justify-between gap-3.5 bg-panel px-5 py-[18px]"
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                    {ch.k}
                  </span>
                  <span className="text-right font-mono text-xs text-muted">{ch.v}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-5 font-mono text-[11px] leading-[1.8] text-muted">
              Prensa: 24 h hábiles · Programa: 15 días hábiles · Pedidos: 48 h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
