"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { HeartPulse, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

/**
 * Responsive Header component with mobile drawer toggle and live status indicator.
 *
 * @param {Object} props
 * @param {Function} props.onMenuToggle - Triggers mobile sidebar drawer
 */
export function Header({ onMenuToggle }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pathname === "/") return "Executive Analytics & Operations";
    if (pathname.startsWith("/doctors")) return "Attending Doctors Directory";
    if (pathname.startsWith("/patients")) return "Master Patients Registry";
    return "Healthcare Management";
  };

  const getPageSubtitle = () => {
    if (pathname === "/") return "Live telemetry & clinical aggregations";
    if (pathname.startsWith("/doctors")) return "Physician profiles & patient assignments";
    if (pathname.startsWith("/patients")) return "Active diagnoses & attending doctor records";
    return "Clinical operations management";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      {/* Right: DB Sync Status + User Chip */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* MongoDB Sync indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/80">
          <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-600 shrink-0" />
          <span>MongoDB Atlas Sync: Connected</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User profile avatar */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200/60 shadow-xs">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {user?.email || "admin@careguide.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
