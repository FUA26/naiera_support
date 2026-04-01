"use client";

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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/lib/rbac-client/provider";
import { useApp } from "@/lib/contexts/app-context";
import { AppSwitcher } from "@/components/dashboard/app-switcher";
import { getAppIdentity } from "@/lib/config/app-identity";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Shield,
  Key,
  Settings,
  LifeBuoy,
  Bell,
  ChevronRight,
} from "lucide-react";

const navItems = [
  // Overview Group
  { heading: "Overview" },
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },

  // Work Management Group
  { heading: "Work" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: null },
  { href: "/tickets", label: "Tickets", icon: LifeBuoy, permission: "TICKET_VIEW_ALL" },
  { href: "/apps", label: "Apps", icon: FolderKanban, permission: "TICKET_APP_VIEW" },

  // User & Access Management Group
  { heading: "Users & Access" },
  { href: "/access-requests", label: "Access Requests", icon: Bell, permission: "TICKET_APP_APPROVE" },
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
  const appIdentity = getAppIdentity();
  const AppIcon = appIdentity.icon;

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return userPermissions?.permissions.includes(item.permission);
  });

  // Filter out headings if they have no items
  const finalNavItems = filteredNavItems.filter((item, index, array) => {
    if (!("heading" in item)) return true;

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <Sidebar className="sidebar-pisky">
      {/* Header - App Branding */}
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/20">
              <Link href="/" className="flex items-center gap-3">
                {/* App Icon with Gradient */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg">
                  <AppIcon className="size-5 text-primary" strokeWidth={2.5} />
                </div>

                {/* App Info */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-text">{appIdentity.shortName}</span>
                  <span className="truncate text-xs text-sidebar-text-muted/70">{appIdentity.tagline}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* App Switcher */}
      <div className="px-3 py-3">
        <AppSwitcher />
      </div>

      {/* Navigation */}
      <SidebarContent className="px-3">
        {groupedItems.map((group, idx) => (
          <SidebarGroup key={idx} className="mb-4">
            {group.heading && (
              <SidebarGroupLabel className="sidebar-heading-pisky px-2 py-1.5 text-xs">
                {group.heading}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if ("heading" in item) return null;
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={active
                          ? "sidebar-item-pisky-active"
                          : "sidebar-item-pisky"
                        }
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`size-4 ${active ? "" : ""}`} />
                          <span className={active ? "" : ""}>{item.label}</span>
                          {active && (
                            <ChevronRight className="ml-auto size-3.5" />
                          )}
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

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-3">
        <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white shadow">
            <AppIcon className="size-4 text-primary" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-medium text-sidebar-text">{appIdentity.name}</div>
            <div className="text-sidebar-text-muted/70">v{appIdentity.version}</div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
