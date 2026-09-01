"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Direct bypass - redirect immediately into the ERP dashboard
    router.replace('/dashboard');
  }, [router]);

  return null;
}
