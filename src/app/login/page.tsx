"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { loginUser } from "../actions/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await loginUser({ email, password });

            if (result.error) {
                setError(result.error);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            // Create demo account via API
            const demoResponse = await fetch("/api/auth/demo", {
                method: "POST",
            });

            if (!demoResponse.ok) {
                console.error("Demo account creation failed");
            }

            // Login with demo credentials
            const result = await loginUser({
                email: "demo@example.com",
                password: "Demo123!",
            });

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Smart Inventory Manager
                    </CardTitle>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                        Sign in to manage your inventory
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-800">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                        >
                            Demo Login
                        </Button>
                    </form>

                    <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-800">
                            <strong>Demo Account:</strong> demo@example.com / Demo123!
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Demo account will be created on first login.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
