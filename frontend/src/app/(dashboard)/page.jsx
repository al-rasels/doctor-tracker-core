"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Stethoscope, 
  Activity, 
  TrendingUp, 
  Bed, 
  RefreshCw,
  Calendar,
  PieChart as PieIcon,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_PALETTE = [
  "#2563eb", // blue-600
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#64748b"  // slate-500
];

/**
 * Executive Operations Dashboard View.
 * Displays high-level KPIs and multi-dimensional visual analytics powered by MongoDB $facet aggregation.
 */
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
      setData(response.data.data);
    } catch (err) {
      console.error("Failed to load dashboard analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  // Loading skeleton state
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalDoctors: 0,
    totalPatients: 0,
    admittedPatients: 0,
    underObservationPatients: 0,
    recoveredPatients: 0,
    dischargedPatients: 0,
    averagePatientsPerDoctor: 0
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time administrative telemetry & caseload distribution
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
          <div className="w-40 sm:w-44">
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs font-semibold h-9"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time History</option>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="gap-1.5 h-9 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Doctors */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Doctors
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {kpis.totalDoctors}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">
                Active Medical Staff
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
              <Stethoscope className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Patients */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Patients
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {kpis.totalPatients}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                Coordinated Caseload
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Avg Load per Doctor */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Avg Load / Doctor
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {kpis.averagePatientsPerDoctor}
              </h3>
              <p className="text-xs text-purple-600 font-semibold mt-1">
                Patients per Specialist
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-xs">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Current In-Patients */}
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                In-Patients
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {kpis.admittedPatients}
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                {kpis.underObservationPatients} under observation
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
              <Bed className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Patients per Doctor Load */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span>Patients per Doctor</span>
                </CardTitle>
                <CardDescription>
                  Workload attribution across attending physicians
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              {data?.patientsPerDoctor && data.patientsPerDoctor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.patientsPerDoctor}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="doctorName" 
                      tick={{ fontSize: 11, fill: "#64748b" }} 
                      angle={-25} 
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155", 
                        borderRadius: "12px", 
                        color: "#fff",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value) => [`${value} Patients`, "Assigned"]}
                    />
                    <Bar dataKey="patientCount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No doctor caseload data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Patient Registration Timeline Trends */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span>Intake & Admission Timeline</span>
                </CardTitle>
                <CardDescription>
                  Daily patient registration trends over selected window
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              {data?.admissionTimeline && data.admissionTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.admissionTimeline}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155", 
                        borderRadius: "12px", 
                        color: "#fff",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value) => [`${value} Admissions`, "Intake"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#10b981" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#admissionGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No intake timeline records for this timeframe
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Diagnostic Conditions Distribution */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-purple-600" />
            <span>Diagnostic Condition Breakdown</span>
          </CardTitle>
          <CardDescription>
            Patient distribution across primary clinical diagnoses
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64 w-full">
              {data?.conditionDistribution && data.conditionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.conditionDistribution}
                      dataKey="count"
                      nameKey="condition"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {data.conditionDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_PALETTE[index % CHART_PALETTE.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155", 
                        borderRadius: "12px", 
                        color: "#fff" 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No condition distribution data available
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {data?.conditionDistribution?.map((item, idx) => (
                <div
                  key={item.condition}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }} 
                    />
                    <span className="text-sm font-semibold text-slate-700">{item.condition}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/60">
                    {item.count} patients
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
