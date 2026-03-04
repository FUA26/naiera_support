"use client";

import { ActivitySection } from "@/components/analytics/activity-section";
import { FilterBar } from "@/components/analytics/filter-bar";
import { ResourceSection } from "@/components/analytics/resource-section";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { SystemStatsSection } from "@/components/analytics/system-stats-section";
import { UserStatsSection } from "@/components/analytics/user-stats-section";
import { useState } from "react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Monitor your system performance</p>
      </div>

      <SummaryCards />

      <FilterBar
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="space-y-6">
        <UserStatsSection dateRange={dateRange} />

        <SystemStatsSection />

        <ActivitySection dateRange={dateRange} />

        <ResourceSection />
      </div>
    </div>
  );
}
