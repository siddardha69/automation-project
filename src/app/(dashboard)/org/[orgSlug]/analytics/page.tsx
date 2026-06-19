'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Smile, 
  Frown, 
  UserMinus, 
  HelpCircle,
  Inbox
} from 'lucide-react';

export default function AnalyticsPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  // Mock sentiment breakdowns
  const sentiments = [
    { name: 'Interested (Positive)', value: 142, percentage: 38.4, color: 'bg-emerald-400', icon: Smile },
    { name: 'Out of Office (OOO)', value: 104, percentage: 28.1, color: 'bg-zinc-650', icon: UserMinus },
    { name: 'Neutral / Follow Up', value: 89, percentage: 24.0, color: 'bg-blue-400', icon: HelpCircle },
    { name: 'Not Interested / Cold', value: 35, percentage: 9.5, color: 'bg-rose-450', icon: Frown },
  ];

  // Mock conversion steps
  const funnelSteps = [
    { name: 'Total Targeted Leads', count: '4,829', percentage: '100%' },
    { name: 'Outbox Emails Sent', count: '12,940', percentage: '98.5%' },
    { name: 'Emails Opened', count: '8,850', percentage: '68.4%' },
    { name: 'Replies Received', count: '1,814', percentage: '14.0%' },
    { name: 'Meetings Scheduled', count: '142', percentage: '1.1%' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Advanced Analytics
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Detailed metrics, sentiments, and conversions funnels.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Conversion Funnel */}
        <div className="md:col-span-2 rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Outbound Acquisition Funnel</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Step-by-step conversion analytics</p>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step, idx) => {
              // Calculate visual width for funnel bar
              const widths = ['w-full', 'w-[95%]', 'w-[68%]', 'w-[14%]', 'w-[5%]'];
              return (
                <div key={step.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-300 font-medium">{step.name}</span>
                    <div className="space-x-3 text-zinc-500">
                      <span className="text-white font-bold">{step.count}</span>
                      <span>({step.percentage})</span>
                    </div>
                  </div>
                  <div className="w-full h-7 bg-zinc-900/40 rounded border border-zinc-900 overflow-hidden flex items-center px-1">
                    <div className={`h-5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xs border-r border-zinc-750 ${widths[idx]} flex items-center justify-end pr-3`}>
                      <span className="text-[9px] font-bold text-zinc-400 font-mono">{step.percentage}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: AI Sentiment Parser */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">AI Reply Sentiment Breakdown</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Intent classification logs</p>
          </div>

          {/* Sentiment List */}
          <div className="space-y-4 my-auto">
            {sentiments.map((sent) => {
              const Icon = sent.icon;
              return (
                <div key={sent.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${sent.color}`} />
                      <span className="text-zinc-300 font-medium">{sent.name}</span>
                    </div>
                    <span className="text-zinc-500 font-mono">
                      <span className="text-white font-bold">{sent.value}</span> ({sent.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${sent.color} rounded-full`} style={{ width: `${sent.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="border-t border-zinc-900 pt-4 mt-6 text-[10px] text-zinc-500 flex items-center gap-1.5 font-mono">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI sentiment parsing accuracy is currently 97.4%.</span>
          </div>
        </div>
      </div>
      
      {/* Weekly performance grid */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Conversion rate comparison</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Target conversions vs average campaign baseline</p>
        </div>

        <div className="relative w-full h-48 bg-zinc-950/40 rounded-lg border border-zinc-900/50 p-2">
          <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
            <line x1="0" y1="35" x2="500" y2="35" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="115" x2="500" y2="115" stroke="#18181b" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Average baseline (dotted blue) */}
            <path
              d="M 0 90 L 100 85 L 200 88 L 300 80 L 400 82 L 500 78"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
            
            {/* Active campaigns conversion (solid green) */}
            <path
              d="M 0 110 L 100 95 L 200 70 L 300 45 L 400 50 L 500 30"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-zinc-600">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6</span>
          </div>
        </div>
      </div>

    </div>
  );
}
