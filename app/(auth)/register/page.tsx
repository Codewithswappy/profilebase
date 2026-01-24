import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register — ProfileBase",
  description: "Create your ProfileBase account",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-48 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
