// Resume Template Components
export { ModernTemplate } from "./modern-template";
export { MinimalTemplate } from "./minimal-template";
export { ClassicTemplate } from "./classic-template";
export { ExecutiveTemplate } from "./executive-template";
export { ProfessionalTemplate } from "./professional-template";
export { CreativeTemplate } from "./creative-template";

// Template metadata for UI
export const TEMPLATE_CONFIGS = [
  {
    id: "modern" as const,
    name: "Modern",
    description: "Clean & contemporary with blue accents",
    category: "tech",
    atsScore: 85,
  },
  {
    id: "minimal" as const,
    name: "Minimal",
    description: "Simple, ATS-optimized serif design",
    category: "traditional",
    atsScore: 95,
  },
  {
    id: "professional" as const,
    name: "Professional",
    description: "Maximum ATS compatibility",
    category: "corporate",
    atsScore: 98,
  },
  {
    id: "classic" as const,
    name: "Classic",
    description: "Traditional formal style",
    category: "traditional",
    atsScore: 90,
  },
  {
    id: "executive" as const,
    name: "Executive",
    description: "Premium design for senior roles",
    category: "executive",
    atsScore: 80,
  },
  {
    id: "creative" as const,
    name: "Creative",
    description: "Vibrant sidebar for design roles",
    category: "creative",
    atsScore: 65,
  },
] as const;

export type TemplateId = (typeof TEMPLATE_CONFIGS)[number]["id"];
