export type CartLine = { id: string; name: string; price: number; qty: number };

const STORAGE_KEY = "al.cart.v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : EMPTY;
  } catch {
    // Modo privado o almacenamiento bloqueado: la bolsa vive sólo en memoria.
    return EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Ídem: seguimos en memoria.
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  lines = read();
  loaded = true;
}

export function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Devuelve siempre la misma referencia hasta que algo cambia. */
export function getSnapshot(): CartLine[] {
  ensureLoaded();
  return lines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function commit(next: CartLine[]) {
  lines = next;
  persist();
  listeners.forEach((l) => l());
}

export function addLine(line: Omit<CartLine, "qty">, qty: number) {
  const existing = lines.find((l) => l.id === line.id);
  commit(
    existing
      ? lines.map((l) => (l.id === line.id ? { ...l, qty: l.qty + qty } : l))
      : [...lines, { ...line, qty }],
  );
}

export function setLineQty(id: string, qty: number) {
  commit(lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)));
}

export function removeLine(id: string) {
  commit(lines.filter((l) => l.id !== id));
}

export function clearLines() {
  commit([]);
}
