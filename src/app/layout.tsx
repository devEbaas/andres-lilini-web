import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Libre_Franklin, Newsreader } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/lib/store/cart";
import { ToastProvider } from "@/lib/store/toast";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { CartDrawer } from "@/components/chrome/CartDrawer";
import { Toast } from "@/components/chrome/Toast";
import { RouteTransition } from "@/components/chrome/RouteTransition";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const franklin = Libre_Franklin({ subsets: ["latin"], variable: "--font-franklin" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://andreslillini.com"),
  title: {
    default: "Andrés Lillini — Formación y desarrollo de futbolistas",
    template: "%s · Andrés Lillini",
  },
  description:
    "Veintisiete años dedicados a que un jugador joven llegue, y se sostenga. Canteras en México, Argentina y Rusia, y hoy la estructura de selecciones nacionales menores de México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Andrés Lillini",
    title: "Andrés Lillini — Formación y desarrollo de futbolistas",
    description:
      "Formación, detección y desarrollo de futbolistas. Programa de atletas, convocatoria abierta y publicaciones.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${newsreader.variable} ${franklin.variable} ${plexMono.variable} antialiased`}
      >
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="pt-[76px]">
              <RouteTransition>{children}</RouteTransition>
            </main>
            <Footer />
            <CartDrawer />
            <Toast />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
