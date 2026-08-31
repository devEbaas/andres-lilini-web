/**
 * Carrito de compra, en línea.
 *
 * SVG incrustado y no una librería de iconos: es el único icono del sitio,
 * y una dependencia entera para una figura no se paga sola.
 *
 * Va en `currentColor` y sin relleno para que herede el color del botón y
 * sus estados de hover, igual que el resto del cromo. `aria-hidden` porque
 * el botón que lo contiene ya lleva su propia etiqueta.
 */
export function CartIcon({ className = "size-[19px]" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Asa y cesta en un solo trazo. */}
      <path d="M2.5 3h2.2l2.4 11.2a1.8 1.8 0 0 0 1.76 1.42h8.3a1.8 1.8 0 0 0 1.76-1.4L20.5 7.5H6" />
      {/* Ruedas. */}
      <circle cx="9.5" cy="20" r="1.25" />
      <circle cx="17.5" cy="20" r="1.25" />
    </svg>
  );
}
