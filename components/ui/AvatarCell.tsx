// components/ui/AvatarCell.tsx
import React from 'react';

interface AvatarCellProps {
  name: string;
  subtext?: string;
  avatarBg?: string;
}

export function AvatarCell({ name, subtext, avatarBg }: AvatarCellProps) {
  const getInitials = (n: string) => {
    if (!n) return '??';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBgClass = (n: string) => {
    if (avatarBg) return avatarBg;
    const lower = n.toLowerCase();
    if (lower.includes('sandesh')) return 'bg-[#eaf2fd] text-[#1d70d6] border border-[#d2e4fc]';
    if (lower.includes('gaurav')) return 'bg-[#eaf8f4] text-[#0d9468] border border-[#c6eedf]';
    if (lower.includes('sedhu')) return 'bg-[#fdf0f5] text-[#d63384] border border-[#facde1]';
    if (lower.includes('vijay')) return 'bg-[#fff9e6] text-[#b87d00] border border-[#ffeaa8]';
    if (lower.includes('tushar')) return 'bg-[#f4f0fd] text-[#6f42c1] border border-[#ddd0fa]';
    if (lower.includes('anup')) return 'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]';
    if (lower.includes('prakash')) return 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]';
    if (lower.includes('sneha')) return 'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]';
    if (lower.includes('raviraj')) return 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]';
    if (lower.includes('shivraj')) return 'bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc]';

    const colors = [
      'bg-[#eaf2fd] text-[#1d70d6] border border-[#d2e4fc]',
      'bg-[#eaf8f4] text-[#0d9468] border border-[#c6eedf]',
      'bg-[#fdf0f5] text-[#d63384] border border-[#facde1]',
      'bg-[#fff9e6] text-[#b87d00] border border-[#ffeaa8]',
      'bg-[#f4f0fd] text-[#6f42c1] border border-[#ddd0fa]',
      'bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]',
      'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]',
      'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]',
      'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
      'bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc]',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgClass = getBgClass(name);

  return (
    <div className="dc-name-cell">
      <div className={`dc-avatar ${bgClass}`}>
        {initials}
      </div>
      <div className="flex flex-col min-w-0 text-left">
        <span className="font-bold text-zinc-900 text-xs truncate leading-snug">{name}</span>
        {subtext && <span className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{subtext}</span>}
      </div>
    </div>
  );
}
