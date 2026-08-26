import type { CSSProperties, ReactNode } from "react";

type Props = {
  label: string;
  /** Ej. "16/10", "4/3", "1/1" */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Marcador rayado que ocupa el lugar de las fotografías todavía no entregadas.
 * Sustituir por <Image /> cuando llegue el material definitivo.
 */
export function PhotoSlot({ label, ratio = "16/10", className = "", style, children }: Props) {
  return (
    <div
      className={`photo-slot relative grid place-items-center overflow-hidden border border-hairline ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <span className="px-4 text-center font-mono text-[10px] uppercase leading-[1.7] tracking-[0.16em] text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
