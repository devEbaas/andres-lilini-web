import { getTranslations } from "next-intl/server";

import { METRICS } from "@/lib/content/home";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

export async function Metrics() {
  const t = await getTranslations("home.metrics");

  return (
    <section className="border-t border-hairline py-[clamp(70px,9vw,120px)]">
      <div className="shell">
        <Reveal className="eyebrow mb-4">{t("eyebrow")}</Reveal>
        <Reveal
          as="h2"
          index={1}
          className="m-0 mb-[clamp(40px,5vw,64px)] max-w-[20ch] font-display text-[clamp(34px,6vw,86px)] uppercase leading-[0.9]"
        >
          {t("titulo")}
        </Reveal>

        <div className="grid border-l border-t border-hairline [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {METRICS.map((m, i) => (
            <Reveal
              key={m.key}
              index={i}
              className="border-b border-r border-hairline px-[clamp(18px,2vw,28px)] py-[clamp(24px,3vw,38px)] transition-colors duration-300 hover:bg-panel"
            >
              <div className="text-gradient font-display text-[clamp(44px,5.5vw,78px)] leading-[0.9]">
                <Counter to={m.v} suffix={m.s} />
              </div>
              <div className="mt-3.5 text-[11px] font-extrabold uppercase leading-[1.5] tracking-[0.18em] text-muted">
                {t(`labels.${m.key}`)}
              </div>
            </Reveal>
          ))}
        </div>

        <p className="m-0 mt-5 font-mono text-[11px] text-muted">
          {t("nota")}
        </p>
      </div>
    </section>
  );
}
