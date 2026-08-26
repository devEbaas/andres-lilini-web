import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PRODUCT_THUMBS } from "@/lib/content/tienda";
import { getProduct, getProducts } from "@/lib/data/products";
import { money } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { ProductActions } from "@/components/tienda/ProductActions";

type Params = { params: Promise<{ id: string }> };

// Next exige un literal aquí: 5 minutos de caché para el catálogo.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.desc };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <section className="border-b border-rule pb-[clamp(56px,7vw,96px)] pt-[clamp(34px,4vw,56px)]">
      <div className="shell">
        <Link
          href="/tienda"
          className="border-b border-rule text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft"
        >
          Volver al catálogo
        </Link>

        <div className="mt-[34px] grid items-start gap-[clamp(28px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
          <div className="grid gap-3">
            <PhotoSlot label={product.shot} ratio="4/5" className="p-5" />
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_THUMBS.map((t) => (
                <PhotoSlot key={t} label={t} ratio="1/1" tone="surface-2" className="p-2" />
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {product.cat}
            </span>
            <h1 className="m-0 mb-2.5 mt-3.5 font-display text-[clamp(30px,4vw,50px)] font-normal leading-[1.12]">
              {product.name}
            </h1>
            <p className="m-0 mb-[22px] text-[17px] text-ink-soft">{product.sub}</p>
            <div className="mb-6 border-b border-rule pb-[22px] font-mono text-xl">
              {money(product.price)}
            </div>
            <p className="m-0 mb-[30px] max-w-[52ch] leading-[1.8] text-pretty text-ink-soft">
              {product.desc}
            </p>

            <ProductActions product={product} />

            <p className="m-0 mt-[26px] font-mono text-[11px] leading-[1.9] text-ink-faint">
              Envío estándar $120 MXN · Devoluciones dentro de 30 días naturales · Facturación
              disponible
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
