"use client";

import { motion } from "motion/react";
import {
  FileText,
  BarChart3,
  Share2,
  Layout,
  Globe,
  MousePointer2,
  Eye,
  Download,
  Linkedin,
  Twitter,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IconBrandGoogle,
  IconBrandGoogleFilled,
  IconBrandLinkedinFilled,
  IconBrandTwitter,
  IconBrandTwitterFilled,
  IconBrandWebflow,
  IconBrandWhatsapp,
  IconFileText,
  IconLayout,
  IconLayout2,
  IconMan,
  IconPacman,
  IconShare,
  IconShare2,
  IconSocial,
  IconUser,
  IconUserFilled,
  IconX,
} from "@tabler/icons-react";
import { NewTwitterIcon } from "@hugeicons/core-free-icons";

// --- Visual Components ---

const PortfolioVisual = () => {
  return (
    <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Grid - subtle move */}
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"
      />

      {/* Browser Window Mockup */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl h-[120%] top-2 bg-white dark:bg-neutral-800 shadow-2xl border border-dashed border-neutral-200 dark:border-neutral-700 overflow-hidden relative z-10 aspect-[16/10]"
      >
        {/* Browser Toolbar */}
        <div className="h-8 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 flex items-center px-3 gap-2 relative z-20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white dark:bg-neutral-800 rounded px-3 py-0.5 text-[10px] text-neutral-400 font-medium flex items-center gap-1.5 border border-neutral-100 dark:border-neutral-700">
              <Globe className="w-2.5 h-2.5" />
              ProfileBase.site/Username
            </div>
          </div>
        </div>

        {/* Scrolling Profile Content */}
        <div className="relative h-full overflow-hidden bg-white dark:bg-neutral-800">
          <motion.div
            animate={{ y: [0, -120, 0] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="p-6 flex flex-col items-center gap-4"
          >
            {/* Header */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neutral-400 to-neutral-100 shadow-xl mb-2 border-4 border-white dark:border-neutral-700 relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-1 right-1 w-4 h-4 bg-lime-400 rounded-full border-2 border-white dark:border-neutral-800"
              />
            </div>
            <div className="space-y-2 text-center w-full max-w-xs">
              <div className="h-4 bg-neutral-800 dark:bg-white rounded w-3/4 mx-auto" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded w-full" />
              <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded w-2/3 mx-auto" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-24 bg-neutral-900 dark:bg-white rounded-full" />
              <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 p-3 shadow-sm transform hover:scale-105 transition-transform"
                >
                  <div
                    className={`w-8 h-8 rounded mb-3 ${i % 2 === 0 ? "bg-blue-100 text-blue-500" : "bg-purple-100 text-purple-500"}`}
                  />
                  <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Interactions */}
        <motion.div
          animate={{ x: [0, 80, 80, 0], y: [0, -40, -40, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-20 z-30 drop-shadow-xl"
        >
          <MousePointer2 className="w-6 h-6 fill-black text-white stroke-[1.5]" />
          <motion.div
            animate={{ scale: [1, 0.9, 1], opacity: [0, 1, 0] }}
            transition={{
              duration: 0.5,
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatDelay: 5.5,
            }}
            className="absolute -top-2 -left-2 w-10 h-10 bg-white/30 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

const AnalyticsVisual = () => {
  return (
    <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Main Chart Card */}
      <motion.div
        whileHover={{ y: -5 }}
        className="w-full max-w-[280px] bg-white dark:bg-neutral-800 shadow-xl border border-dashed border-neutral-100 dark:border-neutral-700 p-5 relative overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Total Visits
            </p>
            <div className="flex items-baseline gap-1">
              <motion.h4
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl font-bold text-neutral-900 dark:text-white mt-1"
              >
                8,420
              </motion.h4>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-emerald-50 dark:bg-emerald-500/10 text-lime-600 dark:text-lime-400 text-xs font-bold px-2 py-1 rounded-md border border-dashed flex items-center gap-1"
          >
            +69%{" "}
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
          </motion.div>
        </div>

        {/* Dynamic Graph */}
        <div className="h-24 flex items-end justify-between gap-1.5">
          {[30, 45, 35, 60, 50, 80, 75, 90, 60, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: "10%" }}
              whileInView={{ height: `${h}%` }}
              animate={{ height: [`${h}%`, `${h - 10}%`, `${h}%`] }}
              transition={{
                duration: 2 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
              className="flex-1 bg-neutral-900 dark:bg-white rounded-t-[2px] opacity-80 hover:opacity-100 hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm"
            />
          ))}
        </div>
      </motion.div>

      {/* Live Pill */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase font-bold px-3 py-1.5 rounded border border-dashed border-neutral-200 dark:border-neutral-700 shadow-lg flex items-center gap-2 z-20"
      >
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        Live
      </motion.div>
    </div>
  );
};

const ResumeVisual = () => {
  return (
    <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-6 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="relative w-48 perspective-[1000px]">
        {/* Background Docs */}
        <motion.div
          animate={{ rotate: [-4, -6, -4], x: [-10, -12, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white dark:bg-neutral-800 border border-dashed shadow-sm border-neutral-200 dark:border-neutral-700 opacity-60 h-[90%] md:h-[100%]"
        />

        {/* Main Document */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full aspect-[1/1.2] md:aspect-[1/1.4] bg-white dark:bg-neutral-800 border border-dashed shadow-2xl border-neutral-200 dark:border-neutral-700 p-4 flex flex-col gap-3 overflow-hidden"
        >
          {/* Doc Content */}
          <div className="flex gap-3 items-center border-b border-neutral-100 dark:border-neutral-700 pb-3">
            <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-700 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="h-2 w-20 bg-neutral-800 dark:bg-neutral-200 rounded-full" />
              <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-full" />
            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-full" />
            <div className="h-1.5 w-3/4 bg-neutral-100 dark:bg-neutral-700/50 rounded-full" />
          </div>
          <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded border border-dashed border-neutral-200 dark:border-neutral-700">
            <div className="h-1.5 w-1/3 bg-neutral-300 dark:bg-neutral-600 rounded-full mb-2" />
            <div className="flex gap-1">
              <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full" />
              <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            </div>
          </div>

          {/* Scanning Effect */}
          <motion.div
            initial={{ top: "-20%" }}
            animate={{ top: "120%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="absolute left-0 right-0 h-12 bg-gradient-to-b from-blue-500/10 to-transparent border-t-2 border-blue-500 shadow-[0_-4px_20px_rgba(59,130,246,0.3)]"
          />
        </motion.div>

        {/* Success Badge */}
        <motion.div
          animate={{ scale: [0.9, 1, 0.9], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -bottom-1 -right-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg py-2 px-3 shadow-xl flex items-center gap-2 border border-dashed border-white/20"
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px] font-bold">Export PDF</span>
        </motion.div>
      </div>
    </div>
  );
};

const ShareVisual = () => {
  return (
    <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center p-8 overflow-hidden bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:18px_18px]">
      {/* Floating Particles/Connections */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
        >
          <IconBrandLinkedinFilled className="w-5 h-5 text-blue-600" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-12 h-12 rounded border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
        >
          <IconBrandWhatsapp className="w-5 h-5 text-green-600" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 5,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
        >
          <IconBrandTwitterFilled className="w-5 h-5 text-black dark:text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 5,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/4 w-12 h-12 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center"
        >
          <IconBrandGoogleFilled className="w-5 h-5" />
        </motion.div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Input Field Mockup */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-neutral-800 shadow-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-2 pl-4 flex items-center gap-3 relative overflow-hidden"
        >
          <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="flex-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">
            ProfileBase.site/
            <span className="text-neutral-900 dark:text-white font-bold">
              Username
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>Copy</span>
          </motion.button>

          {/* Shine Effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </motion.div>

        {/* "Copied" Toast Mock - Fades in/out */}
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="absolute -bottom-12 left-0 right-0 mx-auto w-fit bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-dashed shadow-lg flex items-center gap-1.5"
        >
          <Check className="w-3 h-3" /> Link Copied
        </motion.div>
      </div>
    </div>
  );
};

// --- Layout Component ---

interface BentoItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const BentoItem = ({
  title,
  description,
  icon,
  children,
  className,
}: BentoItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-950 shadow-sm border border-dashed border-neutral-200 dark:border-neutral-800 group h-full flex flex-col",
        "hover:shadow-2xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50 transition-all duration-500",
        className,
      )}
    >
      {/* Visual Area */}
      <div className="relative flex-1 min-h-[50%] overflow-hidden bg-neutral-50 dark:bg-neutral-900/50">
        {children}
      </div>

      {/* Content Area */}
      <div className="relative z-10 p-4 flex flex-col justify-end bg-white dark:bg-neutral-950 border-t border-dashed border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start gap-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          <div className="w-12 h-12  bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function LandingBentoGrid() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[350px] md:auto-rows-[420px]">
        {/* 1. Portfolio (Large Left) */}
        <BentoItem
          title="One Page Portfolio"
          description="Your work, skills, and identity hosted on a stunning personal site."
          icon={<IconLayout2 className="w-6 h-6" />}
          className="md:col-span-4"
        >
          <PortfolioVisual />
        </BentoItem>

        {/* 2. Resume Builder (Standard Right) */}
        <BentoItem
          title="Smart Resume Builder"
          description="Transform your profile into ATS-ready PDFs instantly."
          icon={<IconFileText className="w-6 h-6" />}
          className="md:col-span-2"
        >
          <ResumeVisual />
        </BentoItem>

        {/* 3. Analytics (Standard Left) */}
        <BentoItem
          title="Real-Time Analytics"
          description="Know who is viewing your work and when."
          icon={<BarChart3 className="w-6 h-6" />}
          className="md:col-span-2"
        >
          <AnalyticsVisual />
        </BentoItem>

        {/* 4. Share (Large Right) */}
        <BentoItem
          title="Personal Shareable URL"
          description="Claim your unique username and share it everywhere."
          icon={<IconShare2 className="w-6 h-6" />}
          className="md:col-span-4"
        >
          <ShareVisual />
        </BentoItem>
      </div>
    </div>
  );
}
