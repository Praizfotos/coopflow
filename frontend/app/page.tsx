import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="space-y-12">
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}