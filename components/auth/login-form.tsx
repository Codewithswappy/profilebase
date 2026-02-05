"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useTransitionRouter } from "next-view-transitions";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registered = searchParams.get("registered") === "true";

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await login({ email, password });

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {registered && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Account created! Please sign in.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="example@email.com"
              className="border border-dashed rounded-none border-neutral-300 dark:border-neutral-800 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                className="border border-dashed rounded-none border-neutral-300 dark:border-neutral-800 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full cursor-pointer py-4 text-base"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
