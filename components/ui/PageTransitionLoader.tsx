"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trigger quick top loader on navigation
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(75), 100);
    const t2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 280);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top Animated Gold Gradient Bar */}
      <div 
        className="h-[2.5px] bg-gradient-to-r from-[#d4ad4d] via-[#fce79f] to-[#b8922e] shadow-[0_0_12px_rgba(212,173,77,0.9)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: loading ? 1 : 0 }}
      />
    </div>
  );
}
