import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * Used across shadcn UI components.
 *
 * @param  {...any} inputs - Class names, objects, or conditional arrays
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date or date string to a human-readable display string.
 *
 * @param {string|Date} dateInput
 * @returns {string} Formatted date (e.g. "Nov 4, 2026")
 */
export function formatDate(dateInput) {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
