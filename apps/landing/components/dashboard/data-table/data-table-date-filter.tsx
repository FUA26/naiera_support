"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { format, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { IconCalendar, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface DateFilterValue {
  from?: Date;
  to?: Date;
}

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title = "Tanggal",
}: DataTableDateFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Sync with column filter value from URL
  React.useEffect(() => {
    const filterValue = column?.getFilterValue() as DateFilterValue | undefined;
    if (filterValue) {
      setDateRange({
        from: filterValue.from ? new Date(filterValue.from) : undefined,
        to: filterValue.to ? new Date(filterValue.to) : undefined,
      });
    } else {
      setDateRange(undefined);
    }
  }, [column?.getFilterValue()]);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from) {
      // Apply filter - if no 'to' yet, use 'from' as both
      const toDate = range.to || range.from;
      column?.setFilterValue({
        from: range.from,
        to: toDate,
      } as DateFilterValue);
    } else {
      column?.setFilterValue(undefined);
    }
  };

  const handleClear = () => {
    setDateRange(undefined);
    column?.setFilterValue(undefined);
    setOpen(false);
  };

  const hasFilter = dateRange?.from;
  const isSingleDate =
    dateRange?.from && dateRange?.to && isSameDay(dateRange.from, dateRange.to);

  const getDisplayText = () => {
    if (!dateRange?.from) return title;

    if (isSingleDate) {
      return format(dateRange.from, "d MMM yyyy", { locale: localeId });
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "d MMM", { locale: localeId })} - ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}`;
    }

    return format(dateRange.from, "d MMM yyyy", { locale: localeId });
  };

  const getFilterInfo = () => {
    if (!dateRange?.from) return null;

    if (isSingleDate) {
      return format(dateRange.from, "EEEE, d MMMM yyyy", { locale: localeId });
    }

    if (dateRange.to) {
      const days =
        Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
      return `${format(dateRange.from, "d MMMM", { locale: localeId })} - ${format(dateRange.to, "d MMMM yyyy", { locale: localeId })} (${days} hari)`;
    }

    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            hasFilter && "border-primary bg-primary/5"
          )}
        >
          <IconCalendar className="mr-2 h-4 w-4" />
          <span className={cn(!hasFilter && "text-muted-foreground")}>
            {getDisplayText()}
          </span>
          {hasFilter && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {isSingleDate ? "1" : "Range"}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <IconCalendar className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-medium">Filter Tanggal</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Pilih tanggal atau rentang
          </p>
        </div>

        {/* Calendar - Always range mode */}
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
          locale={localeId}
          className="p-3"
        />

        {/* Footer */}
        {hasFilter && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground truncate text-xs">
                  {getFilterInfo()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive h-7 shrink-0 gap-1 px-2"
              >
                <IconX className="h-3 w-3" />
                Hapus
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
