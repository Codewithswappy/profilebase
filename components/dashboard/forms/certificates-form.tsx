"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/lib/actions/certificates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { Certificate } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CertificatesFormProps {
  initialData: Certificate[];
}

export function CertificatesForm({ initialData }: CertificatesFormProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    url: "",
    date: "",
    credentialId: "",
  });

  function resetForm() {
    setFormData({
      name: "",
      issuer: "",
      url: "",
      date: "",
      credentialId: "",
    });
    setEditingId(null);
    setIsAdding(false);
  }

  function handleEdit(item: Certificate) {
    setFormData({
      name: item.name,
      issuer: item.issuer,
      url: item.url || "",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      credentialId: item.credentialId || "",
    });
    setEditingId(item.id);
    setIsAdding(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        issuer: formData.issuer,
        url: formData.url || undefined,
        date: new Date(formData.date),
        credentialId: formData.credentialId || undefined,
      };

      if (editingId) {
        await updateCertificate(editingId, payload);
      } else {
        await addCertificate(payload);
      }

      resetForm();
      router.refresh();
    } catch (error) {
      console.error("Failed to save certificate", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    setIsLoading(true);
    try {
      await deleteCertificate(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete certificate", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden mt-6">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-3.5 h-3.5" />
          Certifications
        </p>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {/* List of Certificates */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {(initialData || []).length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-sm">
              No certifications added yet.
            </div>
          )}
          {(initialData || []).map((item) => (
            <div
              key={item.id}
              className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      @{item.issuer}
                    </span>
                    <span className="opacity-50">|</span>
                    <span>{format(new Date(item.date), "MMM yyyy")}</span>
                  </div>
                  {item.credentialId && (
                    <p className="text-[10px] text-neutral-400 font-mono">
                      ID: {item.credentialId}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Name
              </Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. AWS Certified Solutions Architect"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Issuer
              </Label>
              <Input
                required
                value={formData.issuer}
                onChange={(e) =>
                  setFormData({ ...formData, issuer: e.target.value })
                }
                placeholder="e.g. Amazon Web Services"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Date
              </Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase text-neutral-400">
                Credential ID (Optional)
              </Label>
              <Input
                value={formData.credentialId}
                onChange={(e) =>
                  setFormData({ ...formData, credentialId: e.target.value })
                }
                placeholder="e.g. ABC-123-XYZ"
                className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-neutral-400">
              URL (Optional)
            </Label>
            <Input
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
              className="h-9 bg-neutral-50 dark:bg-neutral-950/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : editingId ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
