"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  IconShieldLock,
  IconUserX,
  IconDeviceFloppy,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { confirm } = useConfirmDialog();

  // Mock function for password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Password reset email sent!", {
      description: "Check your inbox for instructions to reset your password.",
    });
    setIsLoading(false);
  };

  // Mock function for account deletion
  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account",
      description:
        "Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.",
      confirmText: "Delete My Account",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      toast.error("Account deletion is disabled in this demo.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-mono flex items-center gap-2">
          <IconShieldLock className="w-6 h-6" />
          Account Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Manage your security preferences and account data.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Security Section */}
        <div className=" border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Security
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <h3 className="text-sm font-medium mb-1">Reset Password</h3>
              <p className="text-xs text-neutral-500 mb-4">
                If you've forgotten your password or want to change it, we can
                send you a secure link.
              </p>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    className="border border-dashed border-neutral-400 rounded-none"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className=" border border-dashed border-red-200 dark:border-red-900 bg-red-50/50  dark:bg-red-900/50 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-white mb-4 flex items-center gap-2">
            <IconAlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-red-900 dark:text-red-100 ">
                Delete Account
              </h3>
              <p className="text-sm text-red-700 dark:text-white">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-red-600 dark:bg-red-900 hover:bg-red-700 dark:hover:bg-red-800 text-white cursor-pointer"
            >
              <IconUserX className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
