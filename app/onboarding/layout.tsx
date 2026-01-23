import { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Simple Header with Logo */}
      <header className="fixed top-0 left-0 p-6 z-50">
        <div className="flex items-center gap-2">
          <img
            src="/logo/lightLogo.png"
            alt="SkillDock"
            className="h-8 w-auto"
          />
          <span className="font-bold text-lg hidden md:block tracking-tight text-white">
            SkillDock
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
