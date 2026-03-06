"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/lib/contexts/app-context";
import { TicketTable } from "./ticket-table";
import { TicketFilters } from "./ticket-filters";

interface Filters {
  page: number;
  pageSize: number;
  status?: string;
  assignedTo?: string;
  search?: string;
}

export function TicketList() {
  const { selectedAppId, accessibleApps, hasAllAccess, isLoading: appLoading } = useApp();

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", filters, selectedAppId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));

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

  return (
    <div className="space-y-4">
      <TicketFilters filters={filters} onFiltersChange={setFilters} />
      <TicketTable
        tickets={data?.items || []}
        isLoading={isLoading}
        total={data?.total || 0}
        page={filters.page}
        pageSize={filters.pageSize}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
