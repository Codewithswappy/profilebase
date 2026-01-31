"use client";

import {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

interface ConfirmDialogContextType {
  confirm: ConfirmFn;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(
  null,
);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error(
      "useConfirmDialog must be used within a ConfirmDialogProvider",
    );
  }
  return context;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveRef, setResolveRef] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback<ConfirmFn>((opts = {}) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  };

  const isDestructive = options.variant === "destructive";

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <AlertDialogContent className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <AlertDialogHeader>
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                isDestructive
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {isDestructive ? (
                <IconTrash className="w-5 h-5" />
              ) : (
                <IconAlertTriangle className="w-5 h-5" />
              )}
            </div>
            <AlertDialogTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {options.title || "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
              {options.description || "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={handleCancel}
              className="border-neutral-200 dark:border-neutral-800"
            >
              {options.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                isDestructive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white"
              }
            >
              {options.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}
