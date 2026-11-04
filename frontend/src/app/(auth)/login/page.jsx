"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

/**
 * Administrative Login View.
 * Secure portal entry point with JWT Bearer session issuance.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@careguide.com");
  const [password, setPassword] = useState("Admin123456!");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;
      login(token, user);
      router.push("/");
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        "Invalid email or password. Please verify your credentials and retry.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-3">
          <Activity className="h-8 w-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Doctor Tracker Portal
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Care Guide — Clinical Operations & Caseload Management
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/80 shadow-2xl rounded-3xl p-2 sm:p-4 text-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white text-xl">Sign in to your account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your clinical administrative credentials below
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Email
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/90 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-blue-500"
                    placeholder="admin@careguide.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-900/90 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-blue-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-bold gap-2 mt-2"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Footer */}
            <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 rounded-full text-[11px] text-slate-300 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                <span>Preloaded Evaluation Account</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>Email: <span className="text-slate-200 font-mono">admin@careguide.com</span></p>
                <p>Password: <span className="text-slate-200 font-mono">Admin123456!</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
