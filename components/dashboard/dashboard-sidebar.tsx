"use client";

import { useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  User,
  LogOut,
  TrendingUp,
  FolderOpen,
  ChevronsLeft,
  ChevronsRight,
  X,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";

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
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Resume",
    href: "/dashboard/resume",
    icon: FileText,
  },
];

export function DashboardSidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If on mobile (onClose provided), we never want to be in collapsed state
  useEffect(() => {
    if (onClose) {
      setIsCollapsed(false);
    }
  }, [onClose]);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" },
  };

  const navItemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: {
        duration: 0.2,
      },
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transitionEnd: { display: "none" },
      transition: { duration: 0.1 },
    },
  };

  const navListVariants = {
    expanded: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    collapsed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={onClose ? {} : sidebarVariants}
      className={cn(
        "flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-900 z-50 relative",
        className,
        onClose && "w-full border-none", // Mobile overrides
      )}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-900/50 overflow-hidden shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 group transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "",
            "overflow-hidden", // ensure title doesn't overflow
          )}
        >
          {/* Logo Logic: Show Icon when collapsed, Image when expanded */}
          {isCollapsed ? (
            <div className="relative w-16 h-16 flex items-center justify-center select-none">
              <img
                src="/logo/blackLogo.png"
                alt="SkillDock"
                className="h-16 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo/lightLogo.png"
                alt="SkillDock"
                className="h-16 w-auto object-contain hidden dark:block"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <img
                src="/logo/blackLogo.png"
                alt="SkillDock"
                className="h-12 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo/lightLogo.png"
                alt="SkillDock"
                className="h-12 w-auto object-contain hidden dark:block"
              />
            </motion.div>
          )}
        </Link>

        {!isCollapsed && (
          <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200 border-b border-dashed border-neutral-300 dark:border-neutral-700 relative -left-6 top-1">
            SkillDock
          </div>
        )}

        {/* Toggle Button (Desktop) or Close Button (Mobile) */}
        {!isCollapsed && (
          <Button
            onClick={onClose ? onClose : () => setIsCollapsed(true)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {onClose ? (
              <X className="w-5 h-5" />
            ) : (
              <ChevronsLeft className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      {/* Collapsed Toggle (Centered) */}
      {isCollapsed &&
        !onClose && ( // Added !onClose condition
          <div className="w-full flex justify-center py-4 border-b border-neutral-100 dark:border-neutral-900/50">
            <Button
              onClick={() => setIsCollapsed(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ChevronsRight className="w-5 h-5" />
            </Button>
          </div>
        )}

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 relative overflow-hidden">
        {/* Decorative Line (Only when expanded) */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-6 top-6 bottom-6 w-px bg-neutral-100 dark:bg-neutral-900 border-l border-dashed border-neutral-200 dark:border-neutral-800 pointer-events-none"
          />
        )}

        <p
          className={cn(
            "px-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-4 transition-opacity",
            isCollapsed && "opacity-0 hidden",
          )}
        >
          Navigation
        </p>

        <motion.div variants={navListVariants} className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="block relative group"
                title={isCollapsed ? item.title : undefined}
              >
                <motion.div
                  layout
                  className={cn(
                    "relative flex items-center rounded-lg transition-all duration-200 z-10",
                    isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-2.5",
                    isActive
                      ? "text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                  )}
                >
                  {/* Active Dot for Expanded */}
                  {!isCollapsed && isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="absolute left-[-9px] w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    />
                  )}

                  {/* Active Indicator for Collapsed */}
                  {isCollapsed && isActive && (
                    <motion.div
                      layoutId="active-bg-collapsed"
                      className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 rounded-lg -z-10"
                    />
                  )}

                  <Icon
                    className={cn(
                      "transition-transform duration-200 group-hover:scale-110 shrink-0",
                      isCollapsed ? "w-5 h-5" : "w-4 h-4",
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300",
                    )}
                  />

                  <motion.span
                    variants={navItemVariants}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.title}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shrink-0">
        <div className="space-y-4">
          {/* Header */}
          {!isCollapsed && (
            <p className="px-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              System
            </p>
          )}

          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "flex-col gap-4" : "justify-between gap-1",
            )}
          >
            {/* Sign Out */}
            <button
              className={cn(
                "flex items-center gap-3 text-sm font-medium transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white group",
                isCollapsed
                  ? "w-9 h-9 justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  : "",
              )}
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            {/* Mode Toggle */}
            <div
              className={cn("opacity-70 hover:opacity-100 transition-opacity")}
            >
              <ModeToggle />
            </div>
          </div>

          {/* {!isCollapsed && (
            <div className="pt-2 px-1 flex justify-between items-center text-neutral-400 dark:text-neutral-600">
              <span className="text-[10px] font-mono">v1.2.0</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
                <div className="w-1 h-1 rounded-full bg-current" />
              </div>
            </div>
          )} */}
        </div>
      </div>
    </motion.div>
  );
}
