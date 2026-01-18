"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

// ============================================
// DIALOG CONTEXT
// ============================================

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

// ============================================
// DIALOG ROOT
// ============================================

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

// ============================================
// DIALOG TRIGGER
// ============================================

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => onOpenChange(true),
    });
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

// ============================================
// DIALOG CONTENT
// ============================================

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={cn(
            "relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>

          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// DIALOG HEADER
// ============================================

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// DIALOG TITLE
// ============================================

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-bold text-neutral-900 dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </h2>
  );
}

// ============================================
// DIALOG DESCRIPTION
// ============================================

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-neutral-500 dark:text-neutral-400 mt-1",
        className,
      )}
    >
      {children}
    </p>
  );
}

// ============================================
// DIALOG FOOTER
// ============================================

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Dialog;
