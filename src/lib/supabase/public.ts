import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Cliente anónimo de sólo lectura para el catálogo público.
 * No toca cookies a propósito: así las rutas de tienda siguen siendo
 * estáticas con revalidación en lugar de volverse dinámicas.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
