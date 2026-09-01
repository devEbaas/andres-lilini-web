import { PRODUCTS_SEED, desdeSemilla, type CatKey, type Product } from "@/lib/content/tienda";
import { createPublicClient } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/routing";

/**
 * Catálogo desde Supabase, ya resuelto al idioma pedido.
 *
 * Si el proyecto aún no está conectado —o la consulta falla— cae al catálogo
 * semilla, que también es bilingüe: el sitio se ve igual con base y sin ella,
 * en los dos idiomas.
 *
 * El idioma llega como parámetro y no se lee aquí dentro porque esto también
 * corre desde `generateStaticParams`, fuera de cualquier petición.
 */
export async function getProducts(locale: Locale): Promise<Product[]> {
  const semilla = () => PRODUCTS_SEED.map((s) => desdeSemilla(s, locale));

  const supabase = createPublicClient();
  if (!supabase) return semilla();

  const { data, error } = await supabase
    .from("products")
    // Literal a propósito: `select` infiere el tipo de la fila a partir de
    // esta cadena, y una construida por concatenación lo deja en `unknown`.
    .select(
      "id, cat_key, price, sold_out, sort, name, sub, shot, description, name_en, sub_en, shot_en, description_en",
    )
    .order("sort", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("[getProducts]", error.message);
    return semilla();
  }

  return data.map((r) => ({
    id: r.id,
    catKey: r.cat_key as CatKey,
    price: r.price,
    out: r.sold_out,
    // Una fila sin traducir cae al español en vez de mostrarse en blanco: es
    // preferible un producto en el idioma equivocado a un producto sin nombre.
    name: locale === "en" ? r.name_en || r.name : r.name,
    sub: locale === "en" ? r.sub_en || r.sub : r.sub,
    shot: locale === "en" ? r.shot_en || r.shot : r.shot,
    desc: locale === "en" ? r.description_en || r.description : r.description,
  }));
}

export async function getProduct(id: string, locale: Locale): Promise<Product | undefined> {
  const all = await getProducts(locale);
  return all.find((p) => p.id === id);
}

/**
 * Sólo los identificadores, para `generateStaticParams`.
 *
 * El id no depende del idioma, así que pedir el catálogo en español es
 * arbitrario pero suficiente, y evita traer las ocho filas dos veces.
 */
export async function getProductIds(): Promise<string[]> {
  const all = await getProducts("es");
  return all.map((p) => p.id);
}
