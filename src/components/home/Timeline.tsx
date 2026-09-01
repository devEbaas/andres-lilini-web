import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { GALLERY, TIMELINE } from "@/lib/content/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";

export async function Timeline() {
  const t = await getTranslations("home.timeline");
  const tg = await getTranslations("home.gallery");

  return (
    <section
      id="trayectoria"
      className="scroll-mt-[90px] border-t border-hairline py-[clamp(70px,9vw,120px)]"
      style={{ background: "linear-gradient(180deg, var(--bg) 0%, var(--panel) 100%)" }}
    >
      <div className="shell">
        <Reveal className="eyebrow mb-4">{t("eyebrow")}</Reveal>
        <Reveal
          as="h2"
          index={1}
          className="m-0 mb-[clamp(48px,6vw,80px)] max-w-[18ch] font-display text-[clamp(34px,6vw,86px)] uppercase leading-[0.9]"
        >
          {t("titulo")}
        </Reveal>

        <div className="relative flex flex-col gap-[clamp(40px,5vw,72px)]">
          <span
            aria-hidden
            className="absolute bottom-0 left-[9px] top-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--border-strong) 8%, var(--border-strong) 92%, transparent)",
            }}
          />
          {TIMELINE.map((hito, i) => (
            <Reveal
              key={hito.year}
              className={`milestone ${i % 2 ? "milestone-b" : "milestone-a"} relative pl-11`}
            >
              <span className="absolute left-[3px] top-3 block size-[13px] rounded-full border-2 border-accent bg-bg" />
              <div>
                <div className="font-display text-[clamp(30px,3.4vw,52px)] leading-none text-muted">
                  {hito.year}
                </div>
                <h3 className="m-0 mt-3 text-[clamp(19px,2vw,26px)] font-bold tracking-[-0.01em]">
                  {t(`hitos.${hito.year}.title`)}
                </h3>
                <p className="m-0 mt-3 max-w-[58ch] leading-[1.7] text-pretty text-muted">
                  {t(`hitos.${hito.year}.body`)}
                </p>
              </div>
              <figure className="m-0">
                {hito.image ? (
                  // Marco 16:10 del canvas; el original es 3:2, así que recorta a los lados.
                  <div className="relative aspect-16/10 overflow-hidden rounded-[18px] border border-hairline transition duration-500 hover:-translate-y-1 hover:border-accent">
                    <Image
                      src={hito.image}
                      alt={t(`hitos.${hito.year}.caption`)}
                      fill
                      sizes="(max-width: 940px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
                      style={{ background: "linear-gradient(180deg,transparent,oklch(0 0 0 / 0.6))" }}
                    />
                    <span className="absolute bottom-3 right-3.5 font-display text-[30px] leading-none text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                ) : (
                  <PhotoSlot
                    label={t(`hitos.${hito.year}.photo`)}
                    ratio="16/10"
                    className="rounded-[18px] p-4 transition duration-500 hover:-translate-y-1 hover:border-accent"
                  >
                    <span className="absolute bottom-3 right-3.5 font-display text-[30px] leading-none text-white/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </PhotoSlot>
                )}
                <figcaption className="mt-2.5 font-mono text-[10px] tracking-[0.04em] text-muted">
                  {t(`hitos.${hito.year}.caption`)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-[clamp(60px,7vw,100px)]">
          <Reveal className="mb-6 font-mono text-[10px] uppercase tracking-[0.34em] text-muted">
            {t("archivo")}
          </Reveal>
          <div className="grid grid-cols-2 gap-3.5 nav:grid-cols-4">
            {GALLERY.map((g, i) => (
              <Reveal
                key={g.key}
                index={i}
                className="transition duration-[400ms] hover:-translate-y-[5px]"
                style={{ gridColumn: g.span }}
              >
                <PhotoSlot label={tg(`${g.key}.label`)} ratio={g.ratio} className="h-full rounded-[18px]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
                    style={{ background: "linear-gradient(180deg,transparent,oklch(0 0 0 / 0.7))" }}
                  />
                  <span className="absolute bottom-3.5 left-3.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink">
                    {tg(`${g.key}.tag`)}
                  </span>
                </PhotoSlot>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
