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
      <div className="h-16 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
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
        <div className="w-full flex justify-center py-2 border-b border-neutral-200 dark:border-neutral-800">
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
      <div className="flex-1 py-6 px-2 relative overflow-hidden overflow-y-auto no-scrollbar">
        {!isCollapsed && (
          <p className="px-2 text-[10px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-4 mt-2 font-mono ml-3">
            Navigation
          </p>
        )}

        <div className="relative ml-1">
          {/* Vertical Rail - Gradient Fade */}
          {!isCollapsed && (
            <div className="absolute left-[4px] top-0 bottom-0 w-px bg-linear-to-b from-transparent via-neutral-200 dark:via-neutral-800 to-transparent z-0 opacity-80" />
          )}

          <div className="space-y-0.5 relative z-10">
            {navItems
              .filter((item) => item.title !== "Settings")
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block relative group"
                    title={isCollapsed ? item.title : undefined}
                  >
                    {/* Creative Connector - Only visible when not collapsed */}
                    {!isCollapsed && (
                      <div className="absolute left-[4px] top-0 bottom-0 w-6 pointer-events-none overflow-visible">
                        {/* The Node Dot (On the rail) - Pulsing when active */}
                        <motion.div
                          animate={{
                            scale: isActive ? 1 : 0,
                            opacity: isActive ? 1 : 0,
                            boxShadow: isActive
                              ? [
                                  "0 0 0 0px rgba(0,0,0,0)",
                                  "0 0 0 4px rgba(0,0,0,0.1)",
                                  "0 0 0 0px rgba(0,0,0,0)",
                                ]
                              : "none",
                          }}
                          transition={{
                            boxShadow: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            scale: { duration: 0.2 },
                          }}
                          className="absolute -left-[2.5px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-neutral-900 dark:bg-white z-20 ring-2 ring-white dark:ring-neutral-950"
                        />

                        {/* The Curved Line */}
                        <svg
                          className="absolute left-0 top-0 w-6 h-full overflow-visible"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            {/* Gradient: Fades from rail (transparent/light) to item (solid) */}
                            <linearGradient
                              id={`grad-${item.href}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop
                                offset="0%"
                                stopColor="currentColor"
                                stopOpacity="0"
                              />
                              <stop
                                offset="40%"
                                stopColor="currentColor"
                                stopOpacity="1"
                              />
                            </linearGradient>
                          </defs>

                          <motion.path
                            // Smooth curve from rail to item
                            d="M 0.5 0 L 0.5 20 C 0.5 20 8 20 20 20"
                            fill="none"
                            strokeWidth="1.5"
                            stroke={`url(#grad-${item.href})`}
                            className={cn(
                              "transition-all duration-300",
                              isActive
                                ? "text-neutral-900 dark:text-white opacity-100"
                                : "text-neutral-400 dark:text-neutral-600 opacity-0 group-hover:opacity-50",
                            )}
                            initial={{ pathLength: 0 }}
                            animate={{
                              pathLength: 1,
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />

                          {/* Active Tip Glow */}
                          {isActive && (
                            <motion.circle
                              cx="20"
                              cy="20"
                              r="1.5"
                              className="fill-neutral-900 dark:fill-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 }}
                            />
                          )}
                        </svg>
                      </div>
                    )}

                    <motion.div
                      layout
                      className={cn(
                        "relative flex items-center transition-all duration-300 group-hover:translate-x-1",
                        isCollapsed
                          ? "justify-center p-2 mb-2 w-10 h-10 mx-auto rounded-xl"
                          : "gap-3 px-2.5 py-2 ml-7 rounded-lg",
                        isActive
                          ? "bg-linear-to-r from-neutral-100 to-white dark:from-neutral-800 dark:to-neutral-900/50 text-neutral-900 dark:text-white font-medium shadow-sm border border-neutral-200/50 dark:border-neutral-800/50"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30",
                      )}
                    >
                      <Icon
                        className={cn(
                          "transition-all duration-200 shrink-0",
                          isCollapsed ? "w-5 h-5" : "w-4 h-4",
                          isActive
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-500 dark:text-neutral-400",
                        )}
                      />

                      {!isCollapsed && (
                        <motion.span
                          variants={navItemVariants}
                          className="whitespace-nowrap overflow-hidden text-sm"
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
      </div>

      {/* Footer */}
      <div className="py-4 px-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 shrink-0 backdrop-blur-sm">
        {/* Footer Navigation Tree */}
        <div className="relative ml-1">
          {/* Footer Rail - Fades out at bottom */}
          {!isCollapsed && (
            <div className="absolute left-[4px] -top-4 bottom-4 w-px bg-linear-to-b from-neutral-200 via-neutral-200 to-transparent dark:from-neutral-800 dark:via-neutral-800 dark:to-transparent z-0 opacity-80" />
          )}

          <div className="space-y-0.5 relative z-10">
            {/* Settings Item */}
            <Link
              href="/dashboard/settings"
              className="block relative group"
              title={isCollapsed ? "Settings" : undefined}
            >
              {!isCollapsed && (
                <div className="absolute left-[4px] top-0 bottom-0 w-6 pointer-events-none overflow-visible">
                  {/* Node Dot */}
                  <motion.div
                    animate={{
                      scale: pathname === "/dashboard/settings" ? 1 : 0,
                      opacity: pathname === "/dashboard/settings" ? 1 : 0,
                      boxShadow:
                        pathname === "/dashboard/settings"
                          ? [
                              "0 0 0 0px rgba(0,0,0,0)",
                              "0 0 0 4px rgba(0,0,0,0.1)",
                              "0 0 0 0px rgba(0,0,0,0)",
                            ]
                          : "none",
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      scale: { duration: 0.2 },
                    }}
                    className="absolute -left-[2.5px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-neutral-900 dark:bg-white z-20 ring-2 ring-white dark:ring-neutral-950"
                  />

                  {/* Connector Line */}
                  <svg
                    className="absolute left-0 top-0 w-6 h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="grad-settings"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity="0"
                        />
                        <stop
                          offset="40%"
                          stopColor="currentColor"
                          stopOpacity="1"
                        />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M 0.5 0 L 0.5 20 C 0.5 20 8 20 20 20"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="url(#grad-settings)"
                      className={cn(
                        "transition-all duration-300",
                        pathname === "/dashboard/settings"
                          ? "text-neutral-900 dark:text-white opacity-100"
                          : "text-neutral-400 dark:text-neutral-600 opacity-0 group-hover:opacity-50",
                      )}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    {pathname === "/dashboard/settings" && (
                      <motion.circle
                        cx="20"
                        cy="20"
                        r="1.5"
                        className="fill-neutral-900 dark:fill-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      />
                    )}
                  </svg>
                </div>
              )}

              <motion.div
                layout
                className={cn(
                  "relative flex items-center transition-all duration-300 group-hover:translate-x-1",
                  isCollapsed
                    ? "justify-center p-2 mb-2 w-10 h-10 mx-auto rounded-xl"
                    : "gap-3 px-2.5 py-2 ml-7 rounded-lg",
                  pathname === "/dashboard/settings"
                    ? "bg-linear-to-r from-neutral-100 to-white dark:from-neutral-800 dark:to-neutral-900/50 text-neutral-900 dark:text-white font-medium shadow-sm border border-neutral-200/50 dark:border-neutral-800/50"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30",
                )}
              >
                <Settings
                  className={cn(
                    "transition-all duration-300 shrink-0",
                    isCollapsed ? "w-5 h-5" : "w-4 h-4",
                    pathname === "/dashboard/settings"
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300",
                  )}
                />
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm">
                    Settings
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="block relative group w-full text-left"
              title={isCollapsed ? "Sign Out" : undefined}
            >
              {!isCollapsed && (
                <div className="absolute left-[4px] top-0 bottom-0 w-6 pointer-events-none overflow-visible">
                  <svg
                    className="absolute left-0 top-0 w-6 h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="grad-logout"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="currentColor"
                          stopOpacity="0"
                        />
                        <stop
                          offset="40%"
                          stopColor="currentColor"
                          stopOpacity="1"
                        />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M 0.5 0 L 0.5 20 C 0.5 20 8 20 20 20"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="url(#grad-logout)"
                      className="text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="1.5"
                      className="fill-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </svg>
                </div>
              )}

              <div
                className={cn(
                  "relative flex items-center transition-all duration-300 group-hover:translate-x-1",
                  isCollapsed
                    ? "justify-center p-2 mb-2 w-10 h-10 mx-auto rounded-xl"
                    : "gap-3 px-2.5 py-2 ml-7 rounded-lg",
                  "text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20",
                )}
              >
                <LogOut
                  className={cn(
                    "transition-all duration-300 shrink-0",
                    isCollapsed ? "w-5 h-5" : "w-4 h-4",
                  )}
                />
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm font-medium">
                    Sign Out
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div
          className={cn(
            "flex items-center pt-4",
            isCollapsed ? "justify-center" : "justify-end px-2",
          )}
        >
          <div className={cn(isCollapsed && "scale-125 origin-center")}>
            <ModeToggle />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
