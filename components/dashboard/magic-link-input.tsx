"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processMagicLink } from "@/lib/actions/magic";
import {
  IconLoader2,
  IconCheck,
  IconArrowRight,
  IconTerminal2,
  IconBrandGithub,
  IconTerminal,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MagicLinkInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    projectName: string;
    techStackCount: number;
  } | null>(null);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsProcessing(true);
    setResult(null);

    const res = await processMagicLink(url);

    if (res.success) {
      setResult(res.data);
      setUrl("");
      toast.success("Import successful", {
        description: `Analyzed ${res.data.projectName} and detected ${res.data.techStackCount} technologies.`,
      });
      router.refresh();

      // Clear result after 3 seconds to reset the view
      setTimeout(() => setResult(null), 4000);
    } else {
      console.error(res.error);
      toast.error("Import failed", {
        description: res.error || "Could not analyze the provided input.",
      });
    }
    setIsProcessing(false);
  };

  if (result) {
    return (
      <div className="p-3 border border-dashed border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-sm flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-6 h-6 rounded-sm bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
          <IconCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-emerald-800 dark:text-emerald-200 truncate">
            Imported <span className="font-bold">{result.projectName}</span>
          </p>
        </div>
        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
          +{result.techStackCount} skills
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-transparent dark:from-neutral-800 dark:via-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm pointer-events-none" />
      <div className="relative bg-white dark:bg-[#0A0A0A] border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm p-1 flex items-center shadow-sm transition-colors group-hover:border-neutral-400 dark:group-hover:border-neutral-700">
        <form
          onSubmit={handleProcess}
          className="flex items-center gap-2 w-full"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-500 shrink-0 ml-1 border border-dashed border-neutral-200 dark:border-neutral-800">
            <IconTerminal className="w-4 h-4" />
          </div>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="git clone <repo_url> or describe project..."
            className="border-none shadow-none focus-visible:ring-0 bg-transparent flex-1 h-9 text-xs font-mono placeholder:text-neutral-400 dark:text-neutral-300"
            disabled={isProcessing}
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            type="submit"
            disabled={!url.trim() || isProcessing}
            className={cn(
              "shrink-0 h-7 px-3 rounded-sm transition-all shadow-none text-[10px] font-mono uppercase tracking-wider",
              isProcessing
                ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"
                : "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:opacity-80",
            )}
            size="sm"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="w-3 h-3 animate-spin" />
                <span>Running_</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span>Run</span>
                <IconArrowRight className="w-3 h-3" />
              </div>
            )}
          </Button>
        </form>
      </div>
      {/* Helper text appearing below */}
      <div className="absolute top-full left-0 mt-1 pl-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
        <p className="text-[9px] text-neutral-400 font-mono">
          * Supports GitHub URLs or text descriptions
        </p>
      </div>
    </div>
  );
}
