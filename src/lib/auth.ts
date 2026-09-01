// src/lib/auth.ts
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export interface Profile {
  id: string;
  role: string;
  full_name?: string;
  email?: string;
  company_name?: string;
  created_at?: string;
}

export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let profileData: Profile = {
      id: 'local-admin-id',
      role: 'SuperAdmin',
      full_name: 'Admin User',
      email: 'admin@luxerealty.com',
    };

    if (typeof window !== 'undefined') {
      const demoUser = localStorage.getItem('luxe-demo-user');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          profileData = parsed;
        } catch (e) {
          localStorage.removeItem('luxe-demo-user');
        }
      }

      // Apply role override if set (demo mode)
      const roleOverride = localStorage.getItem('luxe-role-override');
      if (roleOverride && ['SuperAdmin', 'Admin', 'SalesPerson'].includes(roleOverride)) {
        profileData.role = roleOverride;
      }

      const userIdOverride = localStorage.getItem('luxe-user-override');
      if (userIdOverride) {
        profileData.id = userIdOverride;
      }

      const userNameOverride = localStorage.getItem('luxe-user-name-override');
      if (userNameOverride) {
        profileData.full_name = userNameOverride;
      }

      const userEmailOverride = localStorage.getItem('luxe-user-email-override');
      if (userEmailOverride) {
        profileData.email = userEmailOverride;
      }
    }

    setProfile(profileData);
  }, []);

  return profile || {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}

// Server-side helper to get profile (Disconnected / Local Mode)
export async function getProfile(): Promise<Profile | null> {
  return {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}
