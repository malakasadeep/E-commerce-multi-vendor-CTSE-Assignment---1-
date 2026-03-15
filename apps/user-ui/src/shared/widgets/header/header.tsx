'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  Search,
  User2Icon,
  Heart,
  ShoppingCart,
  LogOut,
  Package,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import HeaderBottom from './header-bottom';
import useUser from '../../../hooks/useUser';
import { cartCountAtom } from '../../../store/cartAtom';
import { NAV_ITEMS } from '../../../configs/constants';

function Header() {
  const { user, isLoading, isError } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useAtom(cartCountAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white shadow-sm relative z-40">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-xs font-medium tracking-wide">
        Free shipping on orders over $50 &mdash; Shop now and save!
      </div>

      {/* Main Header */}
      <div className="w-[90%] max-w-7xl mx-auto py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-Poppins text-gradient hidden sm:block">
            Eshop
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
          <div className="w-full relative group">
            <input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-sm font-Poppins placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* User Section */}
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="hidden lg:block">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : user && !isError ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User2Icon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-[11px] text-gray-500 leading-none">Hello,</p>
                  <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {user.firstName || user.name || 'User'}
                  </p>
                </div>
              </Link>
              <Link
                href="/orders"
                className="relative p-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
                title="My Orders"
              >
                <Package className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
                className="p-2.5 rounded-xl hover:bg-red-50 transition-colors group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <User2Icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="hidden lg:block">
                <p className="text-[11px] text-gray-500 leading-none">Hello,</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                  Sign In
                </p>
              </div>
            </Link>
          )}

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-1" />

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2.5 rounded-xl hover:bg-pink-50 transition-colors group"
          >
            <Heart className="h-5 w-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
          >
            <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none transition-all text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <Search className="h-3.5 w-3.5 text-white" />
          </button>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-down">
          <nav className="w-[90%] mx-auto py-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {item.title}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </div>
      )}

      <HeaderBottom />
    </header>
  );
}

export default Header;
