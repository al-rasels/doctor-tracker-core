import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shadcn-style Button variant definitions using class-variance-authority (cva).
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow hover:bg-blue-500 shadow-blue-500/20",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-500 shadow-red-500/20",
        outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 text-slate-700",
        secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        link: "text-blue-600 underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

/**
 * Reusable Shadcn Button component.
 */
export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
