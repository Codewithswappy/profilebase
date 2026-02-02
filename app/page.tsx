import { Link } from "next-view-transitions";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Rocket,
  ArrowRight,
  LayoutDashboard,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LandingBentoGrid } from "@/components/landing/bento-grid";

export const metadata = {
  title: "ProfileBase — A better way to share your professional work",
  description:
    "The structured skills profile for developers. Prove your abilities to recruiters in 60 seconds.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white selection:bg-neutral-200 dark:selection:bg-white/20 selection:text-neutral-950 dark:selection:text-white relative font-sans overflow-x-hidden w-full">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-white dark:from-neutral-950 to-transparent" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-2 md:py-2 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Image
              src="/logo/newLogo.png"
              alt="ProfileBase"
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto object-cover dark:hidden"
            />
            <Image
              src="/logo/newlogodarkMode.png"
              alt="ProfileBase"
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto object-cover hidden dark:block"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* <GithubStarButton /> */}
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="group relative hidden md:flex h-8 md:h-9 items-center gap-2 overflow-hidden rounded-full border border-dashed bg-neutral-950 dark:bg-white px-3 md:px-4 text-xs md:text-sm font-semibold text-white dark:text-neutral-950 transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <span className="">Get Started</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1 " />
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-20">
        <section className="py-20 px-6 relative">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-100 dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative">
            <div className="inline-flex items-center gap-2 border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 backdrop-blur-sm">
              <span className="flex h-4 w-4 rounded-full border border-dashed border-neutral-100 bg-neutral-800 dark:bg-neutral-100 dark:border-neutral-900 animate-pulse" />
              v1.0 is now live
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter text-neutral-950 dark:text-white leading-[1.1]">
              One Profile. <br className="hidden sm:block" />
              <span className="text-neutral-400 dark:text-neutral-500">
                Resume, Portfolio & Analytics.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Stop updating five different sites. Fill in your details once, get
              a tailored resume, a structured portfolio, and profile analytics
              in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="h-12 px-8  border border-dashed border-neutral-300 dark:border-neutral-700 bg-lime-600 text-white font-bold text-lg flex items-center gap-2 hover:bg-lime-400 transition-all active:scale-95 shadow-lg bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"
              >
                <Rocket className="w-5 h-5" />
                Build Your Profile
              </Link>
              <Link
                href="/demo-profile"
                className="h-12 px-8 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-lg flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features / Visual */}
        <section className="bg-neutral-50/50 dark:bg-neutral-950/20">
          <LandingBentoGrid />
        </section>

        {/* CTA Footer */}
        <section className="py-24 px-6 text-center border-t border-dashed border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-neutral-50/50 dark:bg-neutral-900/20" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500"></span>
              </span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 pr-2">
                Accepting Early Access Users
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-neutral-950 dark:text-white leading-[1.1]">
              Ready to professionalize <br className="hidden sm:block" />
              <span className="text-neutral-400 dark:text-neutral-600">
                your developer identity?
              </span>
            </h2>

            <p className="text-md text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Join thousands of developers who are already using ProfileBase to
              showcase their proof of work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className=" px-6 py-2 rounded bg-lime-600 text-neutral-100 font-bold text-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm shadow-black/10 dark:shadow-lime-500/10"
              >
                <Rocket className="w-5 h-5" />
                Register Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-600 bg-white dark:bg-neutral-950 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-4 h-4 border border-dashed bg-red-400" />
          <div className="w-4 h-4 border border-dashed bg-yellow-400" />
          <div className="w-4 h-4 border border-dashed bg-lime-400" />
        </div>
        <p>
          &copy; {new Date().getFullYear()} ProfileBase. Build with{" "}
          <span className="text-red-600">&hearts;</span> by{" "}
          <Link
            href="https://x.com/heyyswap"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-lime-400 transition-all"
          >
            heyyswap
          </Link>
        </p>
      </footer>
    </div>
  );
}
