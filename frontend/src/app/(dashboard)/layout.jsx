"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

/**
 * Protected Dashboard Shell Layout.
 * Handles authentication enforcement and coordinates the responsive desktop sidebar and mobile navigation drawer.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading skeleton while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Verifying security session...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of unauthenticated content
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 antialiased">
      {/* Responsive Sidebar (Desktop bar + Mobile slide-over drawer) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
