import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Cliente con la sesión del usuario, para Server Components y Server Actions.
 *
 * Usa la clave anónima a propósito: todo lo que lea pasa por RLS. Es el que
 * usan `/admin` y `/cuenta`. `admin.ts` (service role) ignora RLS y queda
 * reservado a las escrituras sin sesión: webhook de Stripe y formularios
 * públicos.
 */
export async function createServerSupabase() {
  if (!isSupabaseConfigured()) return null;

  const store = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // Desde un Server Component no se pueden escribir cookies. El
          // refresco del token lo hace `proxy.ts`, que sí puede: por eso el
          // proxy no es opcional aunque no protegiera ninguna ruta.
        }
      },
    },
  });
}
