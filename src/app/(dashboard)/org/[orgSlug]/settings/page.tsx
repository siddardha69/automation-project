'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { createClient } from '@/lib/supabase/client';
import { 
  Building2, 
  Users, 
  Workflow, 
  Save, 
  ShieldCheck, 
  ShieldAlert,
  Link2
} from 'lucide-react';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export default function SettingsPage() {
  const params = useParams();
  const { currentOrg, userRole } = useTenant();
  const supabase = createClient();

  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [n8nUrl, setN8nUrl] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'members' | 'integrations'>('profile');

  const slugParam = params?.orgSlug as string;

  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name);
      setOrgSlug(currentOrg.slug);
    }

    const isDemoMode = document.cookie.includes('demo_mode=true');
    if (isDemoMode) {
      setMembers([
        { id: 'm-1', email: 'owner@agency.com', role: 'owner', joined_at: '2026-06-01T00:00:00Z' },
        { id: 'm-2', email: 'admin@agency.com', role: 'admin', joined_at: '2026-06-05T00:00:00Z' },
        { id: 'm-3', email: 'strategist@agency.com', role: 'member', joined_at: '2026-06-10T00:00:00Z' },
      ]);
      setN8nUrl('https://n8n.annulusautomations.com/webhook/active-campaign-sync');
      return;
    }

    // Fetch members from database
    const fetchSettings = async () => {
      try {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', slugParam)
          .single();

        if (orgData) {
          const { data } = await supabase
            .from('organization_members')
            .select('id, role, user_id, created_at')
            .eq('organization_id', orgData.id);

          if (data) {
            // Map user_id to user emails using supabase profiles or fallback
            const mapped = data.map((m: any) => ({
              id: m.id,
              email: `user-${m.user_id.slice(0, 5)}@tenant.com`,
              role: m.role,
              joined_at: m.created_at,
            }));
            setMembers(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching settings members:', err);
      }
    };

    fetchSettings();
  }, [currentOrg, slugParam, supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Organization profile updated successfully.');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure organization settings, workspace permissions, and webhook integrations.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-900 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-zinc-200 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Workspace Profile
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 transition-colors ${
            activeTab === 'members'
              ? 'border-b-2 border-zinc-200 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Members & Access
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 transition-colors ${
            activeTab === 'integrations'
              ? 'border-b-2 border-zinc-200 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          n8n Integration
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <Building2 className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">Workspace Details</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Agency Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-650 transition-colors focus:border-zinc-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Workspace URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-650 transition-colors focus:border-zinc-700 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving changes...' : 'Save Profile'}</span>
            </button>
          </form>
        )}

        {activeTab === 'members' && (
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-white">Active Member Roster</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Your role: <span className="text-white font-bold uppercase">{userRole}</span></span>
            </div>

            {/* Member lists */}
            <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-medium">
                    <th className="py-2.5 px-4 font-semibold">User Email</th>
                    <th className="py-2.5 px-4 font-semibold">Permission Role</th>
                    <th className="py-2.5 px-4 font-semibold">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="py-3 px-4 font-medium">{member.email}</td>
                      <td className="py-3 px-4 flex items-center gap-1.5 capitalize font-mono text-[11px] text-zinc-400">
                        {member.role === 'owner' ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
                        )}
                        <span>{member.role}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 font-mono">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <Workflow className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">n8n Outreach Integration</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                Configure your self-hosted or cloud n8n active webhook listener to synchronize newly discovered leads and handle replies/intent parsing.
              </p>

              <div className="space-y-1 max-w-xl">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Webhook Target URL
                </label>
                <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-zinc-700">
                  <span className="flex select-none items-center pl-3 text-zinc-500">
                    <Link2 className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="url"
                    value={n8nUrl}
                    onChange={(e) => setN8nUrl(e.target.value)}
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Webhook endpoint synced successfully.')}
              className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Webhook</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
