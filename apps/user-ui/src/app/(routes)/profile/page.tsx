'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useUser from '../../../hooks/useUser';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  User2Icon,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { key: 'account', label: 'My Account', icon: User2Icon },
  { key: 'orders', label: 'My Orders', href: '/orders', icon: Package },
  { key: 'wishlist', label: 'Wishlist', href: '/wishlist', icon: Heart },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, isError } = useUser();
  const activeTab = searchParams.get('tab') || 'account';

  if (!isLoading && (!user || isError)) {
    router.replace('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-[90%] max-w-7xl mx-auto py-8">
        <div className="flex gap-8">
          <div className="w-72 shrink-0">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.firstName || user.name || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="w-[90%] max-w-7xl mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 ring-4 ring-white/30">
                {initials}
              </div>
              <h2 className="text-white font-semibold text-lg font-Poppins">
                {displayName}
              </h2>
              {user.email && (
                <p className="text-blue-100 text-sm mt-1">{user.email}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-2">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = item.key === activeTab;
                const isLink = !!item.href;

                const content = (
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`h-4.5 w-4.5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        isActive ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    />
                  </div>
                );

                if (isLink) {
                  return (
                    <Link key={item.key} href={item.href!}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={`/profile?tab=${item.key}`}
                    scroll={false}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Account Tab ─── */
function AccountTab({ user }: { user: any }) {
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user.name || 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          My Account
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 font-Poppins">
            Personal Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              icon={<User2Icon className="h-4 w-4" />}
              label="Full Name"
              value={displayName}
            />
            <InfoField
              icon={<Mail className="h-4 w-4" />}
              label="Email Address"
              value={user.email || 'Not provided'}
            />
            <InfoField
              icon={<Calendar className="h-4 w-4" />}
              label="Member Since"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
              }
            />
            <InfoField
              icon={<Shield className="h-4 w-4" />}
              label="Account Status"
              value="Active"
              badge
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink
          href="/orders"
          icon={<Package className="h-5 w-5" />}
          title="My Orders"
          description="Track and manage your orders"
          color="blue"
        />
        <QuickLink
          href="/wishlist"
          icon={<Heart className="h-5 w-5" />}
          title="Wishlist"
          description="Items you've saved for later"
          color="pink"
        />
        <QuickLink
          href="/profile?tab=addresses"
          icon={<MapPin className="h-5 w-5" />}
          title="Addresses"
          description="Manage delivery addresses"
          color="indigo"
        />
      </div>
    </div>
  );
}

/* ─── Addresses Tab ─── */
function AddressesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          My Addresses
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your delivery addresses
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No addresses saved
        </h3>
        <p className="text-gray-500 text-sm">
          Add a delivery address to make checkout faster
        </p>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-Poppins">
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 font-Poppins">
            Account Security
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-500">{user.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-sm text-gray-500">Last changed: Unknown</p>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable Sub-components ─── */
function InfoField({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {badge ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {value}
          </span>
        ) : (
          <p className="text-sm font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  };

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
    >
      <div
        className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3 transition-colors`}
      >
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
