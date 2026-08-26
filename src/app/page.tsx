import { Hero } from "@/components/home/Hero";
import { Metrics } from "@/components/home/Metrics";
import { Timeline } from "@/components/home/Timeline";
import { Pillars } from "@/components/home/Pillars";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Metrics />
      <Timeline />
      <Pillars />
    </>
  );
}
