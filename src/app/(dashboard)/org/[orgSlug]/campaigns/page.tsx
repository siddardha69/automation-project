'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Play, 
  Pause, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  MessageSquareText,
  ChevronRight,
  TrendingUp,
  FileCode2
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  subject_lines: string[];
  body_templates: string[];
  sent_count: number;
  open_rate: number;
  reply_rate: number;
  created_at: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Cold SEO Audit V2',
    status: 'active',
    subject_lines: ['Quick SEO audit for {{company}}', 'SEO optimizations query'],
    body_templates: ['Hi {{first_name}}, I was auditing your SEO positioning...'],
    sent_count: 1840,
    open_rate: 68.4,
    reply_rate: 18.2,
    created_at: '2026-06-10T08:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'PPC Agency Reachout V1',
    status: 'paused',
    subject_lines: ['Scaling PPC services for {{company}}'],
    body_templates: ['Hey {{first_name}}, noticed your PPC client profiles...'],
    sent_count: 940,
    open_rate: 54.2,
    reply_rate: 9.8,
    created_at: '2026-06-12T10:30:00Z',
  },
  {
    id: 'camp-3',
    name: 'Growth Agency Lead Matcher',
    status: 'draft',
    subject_lines: ['Lead gen automation trial'],
    body_templates: ['Hello {{first_name}}, we help growth agencies automate...'],
    sent_count: 0,
    open_rate: 0,
    reply_rate: 0,
    created_at: '2026-06-18T14:00:00Z',
  },
  {
    id: 'camp-4',
    name: 'Inbound Content Match',
    status: 'completed',
    subject_lines: ['Collaborative content strategy proposal'],
    body_templates: ['Hi {{first_name}}, loved your recent blog post on...'],
    sent_count: 4500,
    open_rate: 72.8,
    reply_rate: 24.5,
    created_at: '2026-06-01T09:00:00Z',
  },
];

const statusStyles = {
  draft: 'bg-zinc-900 text-zinc-500 border-zinc-800',
  active: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
  paused: 'bg-amber-950/40 text-amber-400 border-amber-900/50',
  completed: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
};

const statusLabels = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Finished',
};

export default function CampaignsPage() {
  const params = useParams();
  const supabase = createClient();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orgSlug = params?.orgSlug as string;

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      const isDemoMode = document.cookie.includes('demo_mode=true');

      if (isDemoMode) {
        setCampaigns(mockCampaigns);
        setIsLoading(false);
        return;
      }

      try {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', orgSlug)
          .single();

        if (orgData) {
          const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('organization_id', orgData.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            // Fill in missing counts for DB campaigns
            const hydrated = data.map((c: any) => ({
              ...c,
              sent_count: 0,
              open_rate: 0,
              reply_rate: 0,
            }));
            setCampaigns(hydrated);
          }
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [orgSlug, supabase]);

  const toggleStatus = (id: string, currentStatus: Campaign['status']) => {
    let nextStatus: Campaign['status'] = 'active';
    if (currentStatus === 'active') nextStatus = 'paused';
    else if (currentStatus === 'paused') nextStatus = 'active';
    else return; // Ignore drafts or finished

    const updated = campaigns.map((c) => 
      c.id === id ? { ...c, status: nextStatus } : c
    );
    setCampaigns(updated);
    if (selectedCampaign && selectedCampaign.id === id) {
      setSelectedCampaign({ ...selectedCampaign, status: nextStatus });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Outbound Campaigns
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Build and monitor automated cold sequence workflows.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition-colors">
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Sequence</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Left Side: Campaign Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-zinc-500 border border-zinc-900 rounded-lg">
              <div className="h-5 w-5 animate-spin rounded-full border border-zinc-800 border-t-zinc-200 mx-auto mb-2" />
              <span>Loading campaigns...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 border border-zinc-900 rounded-lg">
              No campaigns configured yet.
            </div>
          ) : (
            campaigns.map((camp) => {
              const isActive = camp.id === selectedCampaign?.id;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className={`rounded-xl border p-5 backdrop-blur-sm transition-all cursor-pointer ${
                    isActive 
                      ? 'border-zinc-700 bg-zinc-900/30' 
                      : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200">
                        {camp.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                        Added: {new Date(camp.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium tracking-wide ${statusStyles[camp.status]}`}>
                      {statusLabels[camp.status]}
                    </span>
                  </div>

                  {/* Micro stats */}
                  {camp.status !== 'draft' && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-900/50">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Dispatched
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{camp.sent_count}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Open Rate
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{camp.open_rate}%</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                          <MessageSquareText className="h-3 w-3" /> Response
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{camp.reply_rate}%</span>
                      </div>
                    </div>
                  )}

                  {camp.status === 'draft' && (
                    <div className="mt-4 pt-3 text-[10px] text-zinc-500 flex items-center gap-1.5 font-mono">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Ready to configure sequence template files.</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Sequence Inspector */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-6 backdrop-blur-sm min-h-[400px] flex flex-col justify-between">
          {selectedCampaign ? (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{selectedCampaign.name}</h3>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">Sequence settings and configurations</span>
                  </div>

                  {/* Quick Control toggle */}
                  {(selectedCampaign.status === 'active' || selectedCampaign.status === 'paused') && (
                    <button
                      onClick={() => toggleStatus(selectedCampaign.id, selectedCampaign.status)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedCampaign.status === 'active'
                          ? 'border-amber-900 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40'
                          : 'border-emerald-900 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                      }`}
                    >
                      {selectedCampaign.status === 'active' ? (
                        <>
                          <Pause className="h-3 w-3 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Templates */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                      <FileCode2 className="h-3.5 w-3.5" /> Email Subject Lines ({selectedCampaign.subject_lines.length})
                    </span>
                    <ul className="space-y-1">
                      {selectedCampaign.subject_lines.map((subject, idx) => (
                        <li key={idx} className="bg-zinc-900/40 rounded border border-zinc-900 p-2.5 text-xs text-zinc-300 font-mono">
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> Step 1: Cold Reachout Template
                    </span>
                    <div className="bg-zinc-900/40 rounded border border-zinc-900 p-3 text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedCampaign.body_templates[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance indicators */}
              {selectedCampaign.status !== 'draft' && (
                <div className="mt-auto border-t border-zinc-900 pt-4 space-y-3">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Deliverability performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Outbox Delivery success</span>
                      <span className="text-emerald-400 font-bold">99.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '99.2%' }} />
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 my-auto space-y-3">
              <Mail className="h-8 w-8 text-zinc-700" />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-zinc-400">No Campaign Selected</h4>
                <p className="text-[10px] text-zinc-500 max-w-[200px] leading-relaxed">
                  Select a campaign sequence card from the list to inspect variables, templates, and delivery performance.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
