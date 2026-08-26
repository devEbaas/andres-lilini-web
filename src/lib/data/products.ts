import { PRODUCTS, type Product } from "@/lib/content/tienda";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Catálogo desde Supabase. Si el proyecto aún no está conectado
 * (o la consulta falla), cae al catálogo semilla para que el sitio
 * siga siendo navegable.
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  if (!supabase) return PRODUCTS;

  const { data, error } = await supabase
    .from("products")
    .select("id, cat, name, sub, price, shot, description, sold_out, sort")
    .order("sort", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("[getProducts]", error.message);
    return PRODUCTS;
  }

  return data.map((r) => ({
    id: r.id,
    cat: r.cat,
    name: r.name,
    sub: r.sub,
    price: r.price,
    shot: r.shot,
    desc: r.description,
    out: r.sold_out,
  }));
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.id === id);
}
