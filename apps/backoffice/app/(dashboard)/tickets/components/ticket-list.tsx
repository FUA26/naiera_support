"use client";

import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/lib/contexts/app-context";
import { TicketsClient } from "./tickets-client";

interface Props {
  currentUserId: string;
}

export function TicketList({ currentUserId }: Props) {
  const { selectedAppId, accessibleApps, hasAllAccess, isLoading: appLoading } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", selectedAppId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("pageSize", "100"); // Get max for client-side filtering

      // Add app filter if an app is selected (and not "all" for admins)
      if (selectedAppId && selectedAppId !== "all") {
        params.set("appId", selectedAppId);
      }

      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !appLoading,
  });

  if (appLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show empty state if user has no app access
  if (!hasAllAccess && accessibleApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-muted-foreground mb-2">No App Access</div>
        <p className="text-sm text-muted-foreground">
          You don't have access to any apps. Request access from an administrator.
        </p>
      </div>
    );
  }

  const tickets = data?.items ?? [];

  return <TicketsClient tickets={tickets} currentUserId={currentUserId} />;
}
