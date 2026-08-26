/** Clases compartidas: el equivalente Tailwind de los estilos del canvas formal. */

/** Bloque sólido de tinta; vira al acento al pasar el cursor. */
export const btnPrimary =
  "inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2.5 border-0 bg-ink px-[26px] py-[15px] text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-250 hover:bg-accent hover:text-paper disabled:pointer-events-none disabled:opacity-60";

/** Filete de 1px sobre papel. */
export const btnSecondary =
  "inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2.5 border border-rule bg-transparent px-[26px] py-[15px] text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-250 hover:border-accent hover:text-accent";

/** Sólo subrayado: la jerarquía más baja. */
export const btnTertiary =
  "inline-flex min-h-[46px] cursor-pointer items-center border-b border-rule bg-transparent px-1 py-[15px] text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition-colors duration-250 hover:border-accent hover:text-accent";

/** Pestañas subrayadas: catálogo, documentos, secciones del formulario. */
export const tab =
  "min-h-[38px] shrink-0 cursor-pointer border-0 border-b bg-transparent px-0 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200";

export const tabOn = "border-ink text-ink";
export const tabOff = "border-transparent text-ink-soft hover:text-accent";

/** Título de sección en serif; el peso es siempre regular. */
export const h2Display =
  "m-0 font-display text-[clamp(26px,3.4vw,44px)] font-normal leading-[1.15]";

/** Ritmo vertical estándar entre secciones. */
export const sectionPad = "py-[clamp(50px,6vw,90px)]";

/** Casilla cuadrada de 20px usada por todos los consentimientos. */
export const checkBox =
  "grid size-5 shrink-0 place-items-center border border-ink-faint text-xs text-paper";

export const checkRow =
  "flex min-h-[46px] cursor-pointer items-start gap-3.5 border bg-paper p-4 text-left";
