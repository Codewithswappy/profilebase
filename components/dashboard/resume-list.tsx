"use client";

import { Resume } from "@prisma/client";
import {
  createResume,
  deleteResume,
  getPrimaryResumeId,
  setPrimaryResume,
  ResumeData,
} from "@/lib/actions/resume";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  IconFileText,
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconExternalLink,
  IconCopy,
  IconStar,
  IconCheck,
  IconEdit,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

interface ResumeListProps {
  initialResumes: Resume[];
  profileData: ResumeData; // To seed new resumes
}

export function ResumeList({ initialResumes, profileData }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  useEffect(() => {
    getPrimaryResumeId().then((res) => {
      if (res.success && res.data) setPrimaryId(res.data);
    });
  }, []);

  const handleSetPrimary = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const prevId = primaryId;
    // Toggle: if clicking the current primary, unset it
    const newId = primaryId === id ? null : id;

    setPrimaryId(newId); // Optimistic

    const res = await setPrimaryResume(newId);
    if (res.success) {
      toast.success(newId ? "Primary resume updated" : "Primary resume unset");
    } else {
      setPrimaryId(prevId);
      toast.error(res.error || "Failed to update primary resume");
    }
  };

  const BLANK_RESUME_DATA: ResumeData = {
    userName: "",
    email: "",
    profile: {
      headline: "",
      summary: "",
      location: "",
    },
    experiences: [],
    projects: [],
    education: [],
    skillsString: "",
    socialLinks: [],
  };

  const handleCreate = async (withSeed: boolean = true) => {
    setLoading(true);
    const result = await createResume(
      withSeed ? "Tailored Resume" : "Blank Resume",
      withSeed ? profileData : BLANK_RESUME_DATA,
    );
    if (result.success && result.data) {
      router.push(`/resume-editor/${result.data.id}`);
    } else {
      toast.error(!result.success ? result.error : "Failed to create resume");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = await confirm({
      title: "Delete Resume",
      description:
        "Are you sure you want to delete this resume? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    const res = await deleteResume(id);
    if (res.success) {
      setResumes(resumes.filter((r) => r.id !== id));
      if (primaryId === id) setPrimaryId(null);
      toast.success("Resume deleted");
    } else {
      toast.error("Failed to delete resume");
    }
  };

  const handleDuplicate = async (resume: Resume, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    const newResume = await createResume(
      `${resume.title} (Copy)`,
      resume.data as any,
    );
    if (newResume.success && newResume.data) {
      setResumes([newResume.data, ...resumes]);
      toast.success("Resume duplicated");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-dashed border-neutral-200 dark:border-neutral-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            My Resumes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage and create tailored resumes for your job applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleCreate(false)}
            disabled={loading}
            variant="outline"
            size="lg"
            className="gap-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-none shadow-none font-mono text-xs uppercase"
          >
            <IconFileText className="w-4 h-4" />
            Blank Page
          </Button>
          <Button
            onClick={() => handleCreate(true)}
            disabled={loading}
            size="lg"
            className="gap-2 bg-neutral-900 dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white shadow-none rounded-none border border-transparent font-mono text-xs uppercase"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <IconPlus className="w-4 h-4" /> Tailored (Profile)
              </>
            )}
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 border-dashed">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconFileText className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            No resumes yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">
            Create your first resume to get started. You can create multiple
            versions tailored to different jobs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => handleCreate(false)}
              variant="outline"
              className="border-dashed dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 font-mono text-xs uppercase"
            >
              Start from Blank
            </Button>
            <Button
              onClick={() => handleCreate(true)}
              className="bg-neutral-900 dark:bg-white dark:text-black font-mono text-xs uppercase font-bold"
            >
              Tailored (Profile)
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group flex flex-col w-full relative"
            >
              {/* Primary Badge */}
              {primaryId === resume.id && (
                <div className="absolute top-2 left-2 bg-neutral-900 dark:bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-1 z-20 flex items-center gap-1 shadow-sm font-mono tracking-wider">
                  <IconStar className="w-3 h-3 fill-current" /> Primary
                </div>
              )}

              {/* Preview Area - Aspect Video (matches user request) */}
              <div
                onClick={() => router.push(`/resume-editor/${resume.id}`)}
                className="aspect-video relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer group-hover:border-neutral-300 dark:group-hover:border-neutral-600 transition-colors"
              >
                {/* Visual Mock of Document */}
                <div className="absolute inset-0 p-6 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none bg-white dark:bg-neutral-950">
                  <div className="space-y-4 transform scale-[0.35] origin-top-left w-[285%]">
                    <div className="h-8 w-48 bg-neutral-800 dark:bg-neutral-200 mb-6" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800" />
                      <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800" />
                      <div className="h-4 w-4/6 bg-neutral-100 dark:bg-neutral-800" />
                      <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800" />
                      <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-800" />
                      <div className="h-20 w-full bg-neutral-50 dark:bg-neutral-900 mt-4 rounded border border-neutral-100 dark:border-neutral-800" />
                    </div>
                    <div className="space-y-2 mt-8">
                      <div className="h-6 w-32 bg-neutral-800 dark:bg-neutral-200 mb-2" />
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-2 h-2 bg-neutral-300 dark:bg-neutral-700 rounded-full mt-1.5" />
                          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay Title */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white dark:bg-neutral-900 text-black dark:text-white px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold border border-transparent dark:border-neutral-700 shadow-xl">
                    Edit Resume
                  </span>
                </div>
              </div>

              {/* Footer Actions Bar - Dashed Style */}
              <div className="flex items-stretch h-10 border-x border-b border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800 transition-colors mt-0">
                {/* Title */}
                <div
                  onClick={() => router.push(`/resume-editor/${resume.id}`)}
                  className="flex-1 flex items-center px-4 border-r border-dashed border-neutral-300 dark:border-neutral-800 text-xs font-mono truncate text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white cursor-pointer"
                >
                  <span className="truncate" title={resume.title}>
                    {resume.title}
                  </span>
                </div>

                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center w-10 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400 focus:outline-none">
                    <IconDotsVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 dark:bg-neutral-900 dark:border-neutral-800"
                  >
                    <DropdownMenuItem
                      onClick={(e) => handleSetPrimary(resume.id, e)}
                    >
                      {primaryId === resume.id ? (
                        <>
                          <IconCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-500 font-medium">
                            Unset Primary
                          </span>
                        </>
                      ) : (
                        <>
                          <IconStar className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400" />{" "}
                          Set as Primary
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/resume-editor/${resume.id}`);
                      }}
                    >
                      <IconEdit className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400" />{" "}
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDuplicate(resume, e)}
                    >
                      <IconCopy className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400" />{" "}
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(`/resume-editor/${resume.id}`, "_blank")
                      }
                    >
                      <IconExternalLink className="w-4 h-4 mr-2 text-neutral-500 dark:text-neutral-400" />{" "}
                      Open Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
                      onClick={(e) => handleDelete(resume.id, e)}
                    >
                      <IconTrash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Meta Info */}
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono uppercase">
                  {resume.templateId}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                  {formatDistanceToNow(new Date(resume.updatedAt))} ago
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
