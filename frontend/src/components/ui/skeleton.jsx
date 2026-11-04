import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shadcn-style Skeleton loading placeholder component.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
      {...props}
    />
  );
}
