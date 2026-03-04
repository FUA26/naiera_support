"use client";

import { getStorageUsage, getTotalUsers } from "@/lib/analytics/data-fetchers";
import { generateMockApiRequests, getActiveSessions } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Users, Zap } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart } from "recharts";
import { ChartWrapper } from "./chart-wrapper";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#ef4444"];

export function SummaryCards() {
  // Fetch real data
  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: getTotalUsers,
  });

  const { data: storageData } = useQuery({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
  });

  // Mock data
  const activeSessions = getActiveSessions();
  const apiRequests = generateMockApiRequests(7);

  // Growth trend for users (mock percentage)
  const userGrowth = "+12% from last month";

  // Storage donut chart data
  const storageChartData = storageData
    ? [
        { name: "Uploads", value: storageData.breakdown.uploads || 0 },
        { name: "Avatars", value: storageData.breakdown.avatars || 0 },
        { name: "Database", value: storageData.breakdown.database || 0 },
        { name: "Logs", value: storageData.breakdown.logs || 0 },
        { name: "Other", value: storageData.breakdown.other || 0 },
      ].filter((d) => d.value > 0)
    : [];

  // API request mini chart data
  const apiChartData = apiRequests.slice(-7).map((d) => ({
    value: d.requests,
  }));

  const activePercentage = (activeSessions.current / activeSessions.capacity) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Users */}
      <ChartWrapper title="Total Users" icon={Users} accentColor="blue">
        <div className="space-y-2">
          <p className="text-3xl font-bold">{totalUsers || 0}</p>
          <p className="text-sm text-muted-foreground">{userGrowth}</p>
          <div className="h-12">
            <AreaChart width={200} height={48} data={apiChartData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </div>
        </div>
      </ChartWrapper>

      {/* Card 2: Active Sessions */}
      <ChartWrapper title="Active Sessions" icon={Activity} accentColor="green">
        <div className="space-y-2">
          <p className="text-3xl font-bold">{activeSessions.current}</p>
          <p className="text-sm text-muted-foreground">Peak: {activeSessions.peak} today</p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>
      </ChartWrapper>

      {/* Card 3: API Requests */}
      <ChartWrapper title="API Requests (24h)" icon={Zap} accentColor="orange">
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            {apiRequests.reduce((sum, d) => sum + d.requests, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {Math.round(apiRequests.reduce((sum, d) => sum + d.requests, 0) / 86400)}/sec avg
          </p>
          <div className="h-12">
            <AreaChart width={200} height={48} data={apiChartData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.3}
              />
            </AreaChart>
          </div>
        </div>
      </ChartWrapper>

      {/* Card 4: Storage Used */}
      <ChartWrapper title="Storage Used" icon={Database} accentColor="cyan">
        <div className="space-y-2">
          {storageData && (
            <>
              <p className="text-3xl font-bold">
                {(storageData.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB
              </p>
              <p className="text-sm text-muted-foreground">{storageData.totalFiles} files</p>
              <div className="h-12 flex items-center justify-center">
                <PieChart width={100} height={100}>
                  <Pie
                    data={storageChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    innerRadius={25}
                    paddingAngle={2}
                  >
                    {storageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </>
          )}
        </div>
      </ChartWrapper>
    </div>
  );
}
