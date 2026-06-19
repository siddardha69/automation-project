'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { createClient } from '@/lib/supabase/client';
import { TenantContextType, UserRole } from '@/types/tenant';

const TenantContext = createContext<TenantContextType>({
  currentOrg: null,
  userRole: null,
  isLoading: true,
  organizations: [],
  switchTenant: () => {},
});

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [organizations, setOrganizations] = useState<TenantContextType['organizations']>([]);
  const [currentOrg, setCurrentOrg] = useState<TenantContextType['currentOrg']>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const orgSlug = params?.orgSlug as string | undefined;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrganizations([]);
      setCurrentOrg(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    // 1. Detect Demo Mode Bypass
    const isDemoMode = document.cookie.includes('demo_mode=true');

    if (isDemoMode) {
      const mockOrgs: TenantContextType['organizations'] = [
        { id: 'demo-org-1', name: 'Demo SEO Agency', slug: 'demo-agency', role: 'owner' },
        { id: 'demo-org-2', name: 'Growth Partners LLC', slug: 'growth-partners', role: 'admin' },
      ];
      setOrganizations(mockOrgs);

      const activeSlug = orgSlug || 'demo-agency';
      const active = mockOrgs.find((o) => o.slug === activeSlug);

      if (active) {
        setCurrentOrg({ id: active.id, name: active.name, slug: active.slug });
        setUserRole(active.role);
      } else {
        setCurrentOrg({ id: mockOrgs[0].id, name: mockOrgs[0].name, slug: mockOrgs[0].slug });
        setUserRole(mockOrgs[0].role);
      }
      setIsLoading(false);
      return;
    }

    // 2. Normal Database Mode
    const fetchMemberships = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('organization_members')
          .select('role, organizations(id, name, slug)')
          .eq('user_id', user.id);

        if (error) throw error;

        const resolvedOrgs = (data || []).map((membership: any) => ({
          id: membership.organizations.id,
          name: membership.organizations.name,
          slug: membership.organizations.slug,
          role: membership.role as UserRole,
        }));

        setOrganizations(resolvedOrgs);

        if (orgSlug) {
          const active = resolvedOrgs.find((o) => o.slug === orgSlug);
          if (active) {
            setCurrentOrg({
              id: active.id,
              name: active.name,
              slug: active.slug,
            });
            setUserRole(active.role);
          } else {
            setCurrentOrg(null);
            setUserRole(null);
          }
        } else {
          setCurrentOrg(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error('Error resolving tenant memberships:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberships();
  }, [user, authLoading, orgSlug, supabase]);

  const switchTenant = (slug: string) => {
    if (!slug) return;
    
    if (orgSlug) {
      const newPath = pathname.replace(`/org/${orgSlug}`, `/org/${slug}`);
      router.push(newPath);
    } else {
      router.push(`/org/${slug}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Alert Banner for Demo Mode */}
      {mounted && document.cookie.includes('demo_mode=true') && (
        <div className="bg-emerald-950/60 border-b border-emerald-900 px-8 py-2 text-center text-[10px] font-medium tracking-wide text-emerald-400 flex items-center justify-center gap-2 select-none">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>You are viewing the Live Demo Sandbox. Connect your Supabase API keys in `.env.local` to start production development.</span>
        </div>
      )}
      
      <TenantContext.Provider
        value={{
          currentOrg,
          userRole,
          isLoading: authLoading || isLoading,
          organizations,
          switchTenant,
        }}
      >
        {children}
      </TenantContext.Provider>
    </div>
  );
};

export const useTenant = () => useContext(TenantContext);
export { TenantContext };
