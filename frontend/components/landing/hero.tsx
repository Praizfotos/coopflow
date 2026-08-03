import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Wallet } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            CoopFlow
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Programmable Cooperative Finance Platform powered by Stellar and Soroban.
            Modernize your Ajo, Esusu, Chama, Susu, SACCO, and community finance operations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">Read Documentation</Link>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Stellar Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Cooperative First</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">On-Chain Transparency</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}