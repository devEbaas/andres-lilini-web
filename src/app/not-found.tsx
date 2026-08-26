import Link from "next/link";
import { NAV } from "@/lib/content/site";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center py-[clamp(60px,8vw,120px)] text-center">
      <div className="max-w-[700px] px-[clamp(18px,4vw,44px)]">
        <div className="text-gradient font-display text-[clamp(80px,20vw,240px)] leading-[0.8]">
          404
        </div>
        <h1 className="m-0 my-[26px] mb-3.5 font-display text-[clamp(24px,4vw,44px)] uppercase">
          Balón fuera
        </h1>
        <p className="m-0 mb-8 leading-[1.7] text-muted">
          Esta página no existe o cambió de lugar. Prueba por aquí:
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full border border-hairline px-[22px] py-3.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink hover:border-accent hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
