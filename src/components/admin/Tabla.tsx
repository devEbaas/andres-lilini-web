import type { ReactNode } from "react";

/** Envoltorio con scroll propio: una tabla ancha no debe desbordar la página. */
export function Tabla({ cols, children }: { cols: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-hairline bg-panel">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap border-b border-hairline px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Celda({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <td
      className={`border-b border-hairline/60 px-4 py-3.5 align-top text-sm ${
        mono ? "font-mono text-xs text-muted" : ""
      }`}
    >
      {children}
    </td>
  );
}

export function Vacio({ texto }: { texto: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-hairline px-6 py-14 text-center text-sm text-muted">
      {texto}
    </div>
  );
}

/** Formato corto y estable para las fechas del panel. */
export function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
