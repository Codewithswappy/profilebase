"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  Layers,
  TrendingUp,
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Portfolio",
    href: "/dashboard/portfolio",
    icon: Layers,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
];

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-neutral-50/50 dark:bg-sidebar border-r border-neutral-200/50 dark:border-neutral-800/50",
        className,
      )}
    >
      <div className=" flex justify-center items-center">
        <Link href="/dashboard" className="flex items-center">
          <img
            src="/logo/logo3.png"
            alt="SkillDock"
            className="h-20 w-auto max-w-full object-contain block dark:hidden"
          />
          <img
            src="/logo/logo4.png"
            alt="SkillDock"
            className="h-20 w-auto max-w-full object-contain hidden dark:block"
          />
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300",
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "fill-current")} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-3 text-neutral-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
