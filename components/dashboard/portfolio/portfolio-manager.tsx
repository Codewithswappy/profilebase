"use client";

import { FullProfile } from "@/lib/actions/profile";
import { ProjectsManager } from "@/components/dashboard/projects/projects-manager";

interface PortfolioManagerProps {
  data: FullProfile;
}

export function PortfolioManager({ data }: PortfolioManagerProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Portfolio Manager
        </h1>
      </div>

      <div className="max-w-5xl">
        <ProjectsManager data={data} />
      </div>
    </div>
  );
}
