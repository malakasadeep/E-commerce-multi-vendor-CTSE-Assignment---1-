'use client';
import React from 'react';
import SideBarWrapper from '../../shared/components/sidebar/sidebat';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
      <aside className="flex-shrink-0">
        <SideBarWrapper />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default Layout;
