"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/lib/rbac-client/provider";
import { useApp } from "@/lib/contexts/app-context";
import { AppSwitcher } from "@/components/dashboard/app-switcher";
import {
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  FolderKanban,
  Users,
  Shield,
  Key,
  Settings,
  LifeBuoy,
} from "lucide-react";

const navItems = [
  // Overview Group
  { heading: "Overview" },
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/analytics", label: "Analytics", icon: BarChart3, permission: null },

  // Work Management Group
  { heading: "Work" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: null },
  { href: "/tickets", label: "Tickets", icon: LifeBuoy, permission: "TICKET_VIEW_ALL" },
  { href: "/apps", label: "Apps", icon: FolderKanban, permission: "TICKET_APP_VIEW" },

  // User & Access Management Group
  { heading: "Users & Access" },
  { href: "/manage/users", label: "Users", icon: Users, permission: "ADMIN_USERS_MANAGE" },
  { href: "/manage/roles", label: "Roles", icon: Shield, permission: "ADMIN_ROLES_MANAGE" },
  {
    href: "/manage/permissions",
    label: "Permissions",
    icon: Key,
    permission: "ADMIN_PERMISSIONS_MANAGE",
  },

  // Settings Group
  { heading: "Settings" },
  {
    href: "/manage/system-settings",
    label: "System Settings",
    icon: Settings,
    permission: "ADMIN_SYSTEM_SETTINGS_MANAGE",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const userPermissions = usePermissions();

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    // If no permission required, always show
    if (!item.permission) return true;
    // If permission required, check if user has it
    return userPermissions?.permissions.includes(item.permission);
  });

  // Filter out headings if they have no items
  const finalNavItems = filteredNavItems.filter((item, index, array) => {
    if (!("heading" in item)) return true;

    // Keep heading if there are non-heading items after it before the next heading
    const nextHeadingIndex = array.findIndex((i, idx) => idx > index && "heading" in i);

    const itemsAfterHeading = array.slice(
      index + 1,
      nextHeadingIndex === -1 ? undefined : nextHeadingIndex
    );

    return itemsAfterHeading.some((i) => !("heading" in i));
  });

  // Group navigation items by their headings
  const groupedItems = finalNavItems.reduce(
    (groups, item) => {
      if ("heading" in item) {
        groups.push({ heading: item.heading, items: [] });
      } else {
        const currentGroup = groups[groups.length - 1];
        if (currentGroup) {
          currentGroup.items.push(item);
        }
      }
      return groups;
    },
    [] as Array<{ heading?: string; items: typeof navItems }>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-primary">
                  <Image
                    src="/logo.svg"
                    alt="Naiera Logo"
                    width={32}
                    height={32}
                    className="size-6"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Naiera</span>
                  <span className="truncate text-xs text-muted-foreground">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <AppSwitcher />
      <SidebarContent>
        {groupedItems.map((group, idx) => (
          <SidebarGroup key={idx}>
            {group.heading && <SidebarGroupLabel>{group.heading}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if ("heading" in item) return null;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
