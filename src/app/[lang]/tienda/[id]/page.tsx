import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { PRODUCT_THUMBS } from "@/lib/content/tienda";
import { getProduct, getProductIds } from "@/lib/data/products";
import { money } from "@/lib/format";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { ProductActions } from "@/components/tienda/ProductActions";
import { fijarIdioma, localeActual } from "@/i18n/servidor";

type Params = { params: Promise<{ lang: string; id: string }> };

// Next exige un literal aquí: 5 minutos de caché para el catálogo.
export const revalidate = 300;

export async function generateStaticParams() {
  // Sólo el segmento propio: el `lang` lo aporta `generateStaticParams` del
  // layout raíz y Next combina ambos.
  const ids = await getProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, id } = await params;
  const product = await getProduct(id, lang === "en" ? "en" : "es");
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.desc };
}

export default async function ProductPage({ params }: Params) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();
  const t = await getTranslations("store");
  const tc = await getTranslations("store.cats");

  const { id } = await params;
  const product = await getProduct(id, await localeActual());
  if (!product) notFound();

  return (
    <section className="pb-[clamp(60px,8vw,110px)] pt-[clamp(50px,7vw,90px)]">
      <div className="shell">
        <Link
          href="/tienda"
          className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted hover:text-accent"
        >
          {t("volver")}
        </Link>

        <div className="mt-[34px] grid items-start gap-[clamp(28px,4vw,64px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <div className="grid gap-3">
            <PhotoSlot label={product.shot} ratio="1/1" className="rounded-3xl" />
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_THUMBS.map((clave) => (
                <PhotoSlot
                  key={clave}
                  label={t(`thumbs.${clave}`)}
                  ratio="1/1"
                  className="rounded-[14px]"
                />
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              {tc(product.catKey)}
            </span>
            <h1 className="m-0 my-3.5 mb-2.5 font-display text-[clamp(34px,5vw,72px)] uppercase leading-[0.92]">
              {product.name}
            </h1>
            <p className="m-0 mb-[22px] text-[17px] text-muted">{product.sub}</p>
            <div className="mb-6 font-display text-[40px]">{money(product.price)}</div>
            <p className="m-0 mb-[30px] max-w-[52ch] leading-[1.75] text-pretty text-muted">
              {product.desc}
            </p>

            <ProductActions product={product} />

            <p className="m-0 mt-[26px] font-mono text-[11px] leading-[1.8] text-muted">
              {t("envioNota")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
