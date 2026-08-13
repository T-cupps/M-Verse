'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Monitor,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';

interface CallRecord {
  call_id: string;
  room_name: string;
  status: 'SUCCESS' | 'FAILED';
  call_type: 'BROWSER' | 'SIP';
  exercise_completed: number;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

interface AnalyticsData {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  recent_calls: CallRecord[];
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const total = data?.total_calls || 0;
  const success = data?.successful_calls || 0;
  const failed = data?.failed_calls || 0;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-100 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                title="Back to Agent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Call Analytics Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Real-time performance metrics and call outcomes for Saira Voice Assistant
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Live'}
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-slate-900/80 p-4 text-sm text-emerald-300">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>
            <strong>Caller Privacy Protection Enabled:</strong> Passwords, OTPs, PINs, account
            numbers, medical information, and full conversation transcripts are strictly excluded
            from public dashboard analytics.
          </span>
        </div>

        {/* KPI Cards (Step 3 Requirements) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Total Calls */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                Total Calls
              </span>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <PhoneCall className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-white">{total}</span>
              <p className="mt-1 text-xs text-slate-400">Actual Browser & SIP sessions</p>
            </div>
            <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
          </div>

          {/* Card 2: Successful Calls */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">
                Successful Calls
              </span>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-emerald-400">{success}</span>
              <p className="mt-1 text-xs text-slate-400">Learner completed exercise</p>
            </div>
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
          </div>

          {/* Card 3: Failed Calls */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider text-rose-400 uppercase">
                Failed Calls
              </span>
              <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-rose-400">{failed}</span>
              <p className="mt-1 text-xs text-slate-400">Ended before completing exercise</p>
            </div>
            <div className="absolute top-0 left-0 h-1 w-full bg-rose-500" />
          </div>
        </div>

        {/* Success Rate Progress Card */}
        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-slate-300">Overall Success Rate</span>
            <span className="font-bold text-indigo-400">{successRate}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        {/* Recent Call Logs Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Recent Call Logs</h2>
            </div>
            {lastRefreshed && (
              <span className="text-xs text-slate-400">Updated at {lastRefreshed}</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-medium text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Exercise Completed</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recent_calls && data.recent_calls.length > 0 ? (
                  data.recent_calls.map((call) => (
                    <tr key={call.call_id} className="transition-colors hover:bg-slate-800/40">
                      {/* Status */}
                      <td className="px-6 py-4">
                        {call.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
                            <XCircle className="h-3.5 w-3.5" />
                            FAILED
                          </span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          {call.call_type === 'SIP' ? (
                            <>
                              <Smartphone className="h-4 w-4 text-purple-400" /> SIP Call
                            </>
                          ) : (
                            <>
                              <Monitor className="h-4 w-4 text-cyan-400" /> Browser Call
                            </>
                          )}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {call.room_name}
                      </td>

                      {/* Exercise Completed */}
                      <td className="px-6 py-4">
                        {call.exercise_completed ? (
                          <span className="font-medium text-emerald-400">Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {call.duration_seconds}s
                        </span>
                      </td>

                      {/* Started At */}
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(call.started_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No calls recorded yet. Connect a browser or SIP call to see real data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
