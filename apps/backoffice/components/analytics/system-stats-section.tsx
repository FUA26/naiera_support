"use client";

import {
  generateMockApiRequests,
  generateMockCacheHitRate,
  generateMockResponseTime,
} from "@/lib/analytics/mock-data";
import { Activity, Clock, Database } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export function SystemStatsSection() {
  const [apiData, setApiData] = useState(generateMockApiRequests(7));
  const [responseTimeData, setResponseTimeData] = useState(generateMockResponseTime());
  const [cacheData, setCacheData] = useState(generateMockCacheHitRate());

  const refreshData = () => {
    setApiData(generateMockApiRequests(7));
    setResponseTimeData(generateMockResponseTime());
    setCacheData(generateMockCacheHitRate());
  };

  // Transform for area chart
  const areaChartData = apiData.map((d) => ({
    date: new Date(d.date ?? new Date().toISOString()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    requests: d.requests,
  }));

  // Response time chart
  const barChartData = responseTimeData.map((d) => ({
    name: d.range,
    value: d.count,
  }));

  // Cache gauge color
  const cacheColor =
    cacheData.hitRate >= 80 ? "#22c55e" : cacheData.hitRate >= 50 ? "#eab308" : "#ef4444";

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">System Statistics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Request Volume - Area Chart */}
        <ChartWrapper title="API Request Volume" icon={Activity} accentColor="pink">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={areaChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#ec4899"
                fill="url(#colorPink)"
                fillOpacity={1}
              />
              <defs>
                <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Response Time Distribution - Bar Chart */}
        <ChartWrapper title="Response Time Distribution" icon={Clock} accentColor="cyan">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Cache Hit Rate - Gauge */}
        <ChartWrapper title="Cache Hit Rate" icon={Database} accentColor="green">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={cacheColor}
                  strokeWidth="12"
                  strokeDasharray={`${(cacheData.hitRate / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{cacheData.hitRate}%</span>
                <span className="text-sm text-gray-500">Hit Rate</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {cacheData.hits.toLocaleString()} / {cacheData.total.toLocaleString()} hits
            </p>
          </div>
        </ChartWrapper>
      </div>
    </section>
  );
}
