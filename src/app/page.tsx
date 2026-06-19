'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: tenantLoading } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || tenantLoading) return;

    if (!user) {
      router.push("/login");
    } else if (organizations.length > 0) {
      router.push(`/org/${organizations[0].slug}`);
    } else {
      router.push("/register");
    }
  }, [user, authLoading, tenantLoading, organizations, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200 mx-auto" />
        <p className="text-sm text-zinc-400 font-medium tracking-wide">Resolving your workspace...</p>
      </div>
    </div>
  );
}
