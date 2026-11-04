"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shadcn-style Sheet / Slide-over Drawer component.
 * Supports side="left" (for mobile navigation) or side="right" (for patient details drawer).
 */
export function Sheet({ open, onOpenChange, children, side = "right" }) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    right: "right-0 top-0 h-full max-w-md w-full border-l animate-in slide-in-from-right",
    left: "left-0 top-0 h-full max-w-xs w-full border-r animate-in slide-in-from-left"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Drawer Container */}
      <div
        className={cn(
          "fixed bg-white shadow-2xl flex flex-col z-50 border-slate-200 transition ease-in-out duration-300",
          sideClasses[side] || sideClasses.right
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, children, onClose, ...props }) {
  return (
    <div
      className={cn(
        "p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

export function SheetTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-bold text-slate-900 tracking-tight", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-slate-500", className)}
      {...props}
    />
  );
}

export function SheetContent({ className, ...props }) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto p-5", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn("p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}
