import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles",
  description: "Manage user roles",
};

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
