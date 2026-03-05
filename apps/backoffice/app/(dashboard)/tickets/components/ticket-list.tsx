"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.assignedTo) params.set("assignedTo", filters.assignedTo);
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page));
      params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`/api/tickets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

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
