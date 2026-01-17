"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export function DashboardSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/50 border-r border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl">
      <div className="p-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl text-zinc-800 dark:text-zinc-100"
        >
          <Shield className="w-6 h-6 text-zinc-900 dark:text-white fill-zinc-900 dark:fill-white" />
          <span>SkillProof</span>
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
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300",
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "fill-current")} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-zinc-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
