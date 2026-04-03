import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-2 text-primary">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </main>
  );
}
