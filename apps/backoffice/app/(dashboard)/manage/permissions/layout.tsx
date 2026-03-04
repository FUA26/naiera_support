import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions",
  description: "Manage system permissions",
};

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
