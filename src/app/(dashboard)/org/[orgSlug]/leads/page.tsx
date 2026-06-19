'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Mail,
  Calendar,
  Building,
  User,
  X
} from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  website: string | null;
  status: 'lead' | 'contacted' | 'replied' | 'meeting_scheduled' | 'unsubscribed';
  metadata: {
    linkedin?: string;
    notes?: string;
  };
  created_at: string;
}

const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    email: 'sarah.j@apexmedia.com',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    company_name: 'Apex Media Group',
    website: 'apexmedia.com',
    status: 'meeting_scheduled',
    metadata: { linkedin: 'linkedin.com/in/sarah-j-apex', notes: 'Interested in Q3 PPC campaigns scaling.' },
    created_at: '2026-06-15T08:00:00Z',
  },
  {
    id: 'lead-2',
    email: 'm.kovalski@ppcpros.io',
    first_name: 'Michael',
    last_name: 'Kovalski',
    company_name: 'PPC Pros',
    website: 'ppcpros.io',
    status: 'replied',
    metadata: { linkedin: 'linkedin.com/in/kovalski-ppc', notes: 'Requested pricing structure breakdown.' },
    created_at: '2026-06-16T11:30:00Z',
  },
  {
    id: 'lead-3',
    email: 'jenny.smith@seowizards.net',
    first_name: 'Jenny',
    last_name: 'Smith',
    company_name: 'SEO Wizards',
    website: 'seowizards.net',
    status: 'contacted',
    metadata: { notes: 'Cold email sent, waiting for reply sequence 2.' },
    created_at: '2026-06-17T09:15:00Z',
  },
  {
    id: 'lead-4',
    email: 'd.miller@trafficgiants.com',
    first_name: 'David',
    last_name: 'Miller',
    company_name: 'Traffic Giants',
    website: 'trafficgiants.com',
    status: 'lead',
    metadata: { notes: 'Imported from Apollo list.' },
    created_at: '2026-06-18T14:40:00Z',
  },
  {
    id: 'lead-5',
    email: 'a.clark@socialelevate.org',
    first_name: 'Alice',
    last_name: 'Clark',
    company_name: 'Social Elevate',
    website: 'socialelevate.org',
    status: 'unsubscribed',
    metadata: { notes: 'Opted out on cold sequence 1.' },
    created_at: '2026-06-14T10:00:00Z',
  },
];

const statusStyles = {
  lead: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  contacted: 'bg-blue-950/40 text-blue-400 border-blue-900/50',
  replied: 'bg-amber-950/40 text-amber-400 border-amber-900/50',
  meeting_scheduled: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
  unsubscribed: 'bg-red-950/40 text-red-400 border-red-900/50',
};

const statusLabels = {
  lead: 'Lead',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting_scheduled: 'Meeting Booked',
  unsubscribed: 'Opt Out',
};

export default function LeadsPage() {
  const params = useParams();
  const supabase = createClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const orgSlug = params?.orgSlug as string;

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      const isDemoMode = document.cookie.includes('demo_mode=true');

      if (isDemoMode) {
        setLeads(mockLeads);
        setIsLoading(false);
        return;
      }

      try {
        // Resolve Org ID first
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', orgSlug)
          .single();

        if (orgData) {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('organization_id', orgData.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setLeads(data as any[]);
          }
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [orgSlug, supabase]);

  // Filtering Logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      (lead.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-8rem)]">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Leads Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage contact targets and inspect AI outbound logs.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition-colors">
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Import Leads</span>
        </button>
      </div>

      {/* Control panel */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/10 border border-zinc-900 p-3 rounded-lg backdrop-blur-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search leads, domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-9 text-xs text-white placeholder-zinc-500 transition-colors focus:border-zinc-700 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        </div>

        {/* Filters */}
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400 transition-colors focus:border-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="lead">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="meeting_scheduled">Meeting Booked</option>
            <option value="unsubscribed">Opt Out</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto rounded-lg border border-zinc-900 bg-zinc-900/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-medium">
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold">Company</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">State</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
                  <div className="h-5 w-5 animate-spin rounded-full border border-zinc-800 border-t-zinc-200 mx-auto mb-2" />
                  <span>Loading directory list...</span>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
                  No matches found.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-medium text-white">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 flex items-center gap-1.5">
                    <span>{lead.company_name}</span>
                    {lead.website && (
                      <a 
                        href={`https://${lead.website}`} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">{lead.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${statusStyles[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-zinc-500 group-hover:text-white transition-colors">
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over details drawer overlay */}
      {selectedLead && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLead(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-zinc-900 bg-zinc-950 p-6 shadow-2xl transition-transform duration-300 flex flex-col justify-between">
            {/* Header info */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Lead Record Sheet</span>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="rounded hover:bg-zinc-900 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Core Attributes */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{selectedLead.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border border-zinc-900 bg-zinc-900/10 p-3 rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                      <Building className="h-3 w-3" /> Company
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">{selectedLead.company_name}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Added Date
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {new Date(selectedLead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge Select Panel */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Contact Stage</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((statusKey) => {
                    const isSelected = selectedLead.status === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => {
                          const updated = leads.map((l) => 
                            l.id === selectedLead.id ? { ...l, status: statusKey } : l
                          );
                          setLeads(updated);
                          setSelectedLead({ ...selectedLead, status: statusKey });
                        }}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide transition-all ${
                          isSelected 
                            ? `${statusStyles[statusKey]} scale-105 border-white/20 font-bold`
                            : 'bg-transparent text-zinc-500 border-zinc-900 hover:border-zinc-800 hover:text-zinc-400'
                        }`}
                      >
                        {statusLabels[statusKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outbound Logs Log list */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Mail className="h-3.5 w-3.5" />
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider">Outbound communication history</h4>
                </div>
                
                <div className="space-y-3 border-l border-zinc-900 pl-4 ml-1.5">
                  <div className="relative space-y-1 text-xs">
                    <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">Positive sentiment detected</span>
                    <p className="text-zinc-300 font-medium leading-relaxed">
                      "Yes, Wednesday morning at 10 AM works. Sending calendar invite."
                    </p>
                    <span className="block text-[9px] text-zinc-500">Received 12 hours ago</span>
                  </div>

                  <div className="relative space-y-1 text-xs">
                    <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-zinc-500" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Outbound cold pitch sent</span>
                    <p className="text-zinc-500 leading-relaxed">
                      "Subject: Quick SEO question. Hi Sarah, noticed your PPC audit on..."
                    </p>
                    <span className="block text-[9px] text-zinc-500">Dispatched 1 day ago</span>
                  </div>
                </div>
              </div>

              {/* Metadata Notes */}
              {selectedLead.metadata.notes && (
                <div className="space-y-2 border-t border-zinc-900 pt-4">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Internal notes</h4>
                  <div className="bg-zinc-900/30 border border-zinc-900/60 p-3 rounded-lg text-xs text-zinc-400 leading-relaxed">
                    {selectedLead.metadata.notes}
                  </div>
                </div>
              )}
            </div>

            {/* CTA action bottom */}
            <div className="border-t border-zinc-900 pt-4 flex gap-2">
              <button 
                onClick={() => {
                  alert(`Starting personalized manual draft email composition for ${selectedLead.email}`);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Write Email</span>
              </button>
              <button 
                onClick={() => {
                  alert(`Resolving AI enrichment profile details for ${selectedLead.company_name}`);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Research</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
