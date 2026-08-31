import "server-only";

import { siteUrl } from "@/lib/urls";

/**
 * Envoltura común. Estilos en línea y una sola columna: los clientes de
 * correo ignoran las hojas de estilo y muchos rompen los grid.
 */
function envolver(titulo: string, cuerpo: string): string {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px">
    <tr><td>
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#71717a">Andrés Lillini</p>
      <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25">${titulo}</h1>
      ${cuerpo}
      <p style="margin:32px 0 0;padding-top:18px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.6;color:#71717a">
        Recibes este mensaje porque alguien lo solicitó desde
        <a href="${siteUrl()}" style="color:#71717a">${siteUrl().replace(/^https?:\/\//, "")}</a>.
        Si no fuiste tú, ignóralo.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function boton(url: string, texto: string): string {
  return `<p style="margin:26px 0"><a href="${url}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#18181b;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${texto}</a></p>
  <p style="margin:0 0 8px;font-size:12px;color:#71717a">Si el botón no funciona, copia esta dirección:</p>
  <p style="margin:0;font-size:12px;word-break:break-all;color:#3f3f46">${url}</p>`;
}

// ── Verificación del tutor ────────────────────────────────────

export function plantillaTutor(datos: {
  jugador: string;
  folio: string;
  url: string;
  dias: number;
}) {
  const { jugador, folio, url, dias } = datos;
  return {
    asunto: `Autoriza la postulación de ${jugador}`,
    html: envolver(
      "Necesitamos tu autorización",
      `<p style="margin:0 0 14px;line-height:1.7">${jugador} se postuló al programa de atletas y te señaló como su padre, madre o tutor legal.</p>
       <p style="margin:0 0 14px;line-height:1.7">Como es menor de edad, no podemos evaluar la postulación <strong>${folio}</strong> sin que tú lo autorices expresamente. Confírmalo desde aquí:</p>
       ${boton(url, "Autorizar la postulación")}
       <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#71717a">El enlace caduca en ${dias} días. Si no reconoces esta postulación, no hagas nada: sin tu confirmación no se evalúa.</p>`,
    ),
    texto: `${jugador} se postuló al programa de atletas y te señaló como su tutor legal.

Como es menor de edad, no podemos evaluar la postulación ${folio} sin tu autorización expresa.

Autoriza aquí: ${url}

El enlace caduca en ${dias} días. Si no reconoces esta postulación, no hagas nada: sin tu confirmación no se evalúa.`,
  };
}

// ── Invitación al expediente ──────────────────────────────────

export function plantillaExpediente(datos: {
  jugador: string;
  folio: string;
  url: string;
  dias: number;
}) {
  const { jugador, folio, url, dias } = datos;
  return {
    asunto: "Pasaste el primer corte",
    html: envolver(
      "Pasaste el primer corte",
      `<p style="margin:0 0 14px;line-height:1.7">Hola, ${jugador}. Tu postulación <strong>${folio}</strong> avanzó a la siguiente fase.</p>
       <p style="margin:0 0 14px;line-height:1.7">Nos falta un último bloque de datos antes de citarte: medibles, un contacto de emergencia y las autorizaciones. No te lo pedimos al postularte porque sólo hace falta ahora.</p>
       ${boton(url, "Completar mi expediente")}
       <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#71717a">El enlace es personal y caduca en ${dias} días. No lo compartas.</p>`,
    ),
    texto: `Hola, ${jugador}. Tu postulación ${folio} avanzó a la siguiente fase.

Nos falta un último bloque de datos antes de citarte: medibles, un contacto de emergencia y las autorizaciones.

Complétalo aquí: ${url}

El enlace es personal y caduca en ${dias} días. No lo compartas.`,
  };
}

// ── Acuse de una solicitud ARCO ───────────────────────────────

const DERECHOS: Record<string, string> = {
  acceso: "acceso",
  rectificacion: "rectificación",
  cancelacion: "cancelación",
  oposicion: "oposición",
};

export function plantillaArco(datos: { nombre: string; tipo: string }) {
  const derecho = DERECHOS[datos.tipo] ?? datos.tipo;
  return {
    asunto: "Recibimos tu solicitud",
    html: envolver(
      "Recibimos tu solicitud",
      `<p style="margin:0 0 14px;line-height:1.7">Hola, ${datos.nombre}. Registramos tu solicitud de <strong>${derecho}</strong> sobre tus datos personales.</p>
       <p style="margin:0 0 14px;line-height:1.7">Antes de entregar o eliminar información tenemos que comprobar que eres quien dices ser. Te escribiremos a esta misma dirección para acreditarlo.</p>
       <p style="margin:0;line-height:1.7">Este mensaje es sólo un acuse: no hace falta que respondas todavía.</p>`,
    ),
    texto: `Hola, ${datos.nombre}. Registramos tu solicitud de ${derecho} sobre tus datos personales.

Antes de entregar o eliminar información tenemos que comprobar que eres quien dices ser. Te escribiremos a esta misma dirección para acreditarlo.

Este mensaje es sólo un acuse: no hace falta que respondas todavía.`,
  };
}
