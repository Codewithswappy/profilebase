import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login — ProfileBase",
  description: "Sign in to your ProfileBase account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-48 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
