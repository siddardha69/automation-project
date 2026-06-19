export type UserRole = 'owner' | 'admin' | 'member';

export interface TenantContextType {
  currentOrg: {
    id: string;
    name: string;
    slug: string;
  } | null;
  userRole: UserRole | null;
  isLoading: boolean;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: UserRole;
  }>;
  switchTenant: (slug: string) => void;
}
