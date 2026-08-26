import type { Metadata } from "next";

import { DESIGN_TOKENS, OG_CARDS } from "@/lib/content/sistema";
import { PhotoSlot } from "@/components/ui/PhotoSlot";

export const metadata: Metadata = {
  title: "Normas gráficas",
  description: "Paleta, tipografía, componentes y tarjetas de enlace del sistema visual.",
};

const H2 =
  "m-0 mb-[18px] border-b border-rule pb-3 font-display text-[22px] font-medium";
const CARD_LABEL = "mb-[18px] font-mono text-[10px] tracking-[0.14em] text-ink-faint";
const BTN = "px-[22px] py-3 text-[11px] font-semibold uppercase tracking-[0.14em]";
const SAMPLE_LABEL =
  "mb-2.5 font-mono text-[10px] tracking-[0.14em] text-ink-faint";

export default function SistemaPage() {
  return (
    <section className="border-b border-rule py-[clamp(44px,5vw,76px)]">
      <div className="shell">
        <p className="eyebrow m-0 mb-[18px]">Normas gráficas</p>
        <h1 className="m-0 mb-[clamp(36px,5vw,58px)] font-display text-[clamp(30px,4.2vw,54px)] font-normal leading-[1.1]">
          Sistema visual del proyecto
        </h1>

        <h2 className={H2}>Paleta</h2>
        <div className="mb-[clamp(42px,5vw,66px)] grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {DESIGN_TOKENS.map(([name, css, use]) => (
            <div key={name} className="border border-rule">
              <div className="h-[72px] border-b border-rule" style={{ background: css }} />
              <div className="px-3.5 py-3">
                <div className="font-mono text-[11px]">{name}</div>
                <div className="mt-1 font-mono text-[9px] text-ink-faint">{use}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className={H2}>Tipografía</h2>
        <div className="mb-[clamp(42px,5vw,66px)] grid gap-7">
          <div>
            <div className={SAMPLE_LABEL}>TÍTULOS · NEWSREADER 300–500</div>
            <div className="font-display text-[clamp(30px,4.4vw,54px)] font-normal leading-[1.1]">
              Formación antes que resultado
            </div>
          </div>
          <div>
            <div className={SAMPLE_LABEL}>EPÍGRAFES · LIBRE FRANKLIN 600 · 0.22EM</div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">
              Programa de atletas
            </div>
          </div>
          <div>
            <div className={SAMPLE_LABEL}>TEXTO · LIBRE FRANKLIN 400 · INTERLÍNEA 1.8</div>
            <div className="max-w-[60ch] text-[17px] leading-[1.8] text-ink-soft">
              La rúbrica se aplica con la misma vara a cada jugador que se postula, sin importar de
              qué liga provenga ni quién lo recomiende.
            </div>
          </div>
          <div>
            <div className={SAMPLE_LABEL}>DATOS · IBM PLEX MONO</div>
            <div className="font-mono text-xs text-ink-soft">
              FOLIO AL-2026-0418 · corte agosto de 2026
            </div>
          </div>
        </div>

        <h2 className={H2}>Componentes</h2>
        <div className="mb-[clamp(42px,5vw,66px)] grid gap-px border border-rule bg-rule [grid-template-columns:repeat(auto-fill,minmax(270px,1fr))]">
          <div className="bg-surface p-6">
            <div className={CARD_LABEL}>BOTONES</div>
            <div className="flex flex-wrap gap-2.5">
              <span className={`${BTN} bg-ink text-paper`}>Primario</span>
              <span className={`${BTN} border border-rule`}>Secundario</span>
              <span className="border-b border-rule px-1 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Terciario
              </span>
              <span className={`${BTN} border border-rule text-ink-faint opacity-60`}>Inactivo</span>
            </div>
          </div>

          <div className="bg-surface p-6">
            <div className={CARD_LABEL}>CAMPOS</div>
            <div className="grid gap-3">
              <input placeholder="Estado normal" className="field !min-h-[44px]" readOnly />
              <input
                defaultValue="Con foco"
                className="field !min-h-[44px] !border-accent"
                readOnly
              />
              <input
                defaultValue="Con error"
                aria-invalid="true"
                className="field !min-h-[44px]"
                readOnly
              />
            </div>
          </div>

          <div className="bg-surface p-6">
            <div className={CARD_LABEL}>MARCADOR DE IMAGEN</div>
            <PhotoSlot label="Foto 16:9 · sesión de campo" ratio="16/9" tone="surface-2" />
          </div>
        </div>

        <h2 className={H2}>Tarjetas de enlace · 1200×630</h2>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {OG_CARDS.map(([title, line, file]) => (
            <div key={file} className="border border-rule">
              <div
                className="flex flex-col justify-between bg-surface p-[8%]"
                style={{ aspectRatio: "1200/630" }}
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-[15px] font-medium">Andrés Lillini</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-faint">
                    andreslillini.com
                  </span>
                </div>
                <div>
                  <div className="font-display text-[clamp(19px,2.8vw,28px)] font-normal leading-[1.15]">
                    {title}
                  </div>
                  <div className="mt-2.5 font-mono text-[8px] uppercase tracking-[0.14em] text-accent">
                    {line}
                  </div>
                </div>
              </div>
              <div className="border-t border-rule px-4 py-3 font-mono text-[10px] text-ink-faint">
                {file}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
