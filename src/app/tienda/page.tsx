import type { Metadata } from "next";

import { getProducts } from "@/lib/data/products";
import { CatalogGrid } from "@/components/tienda/CatalogGrid";

// Next exige un literal aquí: 5 minutos de caché para el catálogo.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Publicaciones y equipamiento",
  description:
    "Material de trabajo: metodología, indumentaria y equipamiento. Envío nacional de tres a cinco días hábiles.",
};

export default async function TiendaPage() {
  const products = await getProducts();

  return (
    <>
      <section className="border-b border-rule pb-[clamp(30px,4vw,48px)] pt-[clamp(46px,6vw,80px)]">
        <div className="shell">
          <p className="eyebrow m-0 mb-[18px]">Material de trabajo</p>
          <h1 className="m-0 mb-5 font-display text-[clamp(32px,4.6vw,58px)] font-normal leading-[1.1]">
            Publicaciones y equipamiento
          </h1>
          <p className="m-0 max-w-[54ch] text-[17px] leading-[1.8] text-ink-soft">
            Envío nacional de tres a cinco días hábiles. Cada tirada es limitada; el material
            agotado no se reimprime.
          </p>
        </div>
      </section>

      <section className="border-b border-rule pb-[clamp(56px,7vw,96px)] pt-[clamp(28px,4vw,44px)]">
        <div className="shell">
          <CatalogGrid products={products} />
        </div>
      </section>
    </>
  );
}
