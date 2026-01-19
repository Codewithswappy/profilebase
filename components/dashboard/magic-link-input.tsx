"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processMagicLink } from "@/lib/actions/magic";
import {
  IconWand,
  IconLoader2,
  IconCheck,
  IconArrowRight,
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
      toast.success("Magic import complete!", {
        description: `Imported ${res.data.projectName}`,
      });
      router.refresh();
    } else {
      console.error(res.error);
      toast.error("Import failed", {
        description: res.error || "Unknown error occurred",
      });
    }
    setIsProcessing(false);
  };

  if (result) {
    return (
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-md flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <IconCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Success! Import Complete
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
            Created project <b>{result.projectName}</b> with{" "}
            <b>{result.techStackCount}</b> technologies detected.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setResult(null)}
          className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50 h-8 text-xs"
        >
          New Import
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900/50 rounded-md p-1 shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-800 transition-all hover:ring-neutral-200 dark:hover:ring-neutral-700">
      <form onSubmit={handleProcess} className="flex items-center gap-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 shrink-0 ml-1">
          <IconWand className="w-4 h-4" />
        </div>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL or tell us what you shipped..."
          className="border-none shadow-none focus-visible:ring-0 bg-transparent flex-1 h-10 text-sm placeholder:text-neutral-400"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          disabled={!url.trim() || isProcessing}
          className={cn(
            "shrink-0 h-8 rounded-md transition-all shadow-none", // Reduced height and shadow
            isProcessing
              ? "w-24 bg-neutral-100 text-neutral-500"
              : "w-8 sm:w-auto bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200",
          )}
          size="sm"
        >
          {isProcessing ? (
            <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <IconArrowRight className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
