import Link from "next/link";

import { ACCESOS } from "@/lib/content/home";
import { Reveal } from "@/components/ui/Reveal";
import { h2Display } from "@/components/ui/styles";

export function Accesos() {
  return (
    <section className="border-b border-rule py-[clamp(50px,6vw,88px)]">
      <div className="shell">
        <Reveal className="eyebrow mb-3.5">Vías de trabajo</Reveal>
        <Reveal
          as="h2"
          index={1}
          className={`${h2Display} mb-[clamp(26px,3.4vw,44px)] max-w-[26ch] text-[clamp(24px,3.2vw,40px)] leading-[1.2]`}
        >
          Tres puertas de entrada al proyecto
        </Reveal>

        <div className="grid gap-[clamp(20px,3vw,40px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {ACCESOS.map((a, i) => (
            <Reveal key={a.n} index={i}>
              <Link href={a.href} className="group block border-t border-ink pt-5">
                <span className="font-mono text-[11px] text-accent">{a.n}</span>
                <h3 className="m-0 my-2.5 font-display text-[23px] font-medium">{a.title}</h3>
                <p className="m-0 mb-3.5 text-[15px] leading-[1.75] text-ink-soft">{a.body}</p>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {a.cta}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
