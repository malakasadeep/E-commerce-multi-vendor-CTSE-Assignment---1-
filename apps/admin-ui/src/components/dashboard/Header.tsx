'use client';

import React from 'react';
import useAdmin from '../../hooks/useAdmin';
import { Shield } from 'lucide-react';

export default function Header() {
  const { admin } = useAdmin();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{admin?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs">{admin?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
