"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Building2,
  TrendingUp, 
  DollarSign,
  Users2,
  BadgePercent,
  UserCheck, 
  Calendar, 
  Sparkles,
  BarChart2,
  Settings, 
  ShieldCheck 
} from 'lucide-react';
import { useProfile } from '@/lib/auth';
import { canAccessRoute } from '@/lib/permissions';

export function SidebarNav({ onClose, className = '' }: { onClose?: () => void; className?: string }) {
  const pathname = usePathname();
  const profile = useProfile();

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Leads', href: '/leads', icon: Users },
    { title: 'Properties', href: '/properties', icon: Home },
    { title: 'Unit Inventory', href: '/inventory', icon: Building2 },
    { title: 'Pipeline', href: '/pipeline', icon: TrendingUp },
    { title: 'Transactions', href: '/transactions', icon: DollarSign },
    { title: 'Partners & Commissions', href: '/channel-partners', icon: Users2 },
    { title: 'Matchmaker', href: '/matchmaking', icon: UserCheck },
    { title: 'Site Visits', href: '/site-visits', icon: Calendar },
    { title: 'Creative Studio', href: '/dashboard/creative-studio', icon: Sparkles },
    { title: 'Ad Performance', href: '/dashboard/ad-performance', icon: BarChart2 },
    { title: 'Settings', href: '/settings', icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => 
    canAccessRoute(profile?.role, item.href)
  );

  return (
    <div className={`flex flex-col justify-between h-full w-full text-left ${className}`}>
      <div className="space-y-4">
        
        {/* Prominent Brand Logo */}
        <div className="px-1 pt-1 pb-2 flex items-center justify-center">
          <Link href="/dashboard" className="block group">
            <img 
              src="/oglogo.png" 
              alt="Outgrow Logo" 
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = 
              pathname === item.href || 
              (pathname !== '/' && item.href !== '/' && pathname.startsWith(item.href)) ||
              (item.href === '/channel-partners' && pathname.startsWith('/commissions'));
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-[11.5px] font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-[#d4ad4d] border-l-2 border-[#d4ad4d] rounded-l-none font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Status Card */}
      <div className="space-y-2.5 pt-2">
        <div className="p-3 bg-zinc-900/90 border border-zinc-800/80 rounded-[10px] space-y-0.5">
          <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Active User'}</p>
          <p className="text-[9px] font-bold text-[#d4ad4d] uppercase tracking-wider">{profile?.role || 'Sales Executive'}</p>
        </div>

        {/* Powered by Outgrow Logo Footer */}
        <div className="pt-0.5 text-center">
          <a 
            href="https://www.letsoutgrow.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-[9.5px] font-bold text-zinc-500 hover:text-white transition-colors group"
          >
            <span className="text-zinc-500 font-medium">Powered by</span>
            <img 
              src="https://www.letsoutgrow.com/oglogo.png" 
              alt="Outgrow" 
              className="h-3.5 w-auto object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all" 
            />
          </a>
        </div>
      </div>
    </div>
  );
}
