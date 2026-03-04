"use client";

import { getRecentActivity } from "@/lib/analytics/data-fetchers";
import { generateMockLoginActivity } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock } from "lucide-react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export function ActivitySection({ dateRange = "30" }: { dateRange?: string }) {
  const days = parseInt(dateRange) || 30;

  const { data: activities } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: getRecentActivity,
  });

  const loginData = generateMockLoginActivity(days);

  const lineChartData = loginData.map((d) => ({
    date: new Date(d.date ?? new Date().toISOString()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    successful: d.successful,
    failed: d.failed,
  }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Activity Logs</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity - Line Chart */}
        <ChartWrapper title="Login Activity Over Time" icon={Activity} accentColor="green">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Recent Activity - Table */}
        <ChartWrapper title="Recent Activity" icon={Clock} accentColor="blue">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}
                  >
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>
    </section>
  );
}
