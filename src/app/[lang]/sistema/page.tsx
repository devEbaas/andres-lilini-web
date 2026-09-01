import type { Metadata } from "next";

import { DESIGN_TOKENS, OG_CARDS } from "@/lib/content/sistema";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Spinner } from "@/components/ui/Spinner";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fijarIdioma } from "@/i18n/servidor";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  description: "Tokens, tipografía, componentes y tarjetas Open Graph del sitio.",
  // Referencia interna: sigue accesible por URL para quien construye el
  // sitio, pero fuera del menú y fuera de los buscadores. Un resultado
  // titulado «Sistema de diseño» bajo la marca no le sirve a nadie.
  robots: { index: false, follow: false },
};

const H2 = "m-0 mb-5 font-display text-[26px] uppercase";
const CARD = "rounded-[20px] border border-hairline bg-panel p-6";
const CARD_LABEL = "mb-[18px] font-mono text-[10px] tracking-[0.2em] text-muted";
const PILL = "rounded-full px-[22px] py-[13px] text-[11px] font-extrabold uppercase tracking-[0.16em]";

export default async function SistemaPage({ params }: PageProps<"/[lang]/sistema">) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  // Documentación interna del sistema de diseño: no se traduce.
  const { lang } = await params;
  if (lang !== routing.defaultLocale) notFound();

  return (
    <section className="py-[clamp(60px,8vw,100px)]">
      <div className="shell">
        <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
          Sistema de diseño
        </p>
        <h1 className="m-0 mb-[clamp(40px,5vw,64px)] font-display text-[clamp(38px,7vw,104px)] uppercase leading-[0.88]">
          Tokens y componentes
        </h1>

        <h2 className={H2}>Color · tokens intercambiables</h2>
        <div className="mb-[clamp(46px,6vw,72px)] grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {DESIGN_TOKENS.map(([name, css, use]) => (
            <div
              key={name}
              className="overflow-hidden rounded-2xl border border-hairline bg-panel"
            >
              <div className="h-[74px]" style={{ background: css }} />
              <div className="px-3.5 py-3">
                <div className="font-mono text-[11px]">{name}</div>
                <div className="mt-1 font-mono text-[9px] text-muted">{use}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className={H2}>Tipografía · 3 niveles + mono</h2>
        <div className="mb-[clamp(46px,6vw,72px)] grid gap-[26px] rounded-[22px] border border-hairline bg-panel p-[clamp(22px,3vw,36px)]">
          <div>
            <div className={CARD_LABEL}>DISPLAY · ANTON · CLAMP 40–220</div>
            <div className="font-display text-[clamp(38px,7vw,88px)] uppercase leading-[0.86]">
              Cantera primero
            </div>
          </div>
          <div>
            <div className={CARD_LABEL}>LABEL · ARCHIVO 800 · TRACKING 0.18EM</div>
            <div className="text-[13px] font-extrabold uppercase tracking-[0.18em]">
              Programa de atletas
            </div>
          </div>
          <div>
            <div className={CARD_LABEL}>CUERPO · ARCHIVO 400 · LH 1.7</div>
            <div className="max-w-[60ch] text-base leading-[1.7] text-muted">
              Evaluamos quince atributos con la misma vara para cada jugador que se postula, sin
              importar de qué liga venga.
            </div>
          </div>
          <div>
            <div className={CARD_LABEL}>MONO · IBM PLEX MONO</div>
            <div className="font-mono text-xs text-muted">
              FOLIO · AL-2026-0418 · corte agosto 2026
            </div>
          </div>
        </div>

        <h2 className={H2}>Componentes y estados</h2>
        <div className="mb-[clamp(46px,6vw,72px)] grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          <div className={CARD}>
            <div className={CARD_LABEL}>BOTONES</div>
            <div className="flex flex-wrap gap-2.5">
              <span className={`${PILL} bg-gradient-accent text-on-accent`}>Primario</span>
              <span className={`${PILL} border border-hairline-strong`}>Secundario</span>
              <span className={`${PILL} text-muted`}>Fantasma</span>
              <span className={`${PILL} border border-danger text-danger-text`}>Destructivo</span>
              <span className={`${PILL} bg-panel-2 text-muted opacity-50`}>Deshabilitado</span>
              <span className={`${PILL} flex items-center gap-2.5 bg-gradient-accent text-on-accent`}>
                <Spinner />
                Cargando
              </span>
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_LABEL}>CAMPOS</div>
            <div className="grid gap-3">
              <input placeholder="Normal" className="field !min-h-[46px] !bg-bg" readOnly />
              <input
                defaultValue="Con foco"
                className="field !min-h-[46px] !border-accent !bg-panel-2"
                readOnly
              />
              <input
                defaultValue="Con error"
                aria-invalid="true"
                className="field !min-h-[46px] !bg-bg"
                readOnly
              />
              <input
                defaultValue="Deshabilitado"
                disabled
                className="field !min-h-[46px] !bg-panel-2 opacity-45"
              />
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_LABEL}>CHIPS Y BADGES</div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-accent bg-panel-2 px-[15px] py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em]">
                Activo
              </span>
              <span className="rounded-full border border-hairline px-[15px] py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                Inactivo
              </span>
              <span className="rounded-full bg-gradient-accent px-[11px] py-1.5 text-[10px] font-extrabold text-on-accent">
                12
              </span>
              <span className="rounded-full border border-hairline-strong px-3 py-[7px] text-[10px] font-extrabold uppercase tracking-[0.14em]">
                Agotado
              </span>
            </div>
          </div>

          <div className={CARD}>
            <div className={CARD_LABEL}>MARCADOR DE IMAGEN</div>
            <PhotoSlot label="Foto 16:9 · sesión de campo" ratio="16/9" className="rounded-2xl" />
          </div>
        </div>

        <h2 className={H2}>Tarjetas Open Graph · 1200×630</h2>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {OG_CARDS.map(([title, line, file]) => (
            <div key={file} className="overflow-hidden rounded-[18px] border border-hairline">
              <div
                className="relative flex flex-col justify-between overflow-hidden bg-panel px-[8%] py-[7%]"
                style={{ aspectRatio: "1200/630" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(70% 80% at 85% 10%, oklch(0.79 0.175 138 / 0.22), transparent 65%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 40px)",
                  }}
                />
                <div className="relative flex items-center gap-2">
                  <span className="grid size-[22px] place-items-center rounded-[7px] bg-gradient-accent font-display text-xs text-on-accent">
                    AL
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-muted">
                    andreslillini.com
                  </span>
                </div>
                <div className="relative">
                  <div className="font-display text-[clamp(20px,3.4vw,34px)] uppercase leading-[0.92]">
                    {title}
                  </div>
                  <div className="mt-2.5 font-mono text-[8px] uppercase tracking-[0.2em] text-accent">
                    {line}
                  </div>
                </div>
              </div>
              <div className="bg-panel px-4 py-3 font-mono text-[10px] text-muted">{file}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
