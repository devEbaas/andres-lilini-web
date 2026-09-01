import type { Metadata, Viewport } from "next";
import { Anton, Archivo, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";

import { routing } from "@/i18n/routing";
import { metadatosDe } from "@/i18n/metadata";
import { CartProvider } from "@/lib/store/cart";
import { ToastProvider } from "@/lib/store/toast";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { CartDrawer } from "@/components/chrome/CartDrawer";
import { Toast } from "@/components/chrome/Toast";
import { RouteTransition } from "@/components/chrome/RouteTransition";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

/**
 * La portada y la plantilla de títulos, ya en el idioma del segmento.
 *
 * Va en el layout y no en la página porque `title.template` lo hereda todo el
 * árbol: si viviera en `page.tsx` sólo aplicaría a la portada.
 */
export async function generateMetadata(): Promise<Metadata> {
  const base = await metadatosDe("/", "inicio");
  const t = await getTranslations("meta");

  return {
    ...base,
    metadataBase: new URL("https://andreslillini.com"),
    title: { default: t("inicio.title"), template: t("plantilla") },
    openGraph: {
      ...base.openGraph,
      title: t("inicio.ogTitle"),
      description: t("inicio.ogDescription"),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b120e",
};

/**
 * Prerenderiza el árbol completo en los dos idiomas. Sin esto, next-intl
 * fuerza render dinámico y se pierde el estático del catálogo.
 */
export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  // El segmento `[lang]` es un comodín: captura `/cualquier-cosa`. Sin esta
  // guarda, una ruta inexistente renderizaría el sitio entero con un idioma
  // inválido en vez de dar 404.
  if (!hasLocale(routing.locales, lang)) notFound();

  setRequestLocale(lang);

  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <body className={`${anton.variable} ${archivo.variable} ${plexMono.variable} antialiased`}>
        <NextIntlClientProvider>
          <ToastProvider>
            <CartProvider>
              <ScrollProgress />
              <Header />
              <main className="pt-[78px]">
                <RouteTransition>{children}</RouteTransition>
              </main>
              <Footer />
              <CartDrawer />
              <Toast />
            </CartProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
