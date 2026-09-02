"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChannelPartnersAndCommissionsPage from '@/app/channel-partners/page';

export default function CommissionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/channel-partners');
  }, [router]);

  return <ChannelPartnersAndCommissionsPage />;
}
