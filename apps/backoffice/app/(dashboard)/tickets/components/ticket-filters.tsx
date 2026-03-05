"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Filters {
  page: number;
  pageSize: number;
  status?: string;
  assignedTo?: string;
  search?: string;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TicketFilters({ filters, onFiltersChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Input
        placeholder="Search tickets..."
        value={filters.search || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onFiltersChange({ ...filters, search: e.target.value, page: 1 })
        }
        className="w-64"
      />
      <Select
        value={filters.status || "all"}
        onValueChange={(value: string) =>
          onFiltersChange({
            ...filters,
            status: value === "all" ? undefined : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.assignedTo || "all"}
        onValueChange={(value: string) =>
          onFiltersChange({
            ...filters,
            assignedTo: value === "all" ? undefined : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Assigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="mine">Mine</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
        </SelectContent>
      </Select>
      {(filters.status || filters.assignedTo || filters.search) && (
        <Button
          variant="ghost"
          onClick={() =>
            onFiltersChange({ page: 1, pageSize: filters.pageSize })
          }
        >
          Clear
        </Button>
      )}
    </div>
  );
}
