
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Lock,
  Zap,
  CheckCircle,
} from "lucide-react";
import { getSession } from "@/lib/sessions";

export const metadata = {
  title: "Smart Inventory Manager - Home",
  description:
    "Intelligent inventory management system with order tracking and analytics",
};

export default async function HomePage() {
  const session = await getSession();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Smart Inventory Manager</h1>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-foreground">
            Manage Your Inventory{" "}
            <span className="text-primary">Intelligently</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A powerful, scalable inventory management system built with modern
            technology. Track orders, manage stock, and optimize your operations
            in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <Card>
            <CardHeader className="pb-3">
              <Package className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organize products by category, track SKUs, manage pricing, and
                maintain accurate inventory levels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <ShoppingCart className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create orders with automatic stock deduction. Real-time conflict
                detection ensures data integrity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View order trends, track KPIs, monitor revenue, and get
                actionable insights about your business.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Auto Restocking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatic restock queue when products fall below threshold.
                Streamline your replenishment workflow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Lock className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Secure & Scalable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enterprise-grade security, role-based access control, and
                architecture designed for growth.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CheckCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Activity Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete audit trail of all system actions for compliance and
                accountability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg border p-12 mb-20">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Built with Modern Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: "Next.js 16", desc: "React framework" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "Prisma", desc: "Database ORM" },
              { name: "PostgreSQL", desc: "Database" },
              { name: "shadcn/ui", desc: "UI Components" },
              { name: "NextAuth.js", desc: "Authentication" },
              { name: "Zod", desc: "Validation" },
              { name: "Recharts", desc: "Charts" },
            ].map((tech) => (
              <div key={tech.name}>
                <p className="font-semibold text-foreground">{tech.name}</p>
                <p className="text-sm text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="mb-6 text-lg opacity-90">
            Try the demo account to explore all features risk-free
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 font-semibold"
              >
                Sign In Now
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Demo Account: demo@example.com / Demo123!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>Smart Inventory Manager v1.0</p>
          <p className="text-sm mt-2">
            Built with Next.js, Tailwind CSS, and Prisma
          </p>
        </div>
      </footer>
    </main>
  );
}
