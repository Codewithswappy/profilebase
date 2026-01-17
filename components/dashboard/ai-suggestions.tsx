"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  checkAIStatus,
  aiQuickSuggest,
  aiAnalyzeCode,
  aiGenerateEvidence,
  aiAnalyzeProject,
} from "@/lib/actions/ai";
import {
  AISkillSuggestion,
  AIEvidenceSuggestion,
  AIAnalysisResult,
  CodeAnalysisResult,
} from "@/lib/ai-analyzer";
import {
  IconSparkles,
  IconWand,
  IconBrain,
  IconCode,
  IconBulb,
  IconLoader2,
  IconCheck,
  IconPlus,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ============================================
// AI STATUS INDICATOR
// ============================================

interface AIStatusBadgeProps {
  className?: string;
}

export function AIStatusBadge({ className }: AIStatusBadgeProps) {
  const [status, setStatus] = useState<{ enabled: boolean; checked: boolean }>({
    enabled: false,
    checked: false,
  });

  useEffect(() => {
    checkAIStatus().then((result) => {
      if (result.success) {
        setStatus({ enabled: result.data.enabled, checked: true });
      }
    });
  }, []);

  if (!status.checked) return null;

  return (
    <Badge
      variant={status.enabled ? "default" : "outline"}
      className={cn(
        "gap-1",
        status.enabled
          ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
          : "",
        className
      )}
    >
      <IconSparkles className="w-3 h-3" />
      AI {status.enabled ? "Enabled" : "Disabled"}
    </Badge>
  );
}

// ============================================
// QUICK SKILL SUGGESTER
// ============================================

interface QuickSkillSuggesterProps {
  onSelectSkill: (skill: { name: string; category: string }) => void;
  existingSkills?: string[];
}

export function QuickSkillSuggester({
  onSelectSkill,
  existingSkills = [],
}: QuickSkillSuggesterProps) {
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<AISkillSuggestion[]>([]);
  const [analyzing, startAnalyze] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!description.trim()) return;

    startAnalyze(async () => {
      setError(null);
      const result = await aiQuickSuggest(description);
      if (result.success) {
        // Filter out existing skills
        const filtered = result.data.filter(
          (s) =>
            !existingSkills.some(
              (e) => e.toLowerCase() === s.name.toLowerCase()
            )
        );
        setSuggestions(filtered);
      } else {
        setError(result.error);
      }
    });
  };

  const handleSelect = (skill: AISkillSuggestion) => {
    onSelectSkill({ name: skill.name, category: skill.category });
    setSuggestions((prev) => prev.filter((s) => s.name !== skill.name));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconWand className="w-4 h-4 text-purple-500" />
          AI Skill Suggester
        </CardTitle>
        <CardDescription>
          Describe your project and let AI suggest relevant skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="e.g., I built a full-stack e-commerce app with React, Node.js, and PostgreSQL that handles payments with Stripe..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !description.trim()}
            size="sm"
            className="w-full"
          >
            {analyzing ? (
              <>
                <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <IconSparkles className="w-4 h-4 mr-2" />
                Suggest Skills
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Suggested skills (click to add):
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => handleSelect(skill)}
                  className="group flex items-center gap-1 px-3 py-1.5 rounded-full border bg-purple-50 border-purple-200 hover:bg-purple-100 transition-all text-sm"
                >
                  <span>{skill.name}</span>
                  <span className="text-xs text-purple-500">
                    {skill.confidence}%
                  </span>
                  <IconPlus className="w-3 h-3 text-purple-500 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// CODE ANALYZER
// ============================================

interface CodeAnalyzerProps {
  onSkillsDetected?: (skills: AISkillSuggestion[]) => void;
}

export function CodeAnalyzer({ onSkillsDetected }: CodeAnalyzerProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [analyzing, startAnalyze] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = () => {
    if (!code.trim() || code.length < 20) return;

    startAnalyze(async () => {
      setError(null);
      const analysisResult = await aiAnalyzeCode(code);
      if (analysisResult.success) {
        setResult(analysisResult.data);
        if (onSkillsDetected && analysisResult.data.skills.length > 0) {
          onSkillsDetected(analysisResult.data.skills);
        }
      } else {
        setError(analysisResult.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconCode className="w-4 h-4 text-blue-500" />
          Code Analyzer
        </CardTitle>
        <CardDescription>
          Paste code to detect skills, patterns, and frameworks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={6}
          className="font-mono text-sm resize-none"
        />
        <Button
          onClick={handleAnalyze}
          disabled={analyzing || code.length < 20}
          size="sm"
          className="w-full"
        >
          {analyzing ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Code...
            </>
          ) : (
            <>
              <IconBrain className="w-4 h-4 mr-2" />
              Analyze Code
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge>{result.language}</Badge>
                {result.frameworks.map((fw) => (
                  <Badge key={fw} variant="outline">
                    {fw}
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <IconChevronUp className="w-4 h-4" />
                ) : (
                  <IconChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {result.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Detected Skills:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill) => (
                    <Badge
                      key={skill.name}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700"
                    >
                      {skill.name}
                      <span className="ml-1 opacity-60">
                        {skill.confidence}%
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {expanded && (
              <>
                {result.patterns.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Patterns & Practices:
                    </p>
                    <ul className="text-sm space-y-1">
                      {result.patterns.map((pattern, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <IconCheck className="w-3 h-3 text-green-500" />
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.qualityNotes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quality Notes:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {result.qualityNotes.map((note, i) => (
                        <li key={i}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// EVIDENCE SUGGESTER
// ============================================

interface EvidenceSuggesterProps {
  projectTitle: string;
  projectDescription?: string;
  skills: string[];
  onSelectEvidence?: (evidence: AIEvidenceSuggestion) => void;
}

export function EvidenceSuggester({
  projectTitle,
  projectDescription,
  skills,
  onSelectEvidence,
}: EvidenceSuggesterProps) {
  const [suggestions, setSuggestions] = useState<AIEvidenceSuggestion[]>([]);
  const [generating, startGenerate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (skills.length === 0) return;

    startGenerate(async () => {
      setError(null);
      const result = await aiGenerateEvidence(
        skills,
        projectTitle,
        projectDescription
      );
      if (result.success) {
        setSuggestions(result.data);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <IconBulb className="w-4 h-4 text-amber-500" />
          AI Evidence Suggestions
        </CardTitle>
        <CardDescription>
          Get ideas for evidence items based on your skills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add some skills first to get evidence suggestions
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 5} more
                </Badge>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              size="sm"
              className="w-full"
            >
              {generating ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <IconSparkles className="w-4 h-4 mr-2" />
                  Suggest Evidence
                </>
              )}
            </Button>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((evidence, index) => (
              <button
                key={index}
                onClick={() => onSelectEvidence?.(evidence)}
                className="w-full text-left p-3 rounded-lg border bg-amber-50/50 border-amber-200 hover:bg-amber-100/50 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{evidence.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {evidence.type}
                  </Badge>
                </div>
                {evidence.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {evidence.content}
                  </p>
                )}
                <p className="text-xs text-amber-600 mt-1">{evidence.reason}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// FULL PROJECT ANALYZER
// ============================================

interface ProjectAnalyzerProps {
  onAnalysisComplete?: (result: AIAnalysisResult) => void;
}

export function ProjectAnalyzer({ onAnalysisComplete }: ProjectAnalyzerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [readme, setReadme] = useState("");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [analyzing, startAnalyze] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showReadme, setShowReadme] = useState(false);

  const handleAnalyze = () => {
    if (!title.trim()) return;

    startAnalyze(async () => {
      setError(null);
      const analysisResult = await aiAnalyzeProject({
        title,
        description: description || undefined,
        readme: readme || undefined,
      });
      if (analysisResult.success) {
        setResult(analysisResult.data);
        onAnalysisComplete?.(analysisResult.data);
      } else {
        setError(analysisResult.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBrain className="w-5 h-5 text-purple-500" />
          AI Project Analyzer
        </CardTitle>
        <CardDescription>
          Analyze your project to auto-detect skills and generate evidence
          suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          />
          <Textarea
            placeholder="Describe your project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button
            onClick={() => setShowReadme(!showReadme)}
            className="text-sm text-primary hover:underline"
          >
            {showReadme
              ? "Hide README field"
              : "+ Add README content (optional)"}
          </button>

          {showReadme && (
            <Textarea
              placeholder="Paste README.md content for deeper analysis..."
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          )}
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !title.trim()}
          className="w-full"
        >
          {analyzing ? (
            <>
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Project...
            </>
          ) : (
            <>
              <IconSparkles className="w-4 h-4 mr-2" />
              Analyze with AI
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <IconAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 p-4 bg-linear-to-br from-purple-50 to-blue-50 rounded-lg border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{result.projectType}</Badge>
                <Badge variant="outline">{result.complexity}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>

            {result.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Detected Skills ({result.skills.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="px-2 py-1 rounded bg-white border text-sm"
                      title={skill.reason}
                    >
                      {skill.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {skill.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.evidence.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Suggested Evidence ({result.evidence.length}):
                </p>
                <div className="space-y-2">
                  {result.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-white border text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ev.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {ev.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ev.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
