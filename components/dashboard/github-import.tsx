"use client";

import { useState, useEffect, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  checkGitHubConnection,
  getGitHubRepos,
  importGitHubRepo,
  RepoListItem,
  GitHubConnectionStatus,
} from "@/lib/actions/github";
import {
  IconBrandGithub,
  IconRefresh,
  IconCheck,
  IconStar,
  IconLock,
  IconDownload,
  IconLoader2,
  IconExternalLink,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ============================================
// COMPACT GITHUB IMPORT PANEL
// ============================================

interface GitHubImportPanelProps {
  onImported?: () => void;
  onClose?: () => void;
}

type ViewState = "loading" | "connect" | "repos" | "importing";

export function GitHubImportPanel({
  onImported,
  onClose,
}: GitHubImportPanelProps) {
  const [view, setView] = useState<ViewState>("loading");
  const [status, setStatus] = useState<GitHubConnectionStatus | null>(null);
  const [repos, setRepos] = useState<RepoListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Check connection and load repos on mount
  useEffect(() => {
    const init = async () => {
      const connResult = await checkGitHubConnection();
      if (connResult.success && connResult.data.isConnected) {
        setStatus(connResult.data);
        // Automatically load repos
        const reposResult = await getGitHubRepos();
        if (reposResult.success) {
          setRepos(reposResult.data);
        }
        setView("repos");
      } else {
        setView("connect");
      }
    };
    init();
  }, []);

  const handleConnect = async () => {
    await signIn("github", {
      callbackUrl: "/dashboard/projects?github=connected",
    });
  };

  const handleRefresh = async () => {
    setView("loading");
    const reposResult = await getGitHubRepos();
    if (reposResult.success) {
      setRepos(reposResult.data);
    }
    setView("repos");
  };

  const handleQuickImport = async (repo: RepoListItem) => {
    setImportingRepo(repo.fullName);
    setError(null);

    startTransition(async () => {
      // Quick import with defaults - user can edit after
      const result = await importGitHubRepo({
        repoFullName: repo.fullName,
        techStack: [], // Will be empty, user can add later
        status: "complete",
      });

      if (result.success) {
        // Mark as imported in local state
        setRepos(
          repos.map((r) =>
            r.fullName === repo.fullName ? { ...r, isImported: true } : r,
          ),
        );
        onImported?.();
      } else {
        setError(result.error || "Failed to import");
      }
      setImportingRepo(null);
    });
  };

  // Loading state
  if (view === "loading") {
    return (
      <div className="flex items-center justify-center py-6 text-neutral-400">
        <IconLoader2 className="w-4 h-4 animate-spin mr-2 opacity-50" />
        <span className="text-xs font-medium">Synced...</span>
      </div>
    );
  }

  // Connect GitHub state
  if (view === "connect") {
    return (
      <div className="text-center py-6 relative">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-2 -right-2 h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <IconX className="w-3.5 h-3.5" />
          </Button>
        )}
        <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 mb-3 shadow-sm">
          <IconBrandGithub className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="space-y-0.5 mb-4">
          <p className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
            Connect GitHub
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Import repositories with one click
          </p>
        </div>
        <Button
          onClick={handleConnect}
          size="sm"
          variant="outline"
          className="text-xs h-7 px-3 bg-white dark:bg-neutral-950 font-medium"
        >
          <IconBrandGithub className="w-3.5 h-3.5 mr-2" />
          Connect Account
        </Button>
      </div>
    );
  }

  // Repos list state
  const notImported = repos.filter((r) => !r.isImported);
  const imported = repos.filter((r) => r.isImported);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dashed border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {status?.avatarUrl ? (
            <img
              src={status.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-md ring-1 ring-neutral-200 dark:ring-neutral-800"
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800" />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-none">
              @{status?.username}
            </span>
            <span className="text-[9px] text-neutral-400 font-medium leading-none mt-0.5 uppercase tracking-wide">
              GitHub Connected
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            title="Refresh Repositories"
          >
            <IconRefresh className="w-3 h-3" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              title="Close"
            >
              <IconX className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-[10px] font-medium text-red-600 bg-red-50 dark:bg-red-900/10 px-2.5 py-1.5 rounded border border-red-100 dark:border-red-900/20">
          {error}
        </div>
      )}

      {/* Lists Container - Scrollable if long */}
      <div className="space-y-3 max-h-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {/* Already Imported */}
        {imported.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
              Imported
            </p>
            <div className="space-y-1">
              {imported.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-md text-neutral-500 bg-neutral-50/50 dark:bg-neutral-900/20 border border-transparent"
                >
                  <IconCheck className="w-3 h-3 text-emerald-500/70 shrink-0" />
                  <span className="text-[11px] font-medium truncate opacity-70 decoration-neutral-400 decoration-1">
                    {repo.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available to Import */}
        {notImported.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
              Available
            </p>
            <div className="relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent pointer-events-none z-10" />
              <div className="max-h-[340px] overflow-y-auto p-2 space-y-1 pr-1 pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {notImported.map((repo) => (
                  <div
                    key={repo.id}
                    className="group flex items-center justify-between px-2.5 py-2 rounded-md border border-neutral-100 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 hover:shadow-sm transition-all duration-200 min-h-[40px]"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {repo.isPrivate ? (
                        <IconLock className="w-3 h-3 text-neutral-400 shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                            {repo.name}
                          </span>
                          {repo.stars > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px] text-neutral-400 font-medium bg-neutral-50 dark:bg-neutral-900 px-1 py-0.5 rounded-sm">
                              <IconStar className="w-2.5 h-2.5" />
                              {repo.stars}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-medium leading-tight max-w-[95%]">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-white text-white dark:text-black text-[9px] font-bold tracking-wide rounded-[3px] ml-2"
                      onClick={() => handleQuickImport(repo)}
                      disabled={importingRepo === repo.fullName || isPending}
                    >
                      {importingRepo === repo.fullName ? (
                        <IconLoader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span className="flex items-center">IMPORT</span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {notImported.length === 0 && imported.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-neutral-400 font-medium">
              No repositories found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export for backwards compatibility
export { GitHubImportPanel as GitHubConnectionCard };
