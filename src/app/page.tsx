import Link from "next/link";
import { Dumbbell, Calendar, Users, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Class Scheduling",
    description:
      "Create and manage recurring classes with flexible scheduling and real-time booking.",
  },
  {
    icon: Users,
    title: "Member Management",
    description:
      "Centralized member database with profiles, waivers, and communication tools.",
  },
  {
    icon: CreditCard,
    title: "Memberships & Payments",
    description:
      "Flexible pricing with Stripe-powered subscriptions, packs, and drop-ins.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Business intelligence dashboard with revenue, attendance, and retention metrics.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FitBook</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-background to-muted/30 py-24 text-center">
          <div className="mx-auto max-w-4xl px-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Manage your fitness studio{" "}
              <span className="text-primary">effortlessly</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              FitBook is the all-in-one booking and management platform designed
              for pilates and yoga studios. Streamline classes, memberships, and
              payments in one place.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/schedule">Browse Classes</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything your studio needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From scheduling to payments, FitBook handles it all.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title}>
                    <CardHeader>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent />
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FitBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
