"use client";

import { getStorageUsage } from "@/lib/analytics/data-fetchers";
import { generateMockBandwidth } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { HardDrive, TrendingUp } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

const STORAGE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899"];

const FILE_TYPE_COLORS: Record<string, string> = {
  image: "#3b82f6",
  document: "#22c55e",
  video: "#f97316",
  other: "#a855f7",
};

export function ResourceSection() {
  const { data: storageData } = useQuery({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
  });

  const bandwidthData = generateMockBandwidth();

  // Storage pie chart data
  const storageChartData = storageData
    ? [
        { name: "Uploads", value: storageData.breakdown.uploads || 0 },
        { name: "Avatars", value: storageData.breakdown.avatars || 0 },
        { name: "Database", value: storageData.breakdown.database || 0 },
        { name: "Logs", value: storageData.breakdown.logs || 0 },
        { name: "Other", value: storageData.breakdown.other || 0 },
      ].filter((d) => d.value > 0)
    : [];

  // Bandwidth scatter chart data
  const scatterData = bandwidthData.map((d) => ({
    x: new Date(d.time).getTime(),
    y: d.fileSize,
    z: d.requests,
    fileType: d.fileType,
  }));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Resource Usage</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Breakdown - Pie Chart */}
        <ChartWrapper title="Storage Breakdown" icon={HardDrive} accentColor="blue">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatFileSize(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {storageChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STORAGE_COLORS[index % STORAGE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatFileSize(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Bandwidth Usage - Bubble Chart */}
        <ChartWrapper title="Bandwidth Usage" icon={TrendingUp} accentColor="orange">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis
                type="number"
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis type="number" dataKey="y" tickFormatter={(value) => formatFileSize(value)} />
              <ZAxis type="number" dataKey="z" range={[50, 300]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p>Time: {new Date(data.x).toLocaleString()}</p>
                        <p>Size: {formatFileSize(data.y)}</p>
                        <p>Requests: {data.z}</p>
                        <p>Type: {data.fileType}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FILE_TYPE_COLORS[entry.fileType ?? "other"]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </section>
  );
}
