"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { getPageTitle } from "@/lib/dashboard/page-title";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";
import { UserDropdown } from "./user-dropdown";

interface HeaderProps {
  user: {
    email?: string | null;
    name?: string | null;
    avatarId?: string | null;
    role?: {
      name: string;
    } | null;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const { icon: PageIcon } = getPageTitle(pathname);

  return (
    <header className="header-startup sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 px-4">
      {/* Sidebar Trigger - Clean Style */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" />

      {/* Page Icon with soft background */}
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PageIcon className="h-4 w-4" />
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Search Icon - Soft Style */}
        <button className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notifications */}
        <button className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </button>

        {/* User Dropdown */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
