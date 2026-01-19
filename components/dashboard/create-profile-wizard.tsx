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
      router.refresh(); // Reload to show dashboard
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Welcome to SkillDock</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile. You can change these details later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="create-profile-form"
            action={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="slug">Profile URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  skilldock.site/
                  <span className="text-primary font-bold">
                    {slugInput || "your-username"}
                  </span>
                </span>
                <Input
                  id="slug"
                  name="slug"
                  required
                  placeholder="your-username"
                  className="font-mono"
                  onChange={(e) => setSlugInput(e.target.value)} // Added to simulate watchSlug
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lowercase alphanumeric and hyphens only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                placeholder="Full Stack Developer specialized in React & Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="Briefly describe your experience and what you're looking for..."
                rows={4}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="submit" form="create-profile-form" disabled={isLoading}>
            {isLoading ? "Creating Profile..." : "Create Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
