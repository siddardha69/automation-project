'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Detect Demo Mode bypass
    const isDemoMode = document.cookie.includes('demo_mode=true');

    if (isDemoMode) {
      setUser({
        id: 'demo-user-uuid',
        email: 'demo@annulusautomations.com',
        user_metadata: { name: 'Lead Agency Partner' },
      } as any);
      setSession({
        access_token: 'demo-sandbox-token',
        user: { id: 'demo-user-uuid', email: 'demo@annulusautomations.com' } as any,
      } as any);
      setIsLoading(false);
      return;
    }

    // 2. Normal Mode: Initial session resolve
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // 3. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    setIsLoading(true);
    
    // Clear demo cookie
    document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore if supabase client is not connected
    }
    
    setUser(null);
    setSession(null);
    setIsLoading(false);
    
    // Hard refresh to login/setup page
    window.location.href = '/setup';
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
