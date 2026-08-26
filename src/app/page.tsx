import { Hero } from "@/components/home/Hero";
import { Method } from "@/components/home/Method";
import { Metrics } from "@/components/home/Metrics";
import { Accesos } from "@/components/home/Accesos";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Method />
      <Metrics />
      <Accesos />
    </>
  );
}
