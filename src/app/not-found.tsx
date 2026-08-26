import Link from "next/link";
import { NAV } from "@/lib/content/site";

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center border-b border-rule py-[clamp(56px,7vw,110px)] text-center">
      <div className="max-w-[640px] px-[clamp(20px,5vw,56px)]">
        <div className="font-mono text-xs tracking-[0.2em] text-accent">ERROR 404</div>
        <h1 className="m-0 mb-3.5 mt-5 font-display text-[clamp(28px,4vw,46px)] font-normal leading-[1.15]">
          La página solicitada no está disponible
        </h1>
        <p className="m-0 mb-[30px] leading-[1.8] text-ink-soft">
          El documento cambió de dirección o fue retirado. Continúe por alguna de estas secciones:
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="border border-rule px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-250 hover:border-accent hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
