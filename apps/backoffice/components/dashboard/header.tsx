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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <PageIcon className="h-5 w-5 text-muted-foreground" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-4">
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
