'use client';

import { NAV_ITEMS, NavItemTypes } from 'apps/user-ui/src/configs/constants';
import {
  LayoutGrid,
  Heart,
  ShoppingCart,
  User2Icon,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ProfileDropdown from './profile-dropdown';
import useUser from '../../../hooks/useUser';
import { useAtom } from 'jotai';
import { cartCountAtom } from '../../../store/cartAtom';

function HeaderBottom() {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading, isError } = useUser();
  const pathname = usePathname();
  const [cartCount] = useAtom(cartCountAtom);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 hidden md:block ${
        isSticky
          ? 'fixed top-0 left-0 z-50 glass shadow-lg border-b border-gray-100 animate-slide-down'
          : 'relative border-t border-gray-100'
      }`}
    >
      <div className="w-[90%] max-w-7xl mx-auto flex items-center justify-between h-12">
        {/* Categories Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShow(!show)}
            className="flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-white text-sm font-medium transition-all duration-200"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Categories</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${show ? 'rotate-180' : ''}`}
            />
          </button>

          {show && (
            <div className="absolute left-0 top-[calc(100%+4px)] w-[240px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
              {[
                'Electronics',
                'Clothing & Fashion',
                'Home & Garden',
                'Sports & Outdoors',
                'Books & Media',
                'Health & Beauty',
              ].map(cat => (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={() => setShow(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {cat}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <Link
                  href="/products"
                  onClick={() => setShow(false)}
                  className="block px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  View All Categories
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item: NavItemTypes) => {
            const isActive = pathname === item.href;
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                >
                  {item.title}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Sticky Header Right Section */}
        <div>
          {isSticky && (
            <div className="flex items-center gap-2 animate-fade-in">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : user && !isError ? (
                <ProfileDropdown user={user} />
              ) : (
                <Link
                  href="/login"
                  className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <User2Icon className="h-5 w-5 text-gray-600" />
                </Link>
              )}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-lg hover:bg-pink-50 transition-colors group"
              >
                <Heart className="h-4 w-4 text-gray-500 group-hover:text-pink-500 transition-colors" />
              </Link>
              <Link
                href="/cart"
                className="relative p-2 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <ShoppingCart className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderBottom;
