"use client";

/**
 * Users Table Component
 *
 * Example client component demonstrating:
 * - useCan hook for conditional rendering
 * - Can component for permission-based UI
 * - Shield component for visual feedback
 */

import { Can } from "@/components/rbac/Can";
import { Shield } from "@/components/rbac/Shield";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCan, usePermissions } from "@/lib/rbac-client/hooks";
import { Delete01Icon, Edit01Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: {
    name: string;
  };
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  // Permission hooks for conditional rendering
  const canReadAny = useCan(["USER_READ_ANY"]);
  const canUpdateAny = useCan(["USER_UPDATE_ANY"]);
  const canDeleteAny = useCan(["USER_DELETE_ANY"]);

  useEffect(() => {
    if (canReadAny) {
      fetchUsers();
    }
  }, [canReadAny]);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="rounded-lg border p-6 text-center">Loading...</div>;
  }

  if (!canReadAny) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        You don&apos;t have permission to view users.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || "—"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {user.role.name}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {/* View button - available to all authenticated users */}
                  <Button variant="ghost" size="icon">
                    <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                  </Button>

                  {/* Edit button - requires USER_UPDATE_ANY */}
                  <Can permissions={["USER_UPDATE_ANY"]}>
                    <Button variant="ghost" size="icon">
                      <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                    </Button>
                  </Can>

                  {/* Delete button with Shield for visual feedback */}
                  <Shield
                    permissions={["USER_DELETE_ANY"]}
                    message="Only administrators can delete users"
                    type="tooltip"
                  >
                    <Button variant="ghost" size="icon">
                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                    </Button>
                  </Shield>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Show info about current permissions */}
      {permissions && (
        <div className="border-t p-4">
          <p className="text-sm text-muted-foreground">
            Your permissions: {permissions.permissions.length} total
          </p>
        </div>
      )}
    </div>
  );
}
