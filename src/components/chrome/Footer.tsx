import Image from "next/image";
import Link from "next/link";
import { FOOTER_COLS, SOCIAL } from "@/lib/content/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-panel pb-[30px] pt-[clamp(50px,7vw,90px)]">
      <div className="shell">
        <div className="grid gap-[clamp(30px,4vw,50px)] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] nav:[grid-template-columns:1.6fr_repeat(4,1fr)]">
          {/* A partir de 640px la rejilla tiene dos columnas o más; por debajo
              sólo hay una y `col-span-2` abría una columna implícita que
              desbordaba la pantalla. */}
          <div className="min-w-0 sm:col-span-2 nav:col-span-1">
            {/* Aquí va la marca completa: ya trae el nombre y el descriptor,
                así que no se repiten al lado. */}
            <Image
              src="/images/logo.png"
              alt="Andrés Lillini · formador de futbolistas"
              width={640}
              height={719}
              className="h-[clamp(120px,14vw,152px)] w-auto"
            />
            <p className="m-0 my-[18px] mb-[22px] max-w-[34ch] leading-[1.7] text-muted">
              Formación, detección y desarrollo de futbolistas. México · Argentina.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map((s) => (
                <span
                  key={s}
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-hairline text-[9px] font-extrabold tracking-[0.08em] text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div className="label-caps mb-4">{col.title}</div>
              <div className="flex flex-col gap-[11px]">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-ink hover:text-accent">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] grid items-center gap-[26px] border-t border-hairline pt-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <div>
            <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em]">
              Boletín de cantera
            </div>
            <p className="m-0 text-sm leading-[1.6] text-muted">
              Convocatorias, informes y fechas de visorías. Un correo al mes.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-[34px] flex flex-wrap justify-between gap-x-[22px] gap-y-2 font-mono text-[11px] text-muted">
          <span>© 2026 Andrés Lillini. Todos los derechos reservados.</span>
          <span className="flex gap-5">
            <Link href="/contenido/privacidad" className="text-muted hover:text-accent">
              Privacidad
            </Link>
            <Link href="/contenido/terminos" className="text-muted hover:text-accent">
              Términos
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
