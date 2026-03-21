"use client";
import React from "react";
import { AppSidebar } from "../../../components/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { Separator } from "../../../components/ui/separator";
import useSeller from "../../../hooks/useSeller";

function Layout({ children }: { children: React.ReactNode }) {
  const { seller, isLoading } = useSeller();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                Welcome back{!isLoading && seller?.name ? `, ${seller.name}` : ""}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
