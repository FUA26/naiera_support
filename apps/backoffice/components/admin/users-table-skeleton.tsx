"use client";

/**
 * Users Table Skeleton Component
 *
 * Displays skeleton placeholders while users data is being fetched
 */

import { Skeleton } from "@/components/ui/skeleton";

export function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
