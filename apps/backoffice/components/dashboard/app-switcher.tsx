"use client";

import { ChevronDown, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/contexts/app-context";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function AppSwitcher() {
  const { selectedAppId, setSelectedAppId, accessibleApps, hasAllAccess, isLoading } = useApp();

  // Fetch ticket counts per app
  const { data: counts } = useQuery({
    queryKey: ["app-ticket-counts"],
    queryFn: async () => {
      const res = await fetch("/api/apps/ticket-counts");
      if (!res.ok) return {};
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const currentApp = selectedAppId === "all"
    ? { id: "all", name: "All Apps", slug: "all" }
    : accessibleApps.find((a) => a.id === selectedAppId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between px-3 py-2 text-sm font-medium",
            !selectedAppId && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{currentApp?.name || "Select App"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {hasAllAccess && (
          <>
            <DropdownMenuItem
              onClick={() => setSelectedAppId("all")}
              className={selectedAppId === "all" ? "bg-accent" : ""}
            >
              <Building2 className="mr-2 h-4 w-4" />
              All Apps
              {selectedAppId === "all" && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {accessibleApps.map((app) => (
          <DropdownMenuItem
            key={app.id}
            onClick={() => setSelectedAppId(app.id)}
            className={selectedAppId === app.id ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="flex-1">{app.name}</span>
            {counts?.[app.id] !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {counts[app.id]}
              </Badge>
            )}
            {selectedAppId === app.id && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
