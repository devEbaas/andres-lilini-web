import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { PILLARS } from "@/lib/content/home";
import { Reveal } from "@/components/ui/Reveal";
import { btnPrimary } from "@/components/ui/styles";

export async function Pillars() {
  const t = await getTranslations("home.pillars");

  return (
    <section className="border-t border-hairline bg-panel py-[clamp(70px,9vw,120px)]">
      <div className="shell grid items-center gap-[clamp(28px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <div>
          <Reveal className="eyebrow mb-4">{t("eyebrow")}</Reveal>
          <Reveal
            as="h2"
            index={1}
            className="m-0 font-display text-[clamp(32px,5vw,72px)] uppercase leading-[0.9]"
          >
            {t("titulo")}
          </Reveal>
          <Reveal
            as="p"
            index={2}
            className="m-0 my-6 mb-8 max-w-[52ch] leading-[1.7] text-pretty text-muted"
          >
            {t("lead")}
          </Reveal>
          <Reveal index={3}>
            <Link href="/programa" className={btnPrimary}>
              {t("cta")}
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-3.5">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.key}
              index={i}
              className="rounded-[22px] border border-hairline bg-bg p-[26px] transition duration-[350ms] hover:-translate-y-[5px] hover:border-accent"
            >
              <span className="font-mono text-[11px] tracking-[0.2em] text-accent">{p.n}</span>
              <h3 className="m-0 my-3 mb-2 text-[19px] font-bold">{t(`items.${p.key}.title`)}</h3>
              <p className="m-0 text-[15px] leading-[1.7] text-muted">{t(`items.${p.key}.body`)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
