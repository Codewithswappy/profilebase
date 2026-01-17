import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CheckCircle, Shield, ExternalLink, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "SkillDock — Proof Over Claims",
  description:
    "The structured skills profile for developers. Prove your abilities to recruiters in 60 seconds.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <header className="px-6 py-4 pt-0 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl">
          <img
            src="/logo/logo.png"
            alt="SkillDock"
            className="h-25 w-auto max-w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Stop claiming skills. <br />
              <span className="text-primary bg-clip-text">
                Start proving them.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              The structured skills profile that replaces your resume.{" "}
              <br className="hidden md:inline" />
              Help recruiters understand your capabilities in 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-8 text-lg",
                )}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Create Free Profile
              </Link>
              <Link
                href="/demo-profile"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-8 text-lg",
                )}
              >
                View Demo Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Resumes are broken.</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="p-2 h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold">X</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Empty Claims</h3>
                    <p className="text-muted-foreground">
                      Anyone can list "React Expert" via a keyword. Recruiters
                      can't verify it.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold">X</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Github is Noisy</h3>
                    <p className="text-muted-foreground">
                      Recruiters don't have time to read your code or navigate
                      50 repos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">SkillDock is different.</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="p-2 h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Evidence-First</h3>
                    <p className="text-muted-foreground">
                      Every skill is linked to specific evidence (code, deployed
                      link, description).
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      60-Second Readability
                    </h3>
                    <p className="text-muted-foreground">
                      Structured for recruiters to scan and verify your
                      "Shortlist Quality" instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to stand out?</h2>
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Join SkillDock for Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground bg-card">
        <p>&copy; {new Date().getFullYear()} SkillDock. Proof over claims.</p>
      </footer>
    </div>
  );
}
