import { METRICS, METRICS_CUTOFF } from "@/lib/content/home";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

export function Metrics() {
  return (
    <section className="border-b border-rule bg-surface">
      <div className="shell py-[clamp(40px,5vw,62px)]">
        <div className="mb-[34px] flex flex-wrap items-baseline justify-between gap-6">
          <Reveal
            as="h2"
            className="m-0 font-display text-[clamp(22px,2.4vw,30px)] font-normal"
          >
            Cifras de gestión
          </Reveal>
          <Reveal as="span" index={1} className="font-mono text-[11px] text-ink-faint">
            {METRICS_CUTOFF}
          </Reveal>
        </div>

        {/* El filete de separación es el propio fondo del grid: 1px de gap sobre `rule`. */}
        <div className="grid gap-px bg-rule nav:grid-cols-5">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} index={i} className="bg-surface px-[22px] pb-6 pt-[26px]">
              <div className="font-display text-[clamp(40px,4.4vw,60px)] font-light leading-none tracking-[-0.02em]">
                <Counter to={m.v} suffix={m.s} />
              </div>
              <div className="mt-3.5 max-w-[22ch] text-xs font-medium leading-[1.6] tracking-[0.05em] text-ink-soft">
                {m.label}
              </div>
            </Reveal>
          ))}
        </div>

        <p className="m-0 mt-5 font-mono text-[11px] leading-[1.8] text-ink-faint">
          Cifras de gestión propia y registros públicos de la Liga MX. Documentación disponible para
          prensa a solicitud.
        </p>
      </div>
    </section>
  );
}
