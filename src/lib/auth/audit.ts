import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import type { SessionClaims } from "./dal";

type Entrada = {
  action: string;
  targetTable?: string;
  targetId?: string;
  meta?: Json;
};

/**
 * Deja constancia de una acción del panel.
 *
 * Escribe con service role a propósito: `admin_audit` no tiene policy de
 * insert, así que un admin no puede fabricar ni borrar entradas desde su
 * sesión. Sólo leerlas.
 *
 * No revienta la acción que la llama: si la auditoría falla, el trabajo del
 * usuario ya está hecho y perder la traza es peor que ruidoso, pero no es
 * motivo para deshacerlo. Queda en el log del servidor.
 */
export async function logAdminAction(actor: SessionClaims, entrada: Entrada): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from("admin_audit").insert({
    actor_id: actor.userId,
    actor_email: actor.email,
    action: entrada.action,
    target_table: entrada.targetTable ?? null,
    target_id: entrada.targetId ?? null,
    meta: entrada.meta ?? {},
  });

  if (error) console.error("[admin_audit] no se pudo registrar", entrada.action, error.message);
}
