'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { 
  Mail, 
  Users, 
  MessageSquareCode, 
  CalendarCheck2, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

export default function DashboardOverview() {
  const params = useParams();
  const { currentOrg } = useTenant();

  // Mock metrics to show rich state immediately
  const metrics = [
    {
      name: 'Total Leads Outreach',
      value: '4,829',
      change: '+14.2%',
      trend: 'up',
      description: 'vs. previous month',
      icon: Users,
    },
    {
      name: 'Emails Sent',
      value: '12,940',
      change: '+22.5%',
      trend: 'up',
      description: 'vs. previous month',
      icon: Mail,
    },
    {
      name: 'Total Replies',
      value: '1,814',
      change: '-2.4%',
      trend: 'down',
      description: 'vs. previous month',
      icon: MessageSquareCode,
    },
    {
      name: 'Meetings Scheduled',
      value: '142',
      change: '+31.8%',
      trend: 'up',
      description: 'vs. previous month',
      icon: CalendarCheck2,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'meeting',
      text: 'Meeting scheduled with Acme Corp (CTO)',
      time: '12 minutes ago',
      meta: 'Campaign: Cold SEO Audit V2',
    },
    {
      id: 2,
      type: 'reply',
      text: 'Positive reply detected from Sarah Jenkins',
      time: '45 minutes ago',
      meta: 'Sentiment: Positive (94%)',
    },
    {
      id: 3,
      type: 'sent',
      text: '1,200 emails dispatched in PPC Agency Reachout',
      time: '2 hours ago',
      meta: 'Target: PPC Agencies (US)',
    },
    {
      id: 4,
      type: 'meeting',
      text: 'Meeting scheduled with Apex Media Group',
      time: '4 hours ago',
      meta: 'Campaign: Inbound Content Match',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Overview
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Real-time metrics and lead acquisition overview for {currentOrg?.name}.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isUp = metric.trend === 'up';

          return (
            <div
              key={metric.name}
              className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {metric.name}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white font-mono">
                  {metric.value}
                </span>
                <span
                  className={`flex items-center text-[10px] font-semibold ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="mr-0.5 h-3 w-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="mr-0.5 h-3 w-3 stroke-[2.5]" />
                  )}
                  {metric.change}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-zinc-500">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* SVG Performance Chart */}
        <div className="md:col-span-2 rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Outbound Engine Performance</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Daily meeting conversion flow</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-200" />
                <span>Emails Sent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Meetings Booked</span>
              </div>
            </div>
          </div>

          {/* Pure SVG Line Chart (No extra library needed, fast & clean) */}
          <div className="relative w-full h-64 bg-zinc-950/40 rounded-lg border border-zinc-900/50 p-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Emails Sent Curve */}
              <path
                d="M 0 160 Q 100 120 180 130 T 360 80 T 500 50"
                fill="none"
                stroke="#27272a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              
              {/* Meetings Booked curve (glowing emerald) */}
              <path
                d="M 0 185 Q 100 170 180 160 T 360 110 T 500 90"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="180" cy="160" r="4" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
              <circle cx="360" cy="110" r="4" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
              <circle cx="500" cy="90" r="4" className="fill-emerald-400 stroke-zinc-950 stroke-2" />
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-zinc-600">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Recent Activity stream */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Outbound activity log</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time automation events</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="space-y-0.5">
                  <p className="font-medium text-zinc-200">{activity.text}</p>
                  <div className="flex gap-2 text-[10px] text-zinc-500">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span className="font-mono">{activity.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
