import type { Metadata } from "next";

import { getProducts } from "@/lib/data/products";
import { CatalogGrid } from "@/components/tienda/CatalogGrid";
import { fijarIdioma } from "@/i18n/servidor";

// Next exige un literal aquí: 5 minutos de caché para el catálogo.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tienda oficial",
  description:
    "Material de trabajo: metodología, indumentaria y equipamiento. Envío a todo México en 3 a 5 días hábiles.",
};

export default async function TiendaPage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const products = await getProducts();

  return (
    <>
      <section className="pb-[clamp(30px,4vw,50px)] pt-[clamp(60px,8vw,110px)]">
        <div className="shell">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            Tienda oficial
          </p>
          <h1 className="m-0 mb-[22px] font-display text-[clamp(40px,8vw,120px)] uppercase leading-[0.88]">
            Material de trabajo
          </h1>
          <p className="m-0 max-w-[52ch] leading-[1.7] text-muted">
            Envío a todo México en 3 a 5 días hábiles. Stock limitado por tirada; lo agotado no se
            reimprime.
          </p>
        </div>
      </section>

      <section className="pb-[clamp(60px,8vw,110px)]">
        <div className="shell">
          <CatalogGrid products={products} />
        </div>
      </section>
    </>
  );
}
