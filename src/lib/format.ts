export function money(n: number): string {
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2 }) + " MXN";
}

export function folio(prefix: string, n: number): string {
  return `${prefix}-2026-${String(n).padStart(4, "0")}`;
}

export function bytesToMb(bytes: number): string {
  return (bytes / 1048576).toFixed(1) + " MB";
}
