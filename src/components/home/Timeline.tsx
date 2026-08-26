import { GALLERY, TIMELINE } from "@/lib/content/home";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";

export function Timeline() {
  return (
    <section
      id="trayectoria"
      className="scroll-mt-[90px] border-t border-hairline py-[clamp(70px,9vw,120px)]"
      style={{ background: "linear-gradient(180deg, var(--bg) 0%, var(--panel) 100%)" }}
    >
      <div className="shell">
        <Reveal className="eyebrow mb-4">02 — Trayectoria</Reveal>
        <Reveal
          as="h2"
          index={1}
          className="m-0 mb-[clamp(48px,6vw,80px)] max-w-[18ch] font-display text-[clamp(34px,6vw,86px)] uppercase leading-[0.9]"
        >
          Tres países, una obsesión
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
          {TIMELINE.map((t, i) => (
            <Reveal
              key={t.year}
              className={`milestone ${i % 2 ? "milestone-b" : "milestone-a"} relative pl-11`}
            >
              <span className="absolute left-[3px] top-3 block size-[13px] rounded-full border-2 border-accent bg-bg" />
              <div>
                <div className="font-display text-[clamp(30px,3.4vw,52px)] leading-none text-muted">
                  {t.year}
                </div>
                <h3 className="m-0 mt-3 text-[clamp(19px,2vw,26px)] font-bold tracking-[-0.01em]">
                  {t.title}
                </h3>
                <p className="m-0 mt-3 max-w-[58ch] leading-[1.7] text-pretty text-muted">
                  {t.body}
                </p>
              </div>
              <figure className="m-0">
                <PhotoSlot
                  label={t.photo}
                  ratio="16/10"
                  className="rounded-[18px] p-4 transition duration-500 hover:-translate-y-1 hover:border-accent"
                >
                  <span className="absolute bottom-3 right-3.5 font-display text-[30px] leading-none text-white/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </PhotoSlot>
                <figcaption className="mt-2.5 font-mono text-[10px] tracking-[0.04em] text-muted">
                  {t.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-[clamp(60px,7vw,100px)]">
          <Reveal className="mb-6 font-mono text-[10px] uppercase tracking-[0.34em] text-muted">
            Archivo visual
          </Reveal>
          <div className="grid grid-cols-2 gap-3.5 nav:grid-cols-4">
            {GALLERY.map((g, i) => (
              <Reveal
                key={g.label}
                index={i}
                className="transition duration-[400ms] hover:-translate-y-[5px]"
                style={{ gridColumn: g.span }}
              >
                <PhotoSlot label={g.label} ratio={g.ratio} className="h-full rounded-[18px]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5"
                    style={{ background: "linear-gradient(180deg,transparent,oklch(0 0 0 / 0.7))" }}
                  />
                  <span className="absolute bottom-3.5 left-3.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink">
                    {g.tag}
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
