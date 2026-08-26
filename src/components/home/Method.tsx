import Link from "next/link";

import { PILLARS } from "@/lib/content/home";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary, h2Display } from "@/components/ui/styles";

export function Method() {
  return (
    <section className="border-b border-rule py-[clamp(50px,6vw,90px)]">
      <div className="shell grid gap-[clamp(30px,5vw,64px)] nav:[grid-template-columns:0.9fr_1.1fr]">
        <div>
          <Reveal className="eyebrow mb-3.5">Método de trabajo</Reveal>
          <Reveal as="h2" index={1} className={`${h2Display} max-w-[22ch]`}>
            Se evalúa al jugador; se forma a la persona
          </Reveal>
          <Reveal
            as="p"
            index={2}
            className="m-0 mb-[30px] mt-5 max-w-[52ch] text-[17px] leading-[1.8] text-pretty text-ink-soft"
          >
            Quince atributos, tres fases y un principio de trabajo: el talento sin contexto se
            pierde. Técnica, cabeza y entorno se miden con el mismo rigor.
          </Reveal>
          <Reveal index={3}>
            <Link href="/programa" className={btnPrimary}>
              Conocer el programa
            </Link>
          </Reveal>
        </div>

        <div className="flex flex-col">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.n}
              index={i}
              className="grid gap-4 border-t border-rule py-6 [grid-template-columns:56px_1fr]"
            >
              <span className="pt-1 font-mono text-xs text-accent">{p.n}</span>
              <div>
                <h3 className="m-0 mb-2.5 font-display text-[21px] font-medium">{p.title}</h3>
                <p className="m-0 text-base leading-[1.75] text-ink-soft">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
