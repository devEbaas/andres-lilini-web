import "server-only";

const API = "https://api.resend.com/emails";

const API_KEY = process.env.RESEND_API_KEY ?? "";
const REMITENTE = process.env.EMAIL_FROM ?? "";

/** Copia interna de lo que entra por los formularios. Opcional. */
export const BUZON_INTERNO = process.env.EMAIL_INTERNO ?? "";

export function correoConfigurado(): boolean {
  return Boolean(API_KEY && REMITENTE);
}

export type Mensaje = {
  para: string;
  asunto: string;
  html: string;
  /** Alternativa en texto plano. No es opcional en la práctica: sin ella
   *  muchos filtros puntúan el mensaje como spam. */
  texto: string;
  responderA?: string;
};

/**
 * Manda un correo por Resend.
 *
 * Se usa `fetch` y no el SDK porque hace falta un solo endpoint: una
 * dependencia más para un `POST` no se paga sola.
 *
 * **Nunca lanza.** Un correo es una consecuencia de la acción del usuario,
 * no la acción: si el envío falla, la postulación ya está guardada y sería
 * absurdo mostrar un error por algo que el usuario no puede arreglar. El
 * fallo queda en el log del servidor y la función devuelve `false`.
 *
 * Sin API key devuelve `false` sin intentar nada, igual que
 * `createAdminClient()` devuelve `null` sin Supabase: el sitio sigue
 * funcionando en local y en la demo sin configurar correo.
 */
export async function enviarCorreo(mensaje: Mensaje): Promise<boolean> {
  if (!correoConfigurado()) return false;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [mensaje.para],
        subject: mensaje.asunto,
        html: mensaje.html,
        text: mensaje.texto,
        ...(mensaje.responderA ? { reply_to: mensaje.responderA } : {}),
      }),
      // Un correo lento no debe colgar una Server Action.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // El cuerpo trae el motivo (dominio sin verificar, destinatario
      // inválido…). No se registra el destinatario: es un dato personal y
      // los logs de Vercel los ve cualquiera con acceso al proyecto.
      const detalle = await res.text().catch(() => "");
      console.error("[email]", res.status, detalle.slice(0, 300));
      return false;
    }

    return true;
  } catch (e) {
    console.error("[email] no se pudo enviar", (e as Error).message);
    return false;
  }
}
