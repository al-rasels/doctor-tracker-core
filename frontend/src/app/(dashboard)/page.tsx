"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Stethoscope, 
  Activity, 
  TrendingUp, 
  Bed, 
  CheckCircle2, 
  Clock, 
  RefreshCw 
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

interface DashboardData {
  kpis: {
    totalDoctors: number;
    totalPatients: number;
    admittedPatients: number;
    underObservationPatients: number;
    recoveredPatients: number;
    dischargedPatients: number;
    averagePatientsPerDoctor: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }>;
  admissionTimeline: Array<{
    date: string;
    count: number;
  }>;
  conditionDistribution: Array<{
    condition: string;
    count: number;
  }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#64748b"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/dashboard?timeframe=${timeframe}`);
      setData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse p-6" />
          ))}
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
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Operations Overview</h1>
          <p className="text-sm text-slate-500">Live operational telemetry & patient caseload aggregations</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Doctors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.totalDoctors}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">Across 8 Medical Specialties</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Stethoscope className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.totalPatients}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Active Caseload Managed
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Avg Patients per Doctor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Load / Doctor</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.averagePatientsPerDoctor}</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">Balanced Workload Ratio</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Admitted Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current In-Patients</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.admittedPatients}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">{kpis.underObservationPatients} under observation</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bed className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Patients per Doctor Load */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Patients per Doctor</h3>
              <p className="text-xs text-slate-500">Caseload attribution across attending specialists</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {data?.patientsPerDoctor && data.patientsPerDoctor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.patientsPerDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="doctorName" 
                    tick={{ fontSize: 11, fill: "#64748b" }} 
                    angle={-25} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    formatter={(value: any) => [`${value} Patients`, "Assigned"]}
                  />
                  <Bar dataKey="patientCount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No doctor patient data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Admission Timeline Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Patient Registration Timeline</h3>
              <p className="text-xs text-slate-500">Daily intake trend over chosen window</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {data?.admissionTimeline && data.admissionTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.admissionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    formatter={(value: any) => [`${value} Admissions`, "Intake"]}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#admissionGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No timeline data for selected period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Diagnostic Conditions Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-1">Diagnostic Condition Breakdown</h3>
        <p className="text-xs text-slate-500 mb-6">Patient allocation across major clinical presentations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-2">
            {data?.conditionDistribution.map((item, idx) => (
              <div key={item.condition} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="h-3 w-3 rounded-full shrink-0" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                  />
                  <span className="text-sm font-medium text-slate-700">{item.condition}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  {item.count} patients
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
