'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Store, LogOut, ShoppingBag } from 'lucide-react';
import SidebarItems from './Sidebar.items';
import { SIDEBAR_MENU } from './sidebar.menu';
import useSeller from '../../../../hooks/useSeller';
import axios from 'axios';
import Link from 'next/link';

function SideBarWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/logout-seller`,
        {},
        {
          withCredentials: true,
        }
      );
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-[260px] h-screen bg-[#0f0f14] text-white flex flex-col border-r border-white/[0.06] relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />

      {/* Shop Header */}
      <div className="relative z-10 p-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 mb-4 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold font-Poppins bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Eshop
          </span>
          <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
            Seller
          </span>
        </Link>

        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-1.5">
                <div className="h-3.5 bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-2.5 bg-white/5 rounded w-full animate-pulse" />
              </div>
            ) : seller?.shop ? (
              <>
                <h2 className="text-xs font-semibold text-white truncate">
                  {seller.shop.name || 'My Shop'}
                </h2>
                <p className="text-[10px] text-gray-500 truncate">
                  {seller.shop.address || 'No address set'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xs font-semibold text-white">My Shop</h2>
                <p className="text-[10px] text-gray-500">No shop found</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="relative z-10 flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <nav className="space-y-5">
          {SIDEBAR_MENU.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.1em] px-3 mb-1.5">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarItems
                      key={item.href}
                      icon={<Icon className="w-[18px] h-[18px]" />}
                      title={item.label}
                      isActive={isActive}
                      href={item.href}
                      badge={item.badge}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Seller Info & Logout */}
      <div className="relative z-10 p-3 border-t border-white/[0.06]">
        {seller && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white uppercase">
              {seller.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">
                {seller.name}
              </p>
              <p className="text-[10px] text-gray-600 truncate">
                {seller.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-gray-500 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default SideBarWrapper;
