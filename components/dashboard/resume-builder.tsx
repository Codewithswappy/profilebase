"use client";

import { useState, useEffect, useRef } from "react";
import { FullProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  IconUser,
  IconBriefcase,
  IconCode,
  IconDownload,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconSettings,
  IconLayoutSidebar,
  IconMail,
  IconMapPin,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconWorld,
  IconLink,
  IconGripVertical,
  IconPalette,
  IconFileText,
  IconChevronDown,
  IconChevronUp,
  IconZoomIn,
  IconZoomOut,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconTypography,
  IconClick,
  IconX,
  IconShare,
  IconSpacingVertical,
  IconLetterSpacing,
  IconCopy,
  IconFilePlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion, Reorder, AnimatePresence } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

// --- Types & Constants ---
import { Resume } from "@prisma/client";

interface ResumeBuilderProps {
  resume?: Resume;
  initialData?: any;
}

type TemplateType = "modern" | "classic" | "minimal" | "ats-clean";

interface ResumeStyle {
  primaryColor: string;
  fontFamily: string;
  fontSize: number; // base size scaling
  lineHeight: number;
  margins: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right" | "justify";
}

// --- Icons Helper ---
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return <IconBrandGithub className="w-3.5 h-3.5" />;
    case "linkedin":
      return <IconBrandLinkedin className="w-3.5 h-3.5" />;
    case "twitter":
    case "x":
      return <IconBrandTwitter className="w-3.5 h-3.5" />;
    default:
      return <IconLink className="w-3.5 h-3.5" />;
  }
};

