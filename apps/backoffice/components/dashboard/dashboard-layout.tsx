"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "./header";
import { CommandDialog } from "./search-command/command-dialog";
import { AppSidebar } from "./sidebar";

interface DashboardLayoutProps {
  user: {
    email?: string | null;
    name?: string | null;
    avatarId?: string | null;
    role?: {
      name: string;
    } | null;
  };
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
      <CommandDialog />
    </SidebarProvider>
  );
}
