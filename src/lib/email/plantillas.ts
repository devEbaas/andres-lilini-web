import "server-only";

import { getTranslations } from "next-intl/server";

import { siteUrl } from "@/lib/urls";
import { routing, type Locale } from "@/i18n/routing";

export type Correo = { asunto: string; html: string; texto: string };

/** Marca `<b>` de los mensajes: negrita en el HTML, nada en el texto plano. */
const NEGRITA_HTML = { b: (c: string) => `<strong>${c}</strong>` };
const NEGRITA_TEXTO = { b: (c: string) => c };

const P = 'style="margin:0 0 14px;line-height:1.7"';

/**
 * Envoltura común. Estilos en línea y una sola columna: los clientes de
 * correo ignoran las hojas de estilo y muchos rompen los grid.
 */
async function envolver(locale: Locale, titulo: string, cuerpo: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: "email" });
  const dominio = siteUrl().replace(/^https?:\/\//, "");

  return `<!doctype html>
<html lang="${locale}"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;padding:32px">
    <tr><td>
      <p style="margin:0 0 24px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#71717a">${t("marca")}</p>
      <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25">${titulo}</h1>
      ${cuerpo}
      <p style="margin:32px 0 0;padding-top:18px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.6;color:#71717a">
        ${t("pie", { dominio: `<a href="${siteUrl()}" style="color:#71717a">${dominio}</a>` })}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

async function boton(locale: Locale, url: string, texto: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: "email" });
  return `<p style="margin:26px 0"><a href="${url}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#18181b;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${texto}</a></p>
  <p style="margin:0 0 8px;font-size:12px;color:#71717a">${t("botonFallback")}</p>
  <p style="margin:0;font-size:12px;word-break:break-all;color:#3f3f46">${url}</p>`;
}

/** Lo que produce cada plantilla antes de meterse en el envoltorio. */
type Bloque = { asunto: string; titulo: string; html: string; texto: string };

const SEPARADOR =
  '<hr style="margin:30px 0;border:0;border-top:1px solid #e4e4e7">';

/**
 * Junta dos versiones del mismo correo en un solo mensaje.
 *
 * Se usa con el tutor de un menor: la postulación puede venir en inglés y el
 * tutor no tiene por qué leerlo. Una autorización legal que no se entiende no
 * sirve de nada, así que van las dos y que elija quien lee.
 *
 * Se componen los cuerpos y se envuelve una vez, en lugar de pegar dos correos
 * ya montados: así no hay que abrir el HTML terminado para encontrar dónde
 * insertar, que es exactamente el tipo de empalme que se rompe al cambiar el
 * envoltorio.
 */
async function bilingue(a: Bloque, b: Bloque, locale: Locale): Promise<Correo> {
  return {
    asunto: `${a.asunto} · ${b.asunto}`,
    html: await envolver(
      locale,
      a.titulo,
      `${a.html}${SEPARADOR}<h2 style="margin:0 0 18px;font-size:20px;line-height:1.3">${b.titulo}</h2>${b.html}`,
    ),
    texto: `${a.texto}\n\n— — —\n\n${b.texto}`,
  };
}

/** Un bloque suelto, envuelto y listo para enviar. */
async function solo(b: Bloque, locale: Locale): Promise<Correo> {
  return { asunto: b.asunto, html: await envolver(locale, b.titulo, b.html), texto: b.texto };
}

// ── Verificación del tutor ────────────────────────────────────

type DatosTutor = { jugador: string; folio: string; url: string; dias: number };

async function bloqueTutor(locale: Locale, d: DatosTutor): Promise<Bloque> {
  const t = await getTranslations({ locale, namespace: "email.tutor" });
  const v = { jugador: d.jugador, folio: d.folio, dias: d.dias };

  return {
    asunto: t("asunto", v),
    titulo: t("titulo"),
    html: `<p ${P}>${t.markup("p1", { ...v, ...NEGRITA_HTML })}</p>
       <p ${P}>${t.markup("p2", { ...v, ...NEGRITA_HTML })}</p>
       ${await boton(locale, d.url, t("boton"))}
       <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#71717a">${t("caduca", v)}</p>`,
    texto: [
      t.markup("p1", { ...v, ...NEGRITA_TEXTO }),
      t.markup("p2", { ...v, ...NEGRITA_TEXTO }),
      `${t("enlace")} ${d.url}`,
      t("caduca", v),
    ].join("\n\n"),
  };
}

/**
 * El tutor recibe el correo en el idioma de la postulación y, si esa no fue
 * el español, también en español debajo.
 */
export async function plantillaTutor(d: DatosTutor, locale: Locale): Promise<Correo> {
  const principal = await bloqueTutor(locale, d);
  if (locale === routing.defaultLocale) return solo(principal, locale);
  return bilingue(principal, await bloqueTutor(routing.defaultLocale, d), locale);
}

// ── Invitación al expediente ──────────────────────────────────

export async function plantillaExpediente(
  d: { jugador: string; folio: string; url: string; dias: number },
  locale: Locale,
): Promise<Correo> {
  const t = await getTranslations({ locale, namespace: "email.expediente" });
  const v = { jugador: d.jugador, folio: d.folio, dias: d.dias };

  return solo(
    {
      asunto: t("asunto"),
      titulo: t("titulo"),
      html: `<p ${P}>${t.markup("p1", { ...v, ...NEGRITA_HTML })}</p>
       <p ${P}>${t.markup("p2", { ...v, ...NEGRITA_HTML })}</p>
       ${await boton(locale, d.url, t("boton"))}
       <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#71717a">${t("caduca", v)}</p>`,
      texto: [
        t.markup("p1", { ...v, ...NEGRITA_TEXTO }),
        t.markup("p2", { ...v, ...NEGRITA_TEXTO }),
        `${t("enlace")} ${d.url}`,
        t("caduca", v),
      ].join("\n\n"),
    },
    locale,
  );
}

// ── Acuse de una solicitud ARCO ───────────────────────────────

export async function plantillaArco(
  d: { nombre: string; tipo: string },
  locale: Locale,
): Promise<Correo> {
  const t = await getTranslations({ locale, namespace: "email.arco" });
  const td = await getTranslations({ locale, namespace: "email.derechos" });

  // El tipo lo fija un CHECK; si aún así llegara otro, se muestra crudo antes
  // que romper el acuse de una solicitud que ya está registrada.
  const derecho = td.has(d.tipo) ? td(d.tipo) : d.tipo;
  const v = { nombre: d.nombre, derecho };

  return solo(
    {
      asunto: t("asunto"),
      titulo: t("titulo"),
      html: `<p ${P}>${t.markup("p1", { ...v, ...NEGRITA_HTML })}</p>
       <p ${P}>${t("p2")}</p>
       <p style="margin:0;line-height:1.7">${t("p3")}</p>`,
      texto: [t.markup("p1", { ...v, ...NEGRITA_TEXTO }), t("p2"), t("p3")].join("\n\n"),
    },
    locale,
  );
}
