import { Hero } from "@/components/home/Hero";
import { Metrics } from "@/components/home/Metrics";
import { Timeline } from "@/components/home/Timeline";
import { Pillars } from "@/components/home/Pillars";
import { fijarIdioma } from "@/i18n/servidor";

export default async function HomePage() {
  // Fija el idioma antes de cualquier lectura: sin esto la página
  // se vuelve dinámica al resolver el locale por cabecera.
  await fijarIdioma();

  return (
    <>
      <Hero />
      <Metrics />
      <Timeline />
      <Pillars />
    </>
  );
}
