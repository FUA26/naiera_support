"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function HeaderNotifications() {
  // Mock notifications - in real app, this would come from props or API
  const unreadCount = 3;
  const notifications = [
    {
      id: 1,
      title: "New message from John",
      description: "Hey, how are you doing?",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Your report is ready",
      description: "Monthly analytics report is available",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "System update",
      description: "New features have been deployed",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 4,
      title: "Welcome!",
      description: "Thanks for joining our platform",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {notification.description}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="bg-primary mt-1 h-2 w-2 rounded-full" />
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-center">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
