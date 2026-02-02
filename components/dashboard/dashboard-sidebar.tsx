"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Settings,
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
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
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
    expanded: { width: "250px" },
    collapsed: { width: "70px" },
  };

  const navItemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: { duration: 0.2 },
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transitionEnd: { display: "none" },
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={onClose ? {} : sidebarVariants}
      className={cn(
        "flex flex-col h-full bg-neutral-50/50 dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-900 z-50 relative backdrop-blur-xl",
        className,
        onClose && "w-full border-none", // Mobile overrides
      )}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 group transition-all duration-300",
            isCollapsed ? "justify-center w-full" : "",
            "overflow-hidden",
          )}
        >
          {isCollapsed ? (
            <div className="relative w-8 h-8 flex items-center justify-center select-none">
              <Image
                src="/logo/newLogo.png"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain block dark:hidden"
              />
              <Image
                src="/logo/newlogodarkMode.png"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo/newLogo.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-auto object-contain block dark:hidden"
              />
              <Image
                src="/logo/newlogodarkMode.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-auto object-contain hidden dark:block"
              />
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                ProfileBase
              </span>
            </motion.div>
          )}
        </Link>

        {!isCollapsed && (
          <Button
            onClick={onClose ? onClose : () => setIsCollapsed(true)}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {onClose ? (
              <X className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Collapsed Toggle (Centered) */}
      {isCollapsed && !onClose && (
        <div className="w-full flex justify-center py-2 border-b border-dashed border-neutral-200 dark:border-neutral-800">
          <Button
            onClick={() => setIsCollapsed(false)}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 relative overflow-hidden overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="px-2 text-[10px] font-mono text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-2 pl-4">
            Workspace
          </p>
        )}

        <div className="space-y-0.5 relative">
          {navItems
            .filter((item) => item.title !== "Settings")
            .map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              // Calculate if this is literally the last item in the list
              const filteredItems = navItems.filter(
                (i) => i.title !== "Settings",
              );
              const isLast = index === filteredItems.length - 1;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block relative group"
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* SVG Tree Lines */}
                  {!isCollapsed && (
                    <div className="absolute left-[14px] top-0 bottom-0 w-6 pointer-events-none">
                      <svg
                        width="24"
                        height="100%"
                        className="overflow-visible"
                      >
                        {/* 1. Main Vertical Line */}
                        <line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2={isLast ? "24" : "100%"}
                          className="stroke-neutral-200 dark:stroke-neutral-800"
                          strokeWidth="1"
                          strokeDasharray="2 2" // Dashed line per request/style
                        />

                        {/* 2. Curved Branch */}
                        <path
                          d="M 1 24 C 1 24, 12 24, 12 24"
                          fill="none"
                          className={cn(
                            "stroke-neutral-200 dark:stroke-neutral-800 transition-colors duration-300",
                            isActive &&
                              "stroke-neutral-400 dark:stroke-neutral-600",
                          )}
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  )}

                  <motion.div
                    layout
                    className={cn(
                      "relative flex items-center rounded-md transition-all duration-200 z-10",
                      isCollapsed
                        ? "justify-center p-2.5"
                        : "gap-3 px-3 py-2 ml-7",
                      isActive
                        ? "text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50",
                    )}
                  >
                    {/* Active Indicator Collapsed */}
                    {isCollapsed && isActive && (
                      <div className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm rounded-md -z-10" />
                    )}

                    <Icon
                      className={cn(
                        "transition-all duration-200 shrink-0",
                        isCollapsed ? "w-5 h-5" : "w-4 h-4",
                        isActive
                          ? "text-neutral-900 dark:text-white scale-105"
                          : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300",
                      )}
                    />

                    {!isCollapsed && (
                      <motion.span
                        variants={navItemVariants}
                        className="whitespace-nowrap overflow-hidden text-sm font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 shrink-0 backdrop-blur-sm">
        <div className="space-y-1">
          {/* Settings Link */}
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800",
              pathname === "/dashboard/settings" &&
                "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white",
            )}
            title="Settings"
          >
            <Settings
              className={cn(
                "w-4 h-4 transition-transform group-hover:rotate-45",
                isCollapsed && "mx-auto",
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-rose-500/80 hover:text-rose-600 dark:text-rose-400/80 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title="Sign Out"
          >
            <LogOut
              className={cn(
                "w-4 h-4 transition-transform group-hover:-translate-x-0.5",
                isCollapsed && "mx-auto",
              )}
            />
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>

          {/* Divider */}
          <div className="my-2 h-px bg-neutral-200 dark:bg-neutral-800 border-t border-dashed border-neutral-300 dark:border-neutral-700 w-full" />

          {/* Mode Toggle & Info */}
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "justify-between px-1",
            )}
          >
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  v1.0.0
                </span>
              </div>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
