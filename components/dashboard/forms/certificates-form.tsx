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
  IconCertificate,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconPencil,
  IconExternalLink,
  IconAward,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { Certificate } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface CertificatesFormProps {
  initialData: Certificate[];
}

export function CertificatesForm({ initialData }: CertificatesFormProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
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
        toast.success("Certificate updated successfully");
      } else {
        await addCertificate(payload);
        toast.success("Certificate added successfully");
      }

      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("Failed to save certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Certificate",
      description:
        "Are you sure you want to delete this certificate? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteCertificate(id);
      toast.success("Certificate deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
          <IconAward className="w-4 h-4" />
          Certifications
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] font-mono uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <IconPlus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        )}
      </div>

      {/* List of Certificates */}
      {!isAdding && (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {(initialData || []).length === 0 && (
            <div className="p-8 text-center text-neutral-500 text-xs font-mono uppercase tracking-wide">
              No certifications added yet.
            </div>
          )}
          {(initialData || []).map((item) => (
            <div
              key={item.id}
              className="p-5 flex items-start justify-between group hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                  <IconCertificate className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono mt-1">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      @{item.issuer}
                    </span>
                    <span className="opacity-50">|</span>
                    <span>{format(new Date(item.date), "MMM yyyy")}</span>
                  </div>
                  {item.credentialId && (
                    <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wide mt-1">
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
                    className="h-7 w-7 inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 text-neutral-500"
                  >
                    <IconExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-sm"
                  onClick={() => handleEdit(item)}
                >
                  <IconPencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <IconTrash className="w-3.5 h-3.5" />
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
          className="p-5 space-y-4 animate-in slide-in-from-top-2 bg-neutral-50/30 dark:bg-neutral-900/30"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Name
              </Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. AWS Certified Solutions Architect"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Issuer
              </Label>
              <Input
                required
                value={formData.issuer}
                onChange={(e) =>
                  setFormData({ ...formData, issuer: e.target.value })
                }
                placeholder="e.g. Amazon Web Services"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Date
              </Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-neutral-500">
                Credential ID (Optional)
              </Label>
              <Input
                value={formData.credentialId}
                onChange={(e) =>
                  setFormData({ ...formData, credentialId: e.target.value })
                }
                placeholder="e.g. ABC-123-XYZ"
                className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase text-neutral-500">
              URL (Optional)
            </Label>
            <Input
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
              className="h-9 font-mono text-xs bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-8 font-mono text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-mono text-xs uppercase font-bold rounded-sm"
            >
              {isLoading ? (
                <IconLoader2 className="w-3 h-3 animate-spin" />
              ) : editingId ? (
                "Update Cert"
              ) : (
                <>
                  <IconPlus className="w-3 h-3 mr-1" /> Add Cert
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
