"use client";

import { Certificate } from "@prisma/client";
import { ExternalLink, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface CertificatesSectionProps {
  certificates: Certificate[];
}

export function CertificatesSection({
  certificates,
}: CertificatesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (certificates.length === 0) return null;

  // Sort by date desc
  const sorted = [...certificates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const displayed = showAll ? sorted : sorted.slice(0, 5);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-bold font-mono text-neutral-400 dark:text-neutral-600 tracking-tight uppercase text-xs">
          // Certifications
        </h2>
        <span className="text-[10px] font-medium font-mono text-neutral-500">
          ({certificates.length})
        </span>
      </div>

      <div className="grid gap-2">
        {displayed.map((item) => (
          <CertificateItem key={item.id} item={item} />
        ))}
      </div>

      {certificates.length > 5 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-1.5 shadow-sm hover:shadow active:scale-95 duration-200"
          >
            {showAll ? "Show Less" : "Show More"}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showAll && "rotate-180",
              )}
            />
          </button>
        </div>
      )}
    </section>
  );
}

function CertificateItem({ item }: { item: Certificate }) {
  // Format date as DD.MM.YYYY
  const formattedDate = new Date(item.date)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join(".");

  return (
    <div className="group relative flex items-center justify-between p-2 border hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300">
      <div className="flex items-center gap-4 text-left">
        {/* Placeholder Icon - could be dynamic if we had logos */}
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center shrink-0 text-neutral-500 dark:text-neutral-400 font-bold text-xs">
          {item.issuer.substring(0, 2).toUpperCase()}
        </div>

        <div className="border-l  pl-2">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-[13px]">
            {item.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-neutral-500 mt-1">
            <span className="text-neutral-600 dark:text-neutral-400">
              @{item.issuer}
            </span>
            <span className="opacity-30">|</span>
            <span className="font-mono">{formattedDate}</span>
          </div>
        </div>
      </div>

      {item.url && (
        <Link
          href={item.url}
          target="_blank"
          className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
          >
            <path
              d="M1 11L11 1M11 1H3M11 1V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
