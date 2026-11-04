"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  Activity,
  LogOut,
  ShieldCheck,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetHeader, SheetTitle, SheetContent } from "@/components/ui/sheet";

/**
 * Shared navigation items across desktop and mobile menus.
 */
const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Doctors Directory", href: "/doctors", icon: Stethoscope },
  { label: "Patients Registry", href: "/patients", icon: Users },
];

/**
 * Pure navigation link list with active route styling.
 */
function NavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-1.5">
      <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Management Portal
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * User account footer with sign out action.
 */
function UserFooter() {
  const { logout, user } = useAuth();

  return (
    <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
      <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-800/70 rounded-xl border border-slate-700/50">
        <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
          {user?.name?.charAt(0) || "A"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</p>
          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="capitalize">{user?.role || "Admin"}</span>
          </p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

/**
 * Responsive Sidebar Component.
 * - Desktop: Sticky vertical navigation bar (hidden on mobile)
 * - Mobile: Slide-over drawer sheet triggered by hamburger button
 *
 * @param {Object} props
 * @param {boolean} props.mobileOpen - Controls mobile slide-over drawer
 * @param {Function} props.setMobileOpen - Toggles mobile drawer
 */
export function Sidebar({ mobileOpen = false, setMobileOpen }) {
  return (
    <>
      {/* 1. Desktop Static Sidebar (Visible on screens >= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-100 flex-col border-r border-slate-800 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight text-white tracking-tight truncate">Care Guide</h1>
            <p className="text-xs text-blue-400 font-medium tracking-wide">Doctor Tracker Core</p>
          </div>
        </div>

        {/* Links */}
        <NavLinks />

        {/* User Footer */}
        <UserFooter />
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer (Screens < 1024px) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <div className="h-full bg-slate-900 text-slate-100 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Care Guide</h2>
                  <p className="text-[11px] text-blue-400">Doctor Tracker</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen?.(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavLinks onNavigate={() => setMobileOpen?.(false)} />
          </div>

          <UserFooter />
        </div>
      </Sheet>
    </>
  );
}
