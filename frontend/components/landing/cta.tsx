import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold">Ready to Modernize Your Cooperative?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of organizations already using CoopFlow to manage their cooperative finance operations on Stellar.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/dashboard">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}