import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Detailed analytics and reports",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
