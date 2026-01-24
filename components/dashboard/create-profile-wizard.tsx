"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket, AlertCircle } from "lucide-react";
import { IconRocket, IconRocketOff } from "@tabler/icons-react";

export function CreateProfileWizard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slugInput, setSlugInput] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const slug = formData.get("slug") as string;
    const headline = formData.get("headline") as string;
    const summary = formData.get("summary") as string;

    const result = await createProfile({ slug, headline, summary });

    if (result.success) {
      router.refresh();
      // Redirect handled by layout/server action often, but router.push works too
      router.push("/dashboard");
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="border border-dashed border-neutral-800 bg-neutral-950 rounded-xl p-1 shadow-2xl">
        <div className="bg-neutral-900/50 rounded-lg p-8 border border-neutral-900">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Welcome to ProfileBase
            </h1>
            <p className="text-neutral-400">
              Let&apos;s set up your profile. You can change these details
              later.
            </p>
          </div>

          <form
            id="create-profile-form"
            action={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label htmlFor="slug" className="text-neutral-200">
                Profile URL
              </Label>
              <div className="bg-neutral-950/50 border border-dashed border-neutral-800 rounded-lg p-1 flex items-center focus-within:border-neutral-600 transition-colors">
                <span className="text-neutral-500 pl-4 py-3 text-sm font-mono border-r border-dashed border-neutral-800 pr-3">
                  ProfileBase.site/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  required
                  placeholder="your-username"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white font-bold h-auto py-3 pl-3 font-mono placeholder:text-neutral-700"
                  onChange={(e) => setSlugInput(e.target.value)}
                />
              </div>
              <p className="text-xs text-neutral-600 pl-1">
                Lowercase alphanumeric and hyphens only.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="headline" className="text-neutral-200">
                Headline
              </Label>
              <Input
                id="headline"
                name="headline"
                placeholder="Full Stack Developer specialized in React & Node.js"
                className="bg-neutral-950/50 border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-neutral-700 focus-visible:border-neutral-600 h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="summary" className="text-neutral-200">
                Summary
              </Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="Briefly describe your experience and what you're looking for..."
                rows={4}
                className="bg-neutral-950/50 border-neutral-800 text-white placeholder:text-neutral-700 focus-visible:ring-neutral-700 focus-visible:border-neutral-600 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                form="create-profile-form"
                disabled={isLoading}
                className="bg-white text-black hover:bg-neutral-200 font-bold px-8 h-12 rounded-full"
              >
                {isLoading ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
