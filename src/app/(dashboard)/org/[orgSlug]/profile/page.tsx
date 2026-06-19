'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { User, Key, Save, Mail, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName((user.user_metadata as any)?.name || 'Lead Agency Partner');
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile details updated.');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Profile Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your personal details, email credentials, and security preferences.
        </p>
      </div>

      {/* Account Info Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6 rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <User className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-white">Personal Profile</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 pl-9 text-xs text-white placeholder-zinc-650 focus:border-zinc-700 focus:outline-none"
              />
              <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled
                value={email}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 pl-9 text-xs text-zinc-500 cursor-not-allowed font-mono"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600/70" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{isSaving ? 'Saving...' : 'Update Details'}</span>
        </button>
      </form>

      {/* Change Password Form */}
      <form onSubmit={(e) => { e.preventDefault(); alert('Password update requested.'); }} className="space-y-6 rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
          <Key className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-white">Security & Password</h3>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-650 transition-colors focus:border-zinc-700 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          <Key className="h-3.5 w-3.5" />
          <span>Update Password</span>
        </button>
      </form>

    </div>
  );
}
