"use client";

import { useState, useEffect, useTransition } from "react";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  checkGitHubConnection,
  getGitHubRepos,
  analyzeGitHubRepo,
  importGitHubRepo,
  createSkillsFromDetected,
  RepoListItem,
  GitHubConnectionStatus,
} from "@/lib/actions/github";
import { GitHubAnalysis, DetectedSkill, SuggestedEvidence } from "@/lib/github";
import {
  IconBrandGithub,
  IconRefresh,
  IconCheck,
  IconX,
  IconStar,
  IconLock,
  IconWorld,
  IconSparkles,
  IconDownload,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ============================================
// GITHUB CONNECTION CARD
// ============================================

interface GitHubConnectionCardProps {
  onConnected?: () => void;
}

export function GitHubConnectionCard({
  onConnected,
}: GitHubConnectionCardProps) {
  const [status, setStatus] = useState<GitHubConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    const result = await checkGitHubConnection();
    if (result.success) {
      setStatus(result.data);
      if (result.data.isConnected && onConnected) {
        onConnected();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    await signIn("github", {
      callbackUrl: "/dashboard/projects?github=connected",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <IconLoader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">
            Checking GitHub connection...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status?.isConnected) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {status.avatarUrl ? (
                <img
                  src={status.avatarUrl}
                  alt={status.username}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <IconBrandGithub className="w-6 h-6" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <IconCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">GitHub Connected</p>
              <p className="text-sm text-muted-foreground">
                @{status.username}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={checkConnection}>
              <IconRefresh className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBrandGithub className="w-5 h-5" />
          Connect GitHub
        </CardTitle>
        <CardDescription>
          Import your repositories and auto-detect skills from your code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <IconSparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Auto-detect skills</p>
              <p className="text-muted-foreground">
                We analyze your tech stack from languages, dependencies, and
                topics.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <IconDownload className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Generate evidence</p>
              <p className="text-muted-foreground">
                Create proof items from your repos with one click.
              </p>
            </div>
          </div>
          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full"
          >
            {connecting ? (
              <>
                <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <IconBrandGithub className="w-4 h-4 mr-2" />
                Connect with GitHub
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// REPOSITORY LIST
// ============================================

interface RepoListProps {
  onSelectRepo: (repo: RepoListItem) => void;
}

type VisibilityFilter = "all" | "public";

export function RepoList({ onSelectRepo }: RepoListProps) {
  const [repos, setRepos] = useState<RepoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      const result = await getGitHubRepos();
      if (result.success) {
        setRepos(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    fetchRepos();
  }, []);

  // Filter repos based on visibility setting
  const filteredRepos =
    visibilityFilter === "public"
      ? repos.filter((repo) => !repo.isPrivate)
      : repos;

  const publicCount = repos.filter((r) => !r.isPrivate).length;
  const privateCount = repos.filter((r) => r.isPrivate).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (repos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No repositories found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Visibility Filter */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <span className="text-xs text-muted-foreground mr-2">Show:</span>
        <button
          onClick={() => setVisibilityFilter("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            visibilityFilter === "all"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <IconWorld className="w-3.5 h-3.5" />
          All ({repos.length})
        </button>
        <button
          onClick={() => setVisibilityFilter("public")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            visibilityFilter === "public"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <IconWorld className="w-3.5 h-3.5" />
          Public Only ({publicCount})
        </button>
        {privateCount > 0 && visibilityFilter === "all" && (
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <IconLock className="w-3 h-3" />
            {privateCount} private
          </span>
        )}
      </div>

      {/* Repo List */}
      <div className="space-y-2">
        {filteredRepos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelectRepo(repo)}
            disabled={repo.isImported}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all",
              repo.isImported
                ? "bg-muted/50 opacity-60 cursor-not-allowed"
                : "hover:border-primary hover:bg-accent cursor-pointer",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {repo.isPrivate ? (
                    <IconLock className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <IconWorld className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium truncate">{repo.name}</span>
                  {repo.isPrivate && (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-600 border-amber-300"
                    >
                      Private
                    </Badge>
                  )}
                  {repo.isImported && (
                    <Badge variant="secondary" className="text-xs">
                      Imported
                    </Badge>
                  )}
                </div>
                {repo.description && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-1">
                      <IconStar className="w-3 h-3" />
                      {repo.stars}
                    </span>
                  )}
                </div>
              </div>
              {!repo.isImported && (
                <IconChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {filteredRepos.length === 0 && visibilityFilter === "public" && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No public repositories found.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setVisibilityFilter("all")}
              className="mt-2"
            >
              Show all repositories
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// REPO ANALYSIS VIEW
// ============================================

interface RepoAnalysisProps {
  repo: RepoListItem;
  onBack: () => void;
  onImported: () => void;
}

export function RepoAnalysis({ repo, onBack, onImported }: RepoAnalysisProps) {
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedEvidence, setSelectedEvidence] = useState<Set<number>>(
    new Set(),
  );
  const [importing, startImport] = useTransition();

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      setError(null);
      const result = await analyzeGitHubRepo(repo.fullName);
      if (result.success) {
        setAnalysis(result.data);
        // Auto-select high confidence skills
        const autoSelected = new Set(
          result.data.detectedSkills
            .filter((s) => s.confidence >= 80)
            .map((s) => s.name),
        );
        setSelectedSkills(autoSelected);
        // Auto-select high confidence evidence
        const autoEvidence = new Set(
          result.data.suggestedEvidence
            .map((_, i) => i)
            .filter(
              (_, i) => result.data.suggestedEvidence[i].confidence >= 80,
            ),
        );
        setSelectedEvidence(autoEvidence);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    analyze();
  }, [repo.fullName]);

  const toggleSkill = (name: string) => {
    const newSet = new Set(selectedSkills);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedSkills(newSet);
  };

  const toggleEvidence = (index: number) => {
    const newSet = new Set(selectedEvidence);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedEvidence(newSet);
  };

  const handleImport = () => {
    if (!analysis) return;

    startImport(async () => {
      // First create skills
      const skillsToCreate = analysis.detectedSkills
        .filter((s) => selectedSkills.has(s.name))
        .map((s) => ({ name: s.name, category: s.category }));

      const skillResult = await createSkillsFromDetected(skillsToCreate);

      if (!skillResult.success) {
        setError(skillResult.error);
        return;
      }

      // Then import repo with evidence
      const evidenceToImport = analysis.suggestedEvidence.filter((_, i) =>
        selectedEvidence.has(i),
      );

      const importResult = await importGitHubRepo({
        repoFullName: repo.fullName,
        selectedSkills: skillResult.data,
        selectedEvidence: evidenceToImport,
      });

      if (importResult.success) {
        onImported();
      } else {
        setError(importResult.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          ← Back to repositories
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <IconLoader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 font-medium">Analyzing {repo.name}...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Detecting skills and generating evidence suggestions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          ← Back to repositories
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <IconX className="w-8 h-8 text-red-500 mx-auto" />
            <p className="mt-2 text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} size="sm">
        ← Back to repositories
      </Button>

      {/* Repo Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <IconBrandGithub className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{analysis.repo.name}</h2>
              <p className="text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {analysis.repo.stars > 0 && (
                <Badge variant="secondary">
                  <IconStar className="w-3 h-3 mr-1" />
                  {analysis.repo.stars}
                </Badge>
              )}
              {analysis.repo.language && (
                <Badge>{analysis.repo.language}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detected Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconSparkles className="w-4 h-4 text-primary" />
            Detected Skills
          </CardTitle>
          <CardDescription>
            Select skills to add to your profile ({selectedSkills.size}{" "}
            selected)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.detectedSkills.map((skill) => (
              <button
                key={skill.name}
                onClick={() => toggleSkill(skill.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-all",
                  selectedSkills.has(skill.name)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:border-primary hover:bg-accent",
                )}
              >
                {skill.name}
                <span className="ml-1 opacity-60">{skill.confidence}%</span>
              </button>
            ))}
          </div>
          {analysis.detectedSkills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills detected.</p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconDownload className="w-4 h-4 text-primary" />
            Suggested Evidence
          </CardTitle>
          <CardDescription>
            Select evidence items to import ({selectedEvidence.size} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysis.suggestedEvidence.map((evidence, index) => (
            <button
              key={index}
              onClick={() => toggleEvidence(index)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                selectedEvidence.has(index)
                  ? "bg-primary/10 border-primary"
                  : "hover:border-primary hover:bg-accent",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center",
                      selectedEvidence.has(index)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {selectedEvidence.has(index) && (
                      <IconCheck className="w-3 h-3" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{evidence.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {evidence.type}
                </Badge>
              </div>
              {evidence.content && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 ml-7">
                  {evidence.content}
                </p>
              )}
              {evidence.url && (
                <p className="text-xs text-blue-600 mt-1 ml-7 truncate">
                  {evidence.url}
                </p>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Import Button */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={
            importing ||
            (selectedSkills.size === 0 && selectedEvidence.size === 0)
          }
          className="flex-1"
        >
          {importing ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <IconDownload className="w-4 h-4 mr-2" />
              Import to Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN GITHUB IMPORT PANEL
// ============================================

interface GitHubImportPanelProps {
  onImported?: () => void;
}

export function GitHubImportPanel({ onImported }: GitHubImportPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<RepoListItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImported = () => {
    setSelectedRepo(null);
    setRefreshKey((k) => k + 1);
    onImported?.();
  };

  if (!isConnected) {
    return <GitHubConnectionCard onConnected={() => setIsConnected(true)} />;
  }

  if (selectedRepo) {
    return (
      <RepoAnalysis
        repo={selectedRepo}
        onBack={() => setSelectedRepo(null)}
        onImported={handleImported}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Import from GitHub</h3>
          <p className="text-sm text-muted-foreground">
            Select a repository to analyze and import
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          <IconRefresh className="w-4 h-4" />
        </Button>
      </div>
      <RepoList key={refreshKey} onSelectRepo={setSelectedRepo} />
    </div>
  );
}
