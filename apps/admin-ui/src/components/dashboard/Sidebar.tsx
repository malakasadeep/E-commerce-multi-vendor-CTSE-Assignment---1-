'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '../../configs/constants';
import { LogOut, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import axiosInstance from '../../utils/axiosInstance';

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/logout-admin');
    } catch (e) {
      // ignore
    }
    window.location.href = '/login';
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <Shield className="h-7 w-7 text-blue-400" />
        <span className="text-xl font-bold">Eshop Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
