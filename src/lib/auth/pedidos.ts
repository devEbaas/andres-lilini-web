import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Adopta los pedidos de invitado hechos con el correo de la sesión.
 *
 * No es una Server Action a propósito: se llama durante el render de
 * `/cuenta/pedidos`, y `revalidatePath` en fase de render no es válido. La
 * función de Postgres es idempotente, así que llamarla en cada carga sólo
 * cuesta un índice.
 *
 * La comprobación de correo confirmado vive dentro de la función SQL, no
 * aquí: así no depende de que la aplicación se acuerde de hacerla.
 */
export async function vincularPedidosHuerfanos(): Promise<number> {
  const supabase = await createServerSupabase();
  if (!supabase) return 0;

  const { data, error } = await supabase.rpc("vincular_pedidos_huerfanos");
  if (error) {
    // No es motivo para romper la página: sin vincular, el cliente sigue
    // viendo sus pedidos por la rama del correo de la policy.
    console.error("[vincularPedidosHuerfanos]", error.message);
    return 0;
  }
  return data ?? 0;
}
