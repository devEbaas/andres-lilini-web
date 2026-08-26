import type { CSSProperties, ReactNode } from "react";

type Props = {
  label: string;
  /** Ej. "16/10", "4/5", "1/1", "21/9" */
  ratio?: string;
  /** `surface` para piezas principales, `surface-2` para el archivo y las miniaturas. */
  tone?: "surface" | "surface-2";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Marcador que ocupa el lugar de las fotografías todavía no entregadas.
 * Sustituir por <Image /> cuando llegue el material definitivo.
 */
export function PhotoSlot({
  label,
  ratio = "16/10",
  tone = "surface",
  className = "",
  style,
  children,
}: Props) {
  return (
    <div
      className={`photo-slot relative grid place-items-center p-4 text-center ${
        tone === "surface-2" ? "photo-slot-alt" : ""
      } ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <span className="font-mono text-[10px] uppercase leading-[1.9] tracking-[0.1em] text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}
