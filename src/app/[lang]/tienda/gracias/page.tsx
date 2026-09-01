import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

import { getTranslations } from "next-intl/server";

import { money } from "@/lib/format";
import { fulfillCheckout } from "@/lib/stripe/fulfill";
import { ClearCart } from "@/components/tienda/ClearCart";
import { btnPrimary, btnQuiet } from "@/components/ui/styles";
import { fijarIdioma, localeActual } from "@/i18n/servidor";

type Props = { searchParams: Promise<{ session_id?: string }> };

export const metadata: Metadata = {
  title: "Pedido confirmado",
  description: "Confirmación de tu pedido en la tienda oficial de Andrés Lillini.",
  robots: { index: false, follow: false },
};

export default async function GraciasPage({ searchParams }: Props) {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  const locale = await localeActual();
  const t = await getTranslations("gracias");

  const { session_id: sessionId } = await searchParams;

  // Los webhooks pueden llegar con retraso; confirmamos también aquí para que
  // el cliente que sí volvió vea su pedido al instante. `fulfillCheckout` es
  // idempotente, así que las dos vías pueden coincidir sin duplicar nada.
  const order = sessionId ? await fulfillCheckout(sessionId) : null;

  if (!order) {
    return (
      <section className="grid min-h-[60vh] place-items-center py-[clamp(60px,8vw,120px)] text-center">
        <div className="max-w-[620px] px-[clamp(18px,4vw,44px)]">
          <h1 className="m-0 mb-3.5 font-display text-[clamp(30px,5vw,56px)] uppercase leading-[0.95]">
            {t("sinPedidoTitulo")}
          </h1>
          <p className="m-0 mb-8 leading-[1.7] text-muted">
            {t("sinPedidoTexto")}
          </p>
          <Link href="/tienda" className={btnPrimary}>
            {t("volverTienda")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-[clamp(60px,8vw,110px)]">
      <ClearCart />
      <div className="shell">
        <div className="mx-auto max-w-[720px]">
          <p className="m-0 mb-5 font-mono text-[11px] uppercase tracking-[0.38em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="m-0 mb-[22px] font-display text-[clamp(38px,7vw,96px)] uppercase leading-[0.9]">
            {t("titulo")}
          </h1>
          <p className="m-0 mb-10 max-w-[52ch] text-[17px] leading-[1.7] text-muted">
            {order.email
              ? t("comprobanteA", { email: order.email })
              : t("pagoRegistrado")}
            {t("envioTexto")}
          </p>

          <div className="rounded-[22px] border border-hairline bg-panel p-[clamp(22px,4vw,34px)]">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-4">
              <span className="label-caps">{t("folio")}</span>
              <span className="font-mono text-sm text-ink">{order.folio}</span>
            </div>

            {order.lines.map((l) => (
              <div key={l.name} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="text-ink">
                  {l.name}
                  {l.qty > 1 && <span className="text-muted"> × {l.qty}</span>}
                </span>
                <span className="shrink-0 font-mono text-muted">{money(l.amount, locale)}</span>
              </div>
            ))}

            <div className="mt-4 border-t border-hairline pt-4">
              <div className="flex justify-between text-sm text-muted">
                <span>{t("envio")}</span>
                <span className="font-mono">{money(order.shipping, locale)}</span>
              </div>
              <div className="mt-3 flex justify-between font-display text-2xl uppercase">
                <span>{t("total")}</span>
                <span>{money(order.total, locale)}</span>
              </div>
            </div>

            {order.address && (
              <div className="mt-7 border-t border-hairline pt-5">
                <div className="label-caps mb-2.5">{t("envioA")}</div>
                {order.address.map((line) => (
                  <p key={line} className="m-0 text-sm leading-[1.6] text-muted">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/tienda" className={btnQuiet}>
              {t("seguirComprando")}
            </Link>
            <Link href="/contacto" className={btnQuiet}>
              {t("dudas")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
