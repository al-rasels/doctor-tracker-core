"use client";

import { usePathname } from "next/navigation";
import { Bell, HeartPulse, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pathname === "/") return "Executive Analytics & Operations";
    if (pathname.startsWith("/doctors")) return "Attending Doctors Directory";
    if (pathname.startsWith("/patients")) return "Master Patients Registry";
    return "Healthcare Portal";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{getPageTitle()}</h2>
        <p className="text-xs text-slate-500">Real-time clinical coordination & data synchronization</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
          <HeartPulse className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
          <span>MongoDB Atlas Sync: Active</span>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-slate-400">{user?.email || "admin@careguide.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