// --- FONT LOADER ---
const FontLoader = () => (
  <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&family=Roboto:wght@400;500;700&family=Source+Sans+3:wght@400;600&display=swap");
  `}</style>
);

// --- HTML RENDERER ---
const RichContent = ({
  content,
  style,
}: {
  content: string | null;
  style?: any;
}) => {
  if (!content) return null;
  // Check if content is likely HTML (from Tiptap)
  if (content.trim().startsWith("<")) {
    return (
      <div
        className="prose prose-sm max-w-none dark:prose-invert [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:my-1 [&>h1]:text-lg [&>h2]:text-base empty:hidden"
        style={{
          fontSize: "inherit",
          lineHeight: "inherit",
          color: "inherit",
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  // Fallback for legacy plain text
  const lines = content.split("\n").filter((t: string) => t.trim());
  return lines.length > 0 ? (
    <ul className="list-disc list-outside ml-4 space-y-1">
      {lines.map((item: string, idx: number) => (
        <li key={idx} className="pl-1 leading-relaxed">
          {item.trim()}
        </li>
      ))}
    </ul>
  ) : (
    <p className="leading-relaxed">{content}</p>
  );
};

// --- INTERACTIVE ELEMENTS (Click-to-Select-Wrapper) ---
const EditableElement = ({
  children,
  onClick,
  isActive,
  className,
  style,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    className={cn(
      "border border-transparent transition-all duration-200 cursor-pointer hover:border-lime-200 hover:bg-lime-50/10 relative group",
      isActive && "border-lime-500 bg-lime-50/20",
      className,
    )}
    style={style}
  >
    {isActive && (
      <div className="absolute -top-2.5 -right-2.5 bg-lime-500 text-white p-0.5 rounded-full shadow-sm z-50 print:hidden scale-0 group-hover:scale-100 transition-transform">
        <IconClick className="w-2.5 h-2.5" />
      </div>
    )}
    {children}
  </div>
);

// --- TEMPLATES ---

const TemplateATSClean = ({
  data,
  settings,
  style,
  onSelect,
  activeId,
}: {
  data: any;
  settings: any;
  style: ResumeStyle;
  onSelect: (id: string, type: "text" | "section", path?: string) => void;
  activeId: string | null;
}) => {
  const { profile, experiences, projects, socialLinks } = data;

  return (
    <div
      className="flex flex-col gap-4 text-black"
      style={{
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        lineHeight: style.lineHeight,
        textAlign: "left", // ATS prefers left align
      }}
    >
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-4">
        <EditableElement
          isActive={activeId === "name"}
          onClick={() => onSelect("name", "text", "userName")}
        >
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
            {data.userName}
          </h1>
        </EditableElement>

        <div className="flex flex-wrap gap-x-4 text-sm mb-2">
          {profile.location && <span>{profile.location}</span>}
          {data.email && <span>{data.email}</span>}
          {socialLinks?.map((link: any) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              className="underline"
            >
              {link.platform}
            </a>
          ))}
        </div>
        {profile.headline && (
          <p className="text-md font-semibold">{profile.headline}</p>
        )}
      </header>

      {/* Components */}
      {settings.showSummary && profile.summary && (
        <section>
          <h3 className="text-sm font-bold uppercase border-b border-black mb-2">
            Professional Summary
          </h3>
          <EditableElement
            isActive={activeId === "summary"}
            onClick={() => onSelect("summary", "text", "profile.summary")}
          >
            <div className="text-sm">
              <RichContent content={profile.summary} />
            </div>
          </EditableElement>
        </section>
      )}

      {data.skillsString && (
        <section>
          <h3 className="text-sm font-bold uppercase border-b border-black mb-2">
            Skills
          </h3>
          <div className="text-sm break-words">{data.skillsString}</div>
        </section>
      )}

      {settings.showExperience && experiences?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3">
            Work Experience
          </h3>
          <div className="space-y-4">
            {experiences.map((exp: any, idx: number) => (
              <EditableElement
                key={idx}
                isActive={activeId === `exp-${idx}`}
                onClick={() =>
                  onSelect(`exp-${idx}`, "section", `experiences.${idx}`)
                }
              >
                <div className="flex justify-between font-bold text-sm">
                  <span>
                    {exp.position}, {exp.company}
                  </span>
                  <span>
                    {exp.startDate ? new Date(exp.startDate).getFullYear() : ""}{" "}
                    –{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : "Present"}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  <RichContent content={exp.description} />
                </div>
              </EditableElement>
            ))}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section>
          <h3 className="text-sm font-bold uppercase border-b border-black mb-3">
            Education
          </h3>
          <div className="space-y-2">
            {data.education.map((edu: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="font-bold">{edu.school}</span> —{" "}
                  <span>{edu.degree}</span>
                </div>
                <span>{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const TemplateModern = ({
  data,
  settings,
  style,
  onSelect,
  activeId,
}: {
  data: any;
  settings: any;
  style: ResumeStyle;
  onSelect: (id: string, type: "text" | "section", path?: string) => void;
  activeId: string | null;
}) => {
  const { profile, experiences, projects, socialLinks } = data;

  // Dynamic Styles
  const containerStyle = {
    fontFamily:
      style.fontFamily === "serif"
        ? "Times New Roman, serif"
        : style.fontFamily === "mono"
          ? "Courier New, monospace"
          : style.fontFamily,
    fontSize: `${style.fontSize}px`,
    lineHeight: style.lineHeight,
    color: "#171717",
    textAlign: style.textAlign,
  };

  const h1Style = {
    color: style.primaryColor,
    letterSpacing: `${style.letterSpacing}px`,
  };
  const sectionTitleStyle = {
    color: style.primaryColor,
    letterSpacing: "0.1em",
  };

  return (
    <div className="flex flex-col gap-6" style={containerStyle as any}>
      <FontLoader />
      {/* Header */}
      <header className="border-b border-neutral-200 pb-5">
        <EditableElement
          isActive={activeId === "name"}
          onClick={() => onSelect("name", "text", "userName")}
        >
          <h1
            className="text-4xl font-extrabold uppercase tracking-tight mb-2"
            style={h1Style}
          >
            {data.userName}
          </h1>
        </EditableElement>

        {profile.headline && (
          <EditableElement
            isActive={activeId === "headline"}
            onClick={() => onSelect("headline", "text", "profile.headline")}
          >
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-3">
              {profile.headline}
            </p>
          </EditableElement>
        )}

        <div
          className={cn(
            "flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9em] font-medium text-neutral-500",
            style.textAlign === "center" && "justify-center",
            style.textAlign === "right" && "justify-end",
          )}
        >
          {profile.location && (
            <EditableElement
              isActive={activeId === "location"}
              onClick={() => onSelect("location", "text", "profile.location")}
            >
              <div className="flex items-center gap-1">
                <IconMapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
            </EditableElement>
          )}
          {settings.showEmail && data.email && (
            <div className="flex items-center gap-1">
              <IconMail className="w-3 h-3" />
              <span>{data.email}</span>
            </div>
          )}
          {socialLinks?.slice(0, 4).map((link: any) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              className="flex items-center gap-1 hover:text-black"
            >
              <span className="text-neutral-400">
                {getSocialIcon(link.platform)}
              </span>
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      </header>

      {/* Components */}
      {settings.showSummary && profile.summary && (
        <section>
          <h3
            className="text-xs font-bold uppercase border-b border-neutral-100 pb-1 mb-2"
            style={sectionTitleStyle}
          >
            Summary
          </h3>
          <EditableElement
            isActive={activeId === "summary"}
            onClick={() => onSelect("summary", "text", "profile.summary")}
          >
            <div className="text-sm text-neutral-700">
              <RichContent content={profile.summary} />
            </div>
          </EditableElement>
        </section>
      )}

      {data.skillsString && (
        <section>
          <h3
            className="text-xs font-bold uppercase border-b border-neutral-100 pb-1 mb-2"
            style={sectionTitleStyle}
          >
            Skills
          </h3>
          <p className="text-sm text-neutral-700">{data.skillsString}</p>
        </section>
      )}

      {settings.showExperience && experiences?.length > 0 && (
        <section>
          <h3
            className="text-xs font-bold uppercase border-b border-neutral-100 pb-1 mb-3"
            style={sectionTitleStyle}
          >
            Experience
          </h3>
          <div className="space-y-5">
            {experiences.map((exp: any, idx: number) => (
              <EditableElement
                key={exp.id || exp._tempId}
                isActive={activeId === `exp-${idx}`}
                onClick={() =>
                  onSelect(`exp-${idx}`, "section", `experiences.${idx}`)
                }
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-sm">{exp.position}</h4>
                  <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap ml-4">
                    {exp.startDate ? new Date(exp.startDate).getFullYear() : ""}{" "}
                    –{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).getFullYear()
                      : "Present"}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mb-2 font-medium">
                  {exp.company}
                </div>
                <div className="text-sm">
                  <RichContent content={exp.description} />
                </div>
              </EditableElement>
            ))}
          </div>
        </section>
      )}

      {settings.showProjects && projects?.length > 0 && (
        <section>
          <h3
            className="text-xs font-bold uppercase border-b border-neutral-100 pb-1 mb-3"
            style={sectionTitleStyle}
          >
            Projects
          </h3>
          <div className="space-y-4">
            {projects.map((proj: any, idx: number) => (
              <EditableElement
                key={proj.id || proj._tempId}
                isActive={activeId === `proj-${idx}`}
                onClick={() =>
                  onSelect(`proj-${idx}`, "section", `projects.${idx}`)
                }
              >
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    {proj.title}
                    {(proj.repoUrl || proj.demoUrl) && (
                      <IconLink className="w-3 h-3 text-neutral-400" />
                    )}
                  </h4>
                </div>
                {proj.techStack && (
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1">
                    {Array.isArray(proj.techStack)
                      ? proj.techStack.join(" • ")
                      : proj.techStack}
                  </div>
                )}
                <div className="text-sm">
                  <RichContent content={proj.description} />
                </div>
              </EditableElement>
            ))}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section>
          <h3
            className="text-xs font-bold uppercase border-b border-neutral-100 pb-1 mb-3"
            style={sectionTitleStyle}
          >
            Education
          </h3>
          <div className="space-y-3">
            {data.education.map((edu: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-baseline text-sm"
              >
                <div>
                  <span className="font-bold block text-sm">{edu.school}</span>
                  <span className="text-neutral-600 text-xs">{edu.degree}</span>
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {edu.year}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- MAIN BUILDER ---

export function ResumeBuilder({ resume, initialData }: ResumeBuilderProps) {
  // --- STATE ---

  // Data State (Resume content)
  const [data, setData] = useState<any>(() => {
    if (resume?.data) {
      // Handle both stringified JSON and pre-parsed object depending on Prisma result
      return typeof resume.data === "string"
        ? JSON.parse(resume.data)
        : resume.data;
    }
    // Seed from profile
    return {
      userName: initialData?.userName || "Your Name",
      email: initialData?.email || "",
      profile: initialData?.profile || {
        headline: "",
        summary: "",
        location: "",
      },
      experiences: initialData?.experiences || [],
      projects: initialData?.projects || [],
      education: initialData?.education || [
        {
          school: "University of Technology",
          degree: "B.Sc. CS",
          year: "2020-2024",
        },
      ],
      skillsString: initialData?.skillsString || "",
      socialLinks: initialData?.socialLinks || [],
    };
  });

  // Style State
  const defaultStyle: ResumeStyle = {
    primaryColor: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: 1.5,
    margins: 15,
    letterSpacing: 0,
    textAlign: "left",
  };

  const [style, setStyle] = useState<ResumeStyle>(() => {
    if (resume) {
      return {
        primaryColor: resume.primaryColor ?? defaultStyle.primaryColor,
        fontFamily: resume.fontFamily ?? defaultStyle.fontFamily,
        fontSize: resume.fontSize ?? defaultStyle.fontSize,
        lineHeight: resume.lineHeight ?? defaultStyle.lineHeight,
        margins: resume.margins ?? defaultStyle.margins,
        letterSpacing: 0,
        textAlign: "left",
      };
    }
    return defaultStyle;
  });

  const [settings, setSettings] = useState({
    showEmail: true,
    showSummary: true,
    showExperience: true,
    showProjects: true,
    showTechStack: true,
  });

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>(
    (resume?.templateId as TemplateType) || "modern",
  );
  const [zoom, setZoom] = useState(0.85);
  const [activeTab, setActiveTab] = useState("create");

  // Selection State
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: "text" | "section";
    path?: string;
  } | null>(null);

  // --- ACTIONS ---

  const handleValueChange = (val: string) => {
    if (!selectedItem?.path) return;
    const updatePath = (obj: any, path: string[], value: any): any => {
      const [head, ...tail] = path;
      if (!tail.length) return { ...obj, [head]: value };
      const index = parseInt(head);
      if (!isNaN(index) && Array.isArray(obj)) {
        const newArr = [...obj];
        newArr[index] = updatePath(newArr[index], tail, value);
        return newArr;
      }
      return { ...obj, [head]: updatePath(obj[head], tail, value) };
    };
    const pathParts = selectedItem.path.split(".");
    setData((prev: any) => updatePath(prev, pathParts, val));
  };

  const getValue = (): string => {
    if (!selectedItem?.path) return "";
    const pathParts = selectedItem.path.split(".");
    let current = data;
    for (const part of pathParts) {
      if (current === undefined || current === null) return "";
      const index = parseInt(part);
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[part];
      }
    }
    return current as string;
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex h-screen w-full bg-neutral-100 dark:bg-[#0c0c0c] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR (Content & Templates) */}
      <div className="w-[300px] shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20 h-full shadow-lg">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center shadow-lg shadow-neutral-500/20">
            <IconFileText className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block">
              ProfileBase
            </span>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">
              Resume Builder
            </span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pb-2">
            <TabsList className="w-full grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <TabsTrigger value="create" className="text-xs font-semibold">
                Create
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs font-semibold">
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          {/* CREATE TAB */}
          <TabsContent
            value="create"
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin"
          >
            {[
              {
                id: "personal",
                icon: IconUser,
                title: "Personal Information",
                content: (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-neutral-500">
                          First Name
                        </Label>
                        <Input
                          className="h-8 text-xs bg-neutral-50"
                          value={data.userName.split(" ")[0]}
                          onChange={(e) =>
                            setData({
                              ...data,
                              userName: `${e.target.value} ${data.userName.split(" ").slice(1).join(" ")}`,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-neutral-500">
                          Last Name
                        </Label>
                        <Input
                          className="h-8 text-xs bg-neutral-50"
                          value={data.userName.split(" ").slice(1).join(" ")}
                          onChange={(e) =>
                            setData({
                              ...data,
                              userName: `${data.userName.split(" ")[0]} ${e.target.value}`,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-neutral-500">
                        Job Title
                      </Label>
                      <Input
                        className="h-8 text-xs bg-neutral-50"
                        value={data.profile.headline}
                        onChange={(e) =>
                          setData({
                            ...data,
                            profile: {
                              ...data.profile,
                              headline: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-neutral-500">
                        Email
                      </Label>
                      <Input
                        className="h-8 text-xs bg-neutral-50"
                        value={data.email}
                        onChange={(e) =>
                          setData({ ...data, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: "experience",
                icon: IconBriefcase,
                title: "Employment History",
                content: (
                  <div className="space-y-3 pt-2">
                    <Reorder.Group
                      axis="y"
                      values={data.experiences}
                      onReorder={(newExp) =>
                        setData({ ...data, experiences: newExp })
                      }
                    >
                      {data.experiences.map((exp: any) => (
                        <Reorder.Item
                          key={exp.id || exp._tempId}
                          value={exp}
                          className="group flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-md shadow-sm mb-2 hover:border-lime-400 transition-colors"
                        >
                          <IconGripVertical className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">
                              {exp.position}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">
                              {exp.company}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setData({
                                ...data,
                                experiences: data.experiences.filter(
                                  (e: any) => e !== exp,
                                ),
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed text-neutral-500"
                      onClick={() =>
                        setData({
                          ...data,
                          experiences: [
                            {
                              _tempId: Date.now().toString(),
                              position: "Position",
                              company: "Company",
                              description: "",
                            },
                            ...data.experiences,
                          ],
                        })
                      }
                    >
                      <IconPlus className="w-3 h-3 mr-1" /> Add Employment
                    </Button>
                  </div>
                ),
              },
              {
                id: "projects",
                icon: IconCode,
                title: "Projects",
                content: (
                  <div className="space-y-3 pt-2">
                    <Reorder.Group
                      axis="y"
                      values={data.projects}
                      onReorder={(newProjs) =>
                        setData({ ...data, projects: newProjs })
                      }
                    >
                      {data.projects.map((proj: any) => (
                        <Reorder.Item
                          key={proj.id || proj._tempId}
                          value={proj}
                          className="group flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-md shadow-sm mb-2 hover:border-lime-400 transition-colors"
                        >
                          <IconGripVertical className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">
                              {proj.title}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">
                              {proj.techStack?.join(", ")}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setData({
                                ...data,
                                projects: data.projects.filter(
                                  (p: any) => p !== proj,
                                ),
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed text-neutral-500"
                      onClick={() =>
                        setData({
                          ...data,
                          projects: [
                            {
                              _tempId: Date.now().toString(),
                              title: "Project Name",
                              techStack: [],
                              description: "",
                            },
                            ...data.projects,
                          ],
                        })
                      }
                    >
                      <IconPlus className="w-3 h-3 mr-1" /> Add Project
                    </Button>
                  </div>
                ),
              },
              {
                id: "education",
                icon: IconUser,
                title: "Education",
                content: (
                  <div className="space-y-3 pt-2">
                    {(!data.education || data.education.length === 0) && (
                      <div className="text-xs text-neutral-400 text-center italic mb-2">
                        No education added
                      </div>
                    )}
                    {(data.education || []).map((edu: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 bg-white border border-neutral-200 rounded-md shadow-sm mb-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">
                            {edu.school}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate">
                            {edu.degree}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newEdu = [...data.education];
                            newEdu.splice(i, 1);
                            setData({ ...data, education: newEdu });
                          }}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed text-neutral-500"
                      onClick={() => {
                        const newEdu = [
                          ...(data.education || []),
                          {
                            school: "University",
                            degree: "Bachelor's Degree",
                            year: "2024",
                          },
                        ];
                        setData({ ...data, education: newEdu });
                      }}
                    >
                      <IconPlus className="w-3 h-3 mr-1" /> Add Education
                    </Button>
                  </div>
                ),
              },
              {
                id: "skills",
                icon: IconCode,
                title: "Skills",
                content: (
                  <div className="space-y-3 pt-2">
                    <Textarea
                      value={data.skillsString || ""}
                      onChange={(e) =>
                        setData({ ...data, skillsString: e.target.value })
                      }
                      placeholder="Comma separated skills (e.g. React, Node.js)"
                      className="h-20 text-xs"
                    />
                    <p className="text-[10px] text-neutral-400">
                      Comma separated list of top skills.
                    </p>
                  </div>
                ),
              },
            ].map((section) => (
              <Collapsible
                key={section.id}
                defaultOpen={section.id === "personal"}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full group py-1">
                  <span className="text-xs font-bold flex items-center gap-2 text-neutral-700 group-hover:text-black">
                    {section.title}
                  </span>
                  <IconChevronDown className="w-3 h-3 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {section.content || (
                    <div className="p-4 text-xs text-neutral-400 text-center italic">
                      Section content available in full editor
                    </div>
                  )}
                </CollapsibleContent>
                <Separator className="mt-4" />
              </Collapsible>
            ))}
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent
            value="templates"
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {[
              { id: "modern", name: "Modern", color: "bg-white" },
              { id: "ats-clean", name: "ATS Clean", color: "bg-white" },
              { id: "classic", name: "Classic", color: "bg-[#fdfbf6]" },
              { id: "minimal", name: "Minimal", color: "bg-white" },
            ].map((tmplt) => (
              <button
                key={tmplt.id}
                onClick={() => setActiveTemplate(tmplt.id as any)}
                className={cn(
                  "w-full aspect-[210/297] rounded-lg border-2 overflow-hidden relative transition-all hover:scale-[1.02]",
                  activeTemplate === tmplt.id
                    ? "border-lime-500 shadow-md ring-2 ring-lime-500/20"
                    : "border-transparent",
                  tmplt.color,
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-400">
                  {tmplt.name}
                </div>
              </button>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* 2. CENTER: CANVAS + FLOATING TOOLS */}
      <div className="flex-1 flex flex-col relative bg-[#F3F4F6] dark:bg-[#111]">
        {/* Top Header */}
        <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-neutral-500">
              <span>Home</span> <span className="text-neutral-300">/</span>{" "}
              <span>Project</span> <span className="text-neutral-300">/</span>{" "}
              <span className="text-black dark:text-white">My Resume</span>
            </div>
            <div className="h-4 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-lime-600 bg-lime-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />{" "}
                Saved
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-500"
              >
                <IconArrowBackUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-500"
              >
                <IconArrowForwardUp className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-neutral-200 mx-1" />
              <span className="text-xs font-mono w-10 text-center text-neutral-600">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-9 text-xs border-neutral-300 shadow-sm"
            >
              <IconDownload className="w-3.5 h-3.5 mr-2" /> Download
            </Button>
            <Button className="h-9 text-xs bg-lime-600 hover:bg-lime-700 text-white shadow-sm shadow-lime-500/20">
              <IconShare className="w-3.5 h-3.5 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div
          className="flex-1 overflow-auto flex justify-center p-12 cursor-default relative"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.2 }}
            id="resume-paper"
            className="bg-white text-black shadow-2xl origin-top z-10 print:shadow-none print:m-0 print:scale-100 relative group/paper"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: `${style.margins}mm`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating Paper Tools */}
            <div className="absolute -right-12 top-0 flex flex-col gap-2 opacity-0 group-hover/paper:opacity-100 transition-opacity">
              {[
                { icon: IconFilePlus, label: "Add Page" },
                { icon: IconCopy, label: "Duplicate" },
                { icon: IconTrash, label: "Delete" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded-lg shadow-sm border border-neutral-200 text-neutral-400 hover:text-black hover:border-neutral-300 cursor-pointer transition-all"
                  title={item.label}
                >
                  <item.icon className="w-4 h-4" />
                </div>
              ))}
            </div>

            {activeTemplate === "ats-clean" ? (
              <TemplateATSClean
                data={data}
                settings={settings}
                style={style}
                onSelect={(id, type, path) =>
                  setSelectedItem({ id, type, path })
                }
                activeId={selectedItem?.id || null}
              />
            ) : (
              <TemplateModern
                data={data}
                settings={settings}
                style={style}
                onSelect={(id, type, path) =>
                  setSelectedItem({ id, type, path })
                }
                activeId={selectedItem?.id || null}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (Tools) */}
      <div className="w-[300px] shrink-0 flex flex-col border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20 h-full shadow-lg">
        {/* Tools Header */}
        <div className="p-4 border-b border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
            Design Tools
          </h3>

          {/* Quick Alignment */}
          <div className="grid grid-cols-4 gap-1 mb-6">
            {[
              IconAlignLeft,
              IconAlignCenter,
              IconAlignRight,
              IconAlignJustified,
            ].map((Icon, i) => (
              <button
                key={i}
                onClick={() =>
                  setStyle({
                    ...style,
                    textAlign: ["left", "center", "right", "justify"][i] as any,
                  })
                }
                className={cn(
                  "flex items-center justify-center h-8 rounded hover:bg-neutral-100",
                  style.textAlign === ["left", "center", "right", "justify"][i]
                    ? "bg-lime-50 text-lime-600"
                    : "text-neutral-500",
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {/* Edit Text Context */}
          {selectedItem && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-neutral-900">
                  Edit Text
                </Label>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-neutral-400 hover:text-black"
                >
                  <IconX className="w-3 h-3" />
                </button>
              </div>
              <RichTextEditor
                value={getValue()}
                onChange={(val) => handleValueChange(val)}
                className="min-h-[200px] text-sm shadow-sm"
                placeholder="Type content here..."
              />
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                <IconTypography className="w-3 h-3" /> Supports Markdown
                shortcuts
              </div>
              <Separator />
            </div>
          )}

          {/* Typography */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-neutral-900">
              Typography
            </Label>
            <div className="space-y-2">
              <Select
                value={style.fontFamily || "Inter, sans-serif"}
                onValueChange={(v) => {
                  const fontFamily: string = v ?? "Inter, sans-serif";
                  setStyle((s) => ({ ...s, fontFamily }));
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">
                    Inter (Sans)
                  </SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                  <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                  <SelectItem value="Source Sans 3, sans-serif">
                    Source Sans
                  </SelectItem>
                  <SelectItem value="serif">Times New Roman (Serif)</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    className="h-8 text-xs pl-8"
                    value={style.fontSize}
                    onChange={(e) =>
                      setStyle({ ...style, fontSize: Number(e.target.value) })
                    }
                  />
                  <span className="absolute left-2.5 top-2 text-[10px] text-neutral-400">
                    Px
                  </span>
                </div>
                <div className="flex items-center border rounded-md px-1 gap-1">
                  <div
                    className="h-4 w-4 rounded bg-black"
                    style={{ backgroundColor: style.primaryColor }}
                  />
                  <Input
                    className="h-6 border-none p-0 text-xs w-full focus-visible:ring-0"
                    value={style.primaryColor}
                    onChange={(e) =>
                      setStyle({ ...style, primaryColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Spacing */}
          <div className="space-y-4">
            <Label className="text-xs font-bold text-neutral-900">
              Spacing & Layout
            </Label>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IconSpacingVertical className="w-4 h-4 text-neutral-400 shrink-0" />
                <Slider
                  value={[style.lineHeight]}
                  min={1}
                  max={2}
                  step={0.1}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    setStyle({ ...style, lineHeight: v });
                  }}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-6 text-right">
                  {style.lineHeight}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <IconLetterSpacing className="w-4 h-4 text-neutral-400 shrink-0" />
                <Slider
                  value={[style.letterSpacing]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    setStyle({ ...style, letterSpacing: v });
                  }}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-6 text-right">
                  {style.letterSpacing}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <IconLayoutSidebar className="w-4 h-4 text-neutral-400 shrink-0" />
                <Slider
                  value={[style.margins]}
                  min={5}
                  max={30}
                  step={1}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    setStyle({ ...style, margins: v });
                  }}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono w-6 text-right">
                  {style.margins}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Formatting */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-neutral-900">
              Style Effects
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[IconBold, IconItalic, IconUnderline, IconStrikethrough].map(
                (Icon, i) => (
                  <Button key={i} variant="outline" size="sm" className="h-8">
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          #resume-paper,
          #resume-paper * {
            visibility: visible;
          }
          #resume-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: ${style.margins}mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
