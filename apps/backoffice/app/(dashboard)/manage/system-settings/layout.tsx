import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Settings",
  description: "Configure system settings",
};

export default function SystemSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
