"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/properties');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-center">
      <div className="space-y-2">
        <div className="w-8 h-8 border-2 border-[#d4ad4d] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Redirecting to Properties & Project Stacking...
        </p>
      </div>
    </div>
  );
}
