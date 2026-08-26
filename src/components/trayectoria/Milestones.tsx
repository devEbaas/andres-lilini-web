import { TIMELINE } from "@/lib/content/trayectoria";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";

export function Milestones() {
  return (
    <div className="flex flex-col">
      {TIMELINE.map((t, i) => (
        <Reveal
          key={t.year}
          className="grid gap-[clamp(18px,3vw,44px)] border-t border-rule-soft py-[clamp(26px,3vw,38px)] nav:[grid-template-columns:150px_1fr_300px]"
        >
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-[11px] tracking-[0.1em] text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-display text-[clamp(24px,2.6vw,34px)] font-normal leading-none">
              {t.year}
            </span>
          </div>

          <div>
            <h3 className="m-0 font-display text-[clamp(19px,1.9vw,24px)] font-medium leading-[1.3]">
              {t.title}
            </h3>
            <p className="m-0 mt-3 max-w-[56ch] leading-[1.8] text-pretty text-ink-soft">
              {t.body}
            </p>
          </div>

          <figure className="m-0">
            <PhotoSlot
              label={t.photo}
              ratio="16/10"
              className="transition-colors duration-300 hover:border-accent"
            />
            <figcaption className="mt-2.5 font-display text-[13px] italic text-ink-faint">
              {t.caption}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
