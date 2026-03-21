'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '../../../../utils/cn';

interface Props {
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  href: string;
  badge?: string;
}

function SidebarItems({ icon, title, isActive, href, badge }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        isActive
          ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-400 shadow-sm shadow-indigo-500/5'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-r-full" />
      )}
      <div
        className={cn(
          'flex items-center justify-center w-5 h-5 transition-colors duration-200',
          isActive
            ? 'text-indigo-400'
            : 'text-gray-500 group-hover:text-gray-300'
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-[13px] font-medium flex-1 transition-colors duration-200',
          isActive ? 'text-indigo-300' : ''
        )}
      >
        {title}
      </span>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default SidebarItems;
