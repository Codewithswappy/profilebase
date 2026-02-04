"use client";

import { Certificate } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { IconArrowUpRight } from "@tabler/icons-react";

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
      <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
        <h2 className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-500 tracking-wider uppercase flex items-center gap-2">
          // Certifications
        </h2>
        <span className="text-[10px] font-medium font-mono text-neutral-400 dark:text-neutral-600">
          // {certificates.length}
        </span>
      </div>

      <div className="relative pl-0 md:pl-0">
        {/* Vertical Timeline Line */}
        <div className="absolute left-0 top-[10px] bottom-0 w-px bg-linear-to-b from-neutral-200 via-neutral-200 to-transparent dark:from-neutral-800 dark:via-neutral-800 h-full" />

        <div className="space-y-6 relative">
          {displayed.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative pl-6 md:pl-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              {/* Horizontal Connector */}
              <div className="absolute left-0 top-[24px] w-[20px] md:w-[28px] h-px bg-neutral-200 dark:bg-neutral-800" />
              {/* Connector Node */}
              <div className="absolute left-0 top-[22px] w-1.5 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 ring-2 ring-white dark:ring-neutral-950" />

              <CertificateItem item={item} />
            </motion.div>
          ))}
        </div>
      </div>

      {certificates.length > 5 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-mono font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-2"
          >
            [{showAll ? "SHOW LESS" : "SHOW MORE"}]
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
    <div className="group relative flex items-center justify-between p-2 border border-dashed border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-300">
      <div className="flex items-center gap-4 text-left group-hover:translate-x-1 transition-transform duration-300">
        {/* Initials Icon Block */}
        <div className="w-8 h-8 rounded-sm bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0 text-neutral-500 dark:text-neutral-400 font-bold text-sm tracking-tighter shadow-sm border border-neutral-200 dark:border-neutral-800">
          {item.issuer.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-[13px] leading-tight">
            {item.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mt-1 font-mono">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              @{item.issuer}
            </span>
            <span className="opacity-30">|</span>
            <span className="">{formattedDate}</span>
          </div>
          {/* {item.credentialId && (
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              ID: {item.credentialId}
            </div>
          )} */}
        </div>
      </div>

      <div className="shrink-0 ml-4">
        {item.url ? (
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors transform group-hover:translate-x-1 duration-300 group-hover:-translate-y-1"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        ) : (
          <div className="p-2 text-neutral-300 dark:text-neutral-800 cursor-not-allowed">
            <ExternalLink className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
