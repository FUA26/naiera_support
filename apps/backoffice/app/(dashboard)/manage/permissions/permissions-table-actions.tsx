"use client";

/**
 * Permissions Table Actions Component
 *
 * Client component for managing permissions with CRUD operations
 * Uses PermissionsDataTable for advanced table features
 */

import { PermissionsDataTable } from "@/components/admin/permissions-data-table";
import { PermissionsTableSkeleton } from "@/components/admin/permissions-table-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PermissionRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  _count?: {
    rolePermissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface PermissionStats {
  total: number;
  byCategory: Record<string, number>;
  unused: number;
}

/**
 * Statistics Dashboard Component
 */
function PermissionsStats({ stats }: { stats: PermissionStats | null }) {
  if (!stats) return null;

  const categories = Object.keys(stats.byCategory);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Available in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-xs text-muted-foreground">Permission categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Unused</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.unused}</p>
          <p className="text-xs text-muted-foreground">Not assigned to roles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total - stats.unused}</p>
          <p className="text-xs text-muted-foreground">Assigned to roles</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main wrapper component that fetches data and renders the data table
 */
export function PermissionsTableWithActions() {
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load permissions
  const loadPermissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeUsage: "true",
        stats: "true",
      });

      const response = await fetch(`/api/permissions?${params}`);
      if (!response.ok) throw new Error("Failed to load permissions");

      const data = await response.json();
      setPermissions(data.permissions);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  if (loading) {
    return <PermissionsTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <PermissionsStats stats={stats} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <p className="text-muted-foreground">
          Create and manage permissions for role-based access control
        </p>
      </div>

      {/* Data Table with integrated create button and search */}
      <PermissionsDataTable data={permissions} onRefresh={loadPermissions} />
    </div>
  );
}
