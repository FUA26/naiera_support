"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { IconX, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DataTableActionBarProps<TData> {
  table: Table<TData>;
  children?: (
    selectedRows: TData[],
    resetSelection: () => void
  ) => React.ReactNode;
}

export function DataTableActionBar<TData>({
  table,
  children,
}: DataTableActionBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedData = selectedRows.map((row) => row.original);

  const resetSelection = () => {
    table.resetRowSelection();
  };

  if (selectedCount === 0) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 duration-300">
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
            {selectedCount}
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            {selectedCount === 1 ? "row" : "rows"} selected
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Custom actions */}
        {children && children(selectedData, resetSelection)}

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={resetSelection}
        >
          <IconX className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
