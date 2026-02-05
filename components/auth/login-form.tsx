"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useTransitionRouter } from "next-view-transitions";
import { login, loginWithGoogle } from "@/lib/actions/auth";
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
import {
  IconAlertCircle,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

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
              <IconCircleCheck className="w-4 h-4" />
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
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
              <IconAlertCircle className="w-4 h-4" />
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
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900">
                Or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer py-4 border border-dashed border-neutral-300 dark:border-neutral-800"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
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
