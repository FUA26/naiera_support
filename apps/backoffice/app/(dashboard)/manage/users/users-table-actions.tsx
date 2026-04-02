"use client";

/**
 * Users Table with Actions
 *
 * Client component that fetches users and wraps the UsersDataTable
 */

import { UserDialog } from "@/components/admin/user-dialog";
import { UsersDataTable } from "@/components/admin/users-data-table";
import { UsersTableSkeleton } from "@/components/admin/users-table-skeleton";
import { Button } from "@/components/ui/button";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: { id: string; name: string };
  createdAt: Date;
}

interface UserApiResponse {
  id: string;
  name: string | null;
  email: string;
  role: { id: string; name: string };
  createdAt: string;
}

export function UsersTableWithActions() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(
        (data.users || []).map((u: UserApiResponse) => ({
          ...u,
          createdAt: new Date(u.createdAt),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  if (loading) {
    return <UsersTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <HugeiconsIcon icon={AddCircleIcon} className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UsersDataTable users={users} onRefresh={handleRefresh} />
      <UserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleRefresh}
      />
    </div>
  );
}
