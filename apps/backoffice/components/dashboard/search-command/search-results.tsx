import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityIcon, Settings01Icon, UserCircleIcon, Users } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export interface SearchResults {
  users: Array<{ id: string; name: string | null; email: string; avatarId: string | null }>;
  roles: Array<{ id: string; name: string; _count: { permissions: number } }>;
  permissions: Array<{ id: string; name: string; category: string | null }>;
}

interface SearchResultsDisplayProps {
  results: SearchResults;
  isLoading: boolean;
}

export function SearchResultsDisplay({ results, isLoading }: SearchResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const hasResults =
    results.users.length > 0 || results.roles.length > 0 || results.permissions.length > 0;

  if (!hasResults) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {/* Users */}
      {results.users.length > 0 && (
        <div className="p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={Users} className="mr-2 h-4 w-4" />
            Users
          </h3>
          <div className="space-y-1">
            {results.users.map((user) => (
              <Link
                key={user.id}
                href={`/manage/users/${user.id}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <p className="font-medium">{user.name ?? "Unnamed User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Roles */}
      {results.roles.length > 0 && (
        <div className="border-t p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={SecurityIcon} className="mr-2 h-4 w-4" />
            Roles
          </h3>
          <div className="space-y-1">
            {results.roles.map((role) => (
              <Link
                key={role.id}
                href={`/manage/roles`}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <HugeiconsIcon icon={SecurityIcon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{role.name}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {role._count.permissions}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {results.permissions.length > 0 && (
        <div className="border-t p-4">
          <h3 className="mb-2 flex items-center text-xs font-semibold text-muted-foreground">
            <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4" />
            Permissions
          </h3>
          <div className="space-y-1">
            {results.permissions.map((permission) => (
              <div
                key={permission.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{permission.name}</p>
                  {permission.category && (
                    <p className="text-xs text-muted-foreground">{permission.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
