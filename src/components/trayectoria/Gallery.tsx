import { GALLERY } from "@/lib/content/trayectoria";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Reveal } from "@/components/ui/Reveal";

export function Gallery() {
  return (
    <div className="grid grid-cols-2 gap-3.5 nav:grid-cols-4">
      {GALLERY.map((g, i) => (
        <Reveal
          key={g.ref}
          as="figure"
          index={i}
          className="m-0"
          style={{ gridColumn: g.span }}
        >
          <PhotoSlot label={g.label} ratio={g.ratio} tone="surface-2" className="p-3.5" />
          <figcaption className="mt-2 flex justify-between gap-2.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
            <span>{g.tag}</span>
            <span className="font-mono">{g.ref}</span>
          </figcaption>
        </Reveal>
      ))}
    </div>
  );
}
