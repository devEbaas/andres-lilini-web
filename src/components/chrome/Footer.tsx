import Link from "next/link";
import { EMAILS, FOOTER_COLS } from "@/lib/content/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-surface pb-7 pt-[clamp(46px,6vw,80px)]">
      <div className="shell">
        <div className="grid gap-[clamp(28px,4vw,48px)] [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <div className="min-w-0 sm:col-span-2">
            <div className="font-display text-[26px] font-medium">Andrés Lillini</div>
            <p className="m-0 mb-5 mt-3.5 max-w-[34ch] text-[15px] leading-[1.8] text-ink-soft">
              Formación, detección y desarrollo de futbolistas. Ciudad de México · Buenos Aires.
            </p>
            <div className="flex flex-col gap-2 font-mono text-xs text-ink-soft">
              {EMAILS.map((e) => (
                <a key={e} href={`mailto:${e}`} className="text-ink-soft">
                  {e}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div className="mb-3.5 border-b border-rule pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                {col.title}
              </div>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-ink-soft">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(38px,5vw,58px)] grid items-start gap-6 border-t border-rule pt-7 [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
          <div>
            <div className="mb-2 font-display text-xl font-medium">Boletín de cantera</div>
            <p className="m-0 text-sm leading-[1.7] text-ink-soft">
              Convocatorias, informes y fechas de visorías. Un correo al mes.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-[30px] flex flex-wrap justify-between gap-x-[22px] gap-y-2 font-mono text-[11px] text-ink-faint">
          <span>© 2026 Andrés Lillini. Todos los derechos reservados.</span>
          <span className="flex gap-5">
            <Link href="/contenido/privacidad" className="text-ink-faint">
              Aviso de privacidad
            </Link>
            <Link href="/contenido/terminos" className="text-ink-faint">
              Términos
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
