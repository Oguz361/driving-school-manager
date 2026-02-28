import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Stats } from "@/components/landing/Stats";
import { Services } from "@/components/landing/Services";
import { Benefits } from "@/components/landing/Benefits";
import TimelineDemo from "@/components/timeline-demo";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Stats />
      <Services />
      <Benefits />
      <TimelineDemo />
      <Footer />
    </main>
  );
}
