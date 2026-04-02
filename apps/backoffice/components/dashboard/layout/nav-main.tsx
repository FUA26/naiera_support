'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'

export function NavMain({
  items,
  userPermissions = [],
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    requiredPermission?: string
    items?: {
      title: string
      url: string
      requiredPermission?: string
    }[]
  }[]
  userPermissions?: string[]
}) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const pathname = usePathname()

  const hasWildcard = userPermissions.includes('*')

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    return hasWildcard || userPermissions.includes(permission)
  }

  const isUrlActive = (url: string) => {
    if (url === '#') return false
    return pathname === url || pathname.startsWith(url + '/')
  }

  const hasActiveSubItem = (
    subItems?: { title: string; url: string; requiredPermission?: string }[]
  ) => {
    if (!subItems) return false
    return subItems.some(
      (subItem) =>
        hasPermission(subItem.requiredPermission) && isUrlActive(subItem.url)
    )
  }

  const filteredItems = items
    .filter((item) => hasPermission(item.requiredPermission))
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) =>
        hasPermission(subItem.requiredPermission)
      ),
    }))
    .filter((item) => !item.items || item.items.length > 0)

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="mt-1">
        {filteredItems.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isItemActive = isUrlActive(item.url)
          const isSubActive = hasActiveSubItem(item.items)
          const shouldBeOpen = isSubActive || item.isActive

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isItemActive}
                >
                  <Link href={item.url} className="gap-3">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          if (isCollapsed) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isSubActive}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    className="min-w-[180px]"
                  >
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                      {item.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => {
                      const isSubItemActive = isUrlActive(subItem.url)
                      return (
                        <DropdownMenuItem
                          key={subItem.title}
                          asChild
                          className={isSubItemActive ? 'bg-accent' : ''}
                        >
                          <Link
                            href={subItem.url}
                            className="cursor-pointer text-sm"
                          >
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldBeOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isSubActive}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6">
                  <SidebarMenuSub className="mt-1 gap-0.5">
                    {item.items?.map((subItem) => {
                      const isSubItemActive = isUrlActive(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubItemActive}
                          >
                            <Link href={subItem.url}>
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
