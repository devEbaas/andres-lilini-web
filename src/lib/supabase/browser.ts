import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Cliente para el navegador. Sólo para lo que necesita reaccionar en el
 * cliente: el estado de sesión del header y el cierre de sesión.
 *
 * Las lecturas de datos van por el servidor. Aquí nunca hay service role.
 */
export function createBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  cached ??= createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
