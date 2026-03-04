"use client";

/**
 * Permission Matrix Component
 *
 * Checkbox matrix for selecting permissions grouped by category.
 * Now loads permissions dynamically from the database.
 */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Permission } from "@/lib/rbac/types";
import { useEffect, useState } from "react";

interface PermissionCategory {
  name: string;
  permissions: Permission[];
  description: string;
}

interface PermissionMatrixProps {
  selectedPermissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
  initialCategories?: PermissionCategory[];
}

export function PermissionMatrix({
  selectedPermissions,
  onChange,
  disabled = false,
  initialCategories,
}: PermissionMatrixProps) {
  const [categories, setCategories] = useState<PermissionCategory[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);

  // Load permissions from API
  useEffect(() => {
    if (initialCategories) return;

    async function loadPermissions() {
      try {
        const response = await fetch("/api/permissions");
        if (!response.ok) throw new Error("Failed to load permissions");

        const data = await response.json();
        const permissions = data.permissions as Array<{
          name: string;
          category: string;
          description: string | null;
        }>;

        // Group permissions by category
        const categoryMap = new Map<string, Permission[]>();
        const categoryDescriptions = new Map<string, string>();

        for (const perm of permissions) {
          if (!categoryMap.has(perm.category)) {
            categoryMap.set(perm.category, []);
          }
          categoryMap.get(perm.category)!.push(perm.name as Permission);

          // Store description (use first one found for the category)
          if (!categoryDescriptions.has(perm.category) && perm.description) {
            categoryDescriptions.set(perm.category, perm.description);
          }
        }

        // Convert to array format
        const cats: PermissionCategory[] = Array.from(categoryMap.entries())
          .map(([catName, perms]) => ({
            name: catName,
            permissions: perms,
            description: categoryDescriptions.get(catName) || `${catName} permissions`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(cats);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        // Fallback to hardcoded categories if API fails
        setCategories(getDefaultCategories());
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [initialCategories]);

  const togglePermission = (permission: Permission) => {
    if (selectedPermissions.includes(permission)) {
      onChange(selectedPermissions.filter((p) => p !== permission));
    } else {
      onChange([...selectedPermissions, permission]);
    }
  };

  const toggleCategory = (category: PermissionCategory) => {
    const allSelected = category.permissions.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      // Deselect all in category
      onChange(selectedPermissions.filter((p) => !category.permissions.includes(p)));
    } else {
      // Select all in category
      const newPermissions = new Set(selectedPermissions);
      category.permissions.forEach((p) => newPermissions.add(p));
      onChange(Array.from(newPermissions));
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading permissions...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-sm text-muted-foreground">No permissions found</div>;
  }

  return (
    <Tabs defaultValue={categories[0]?.name ?? ""} orientation="vertical" className="flex flex-col md:flex-row gap-6 w-full items-start">
      <TabsList className="flex w-full md:w-56 shrink-0 flex-row md:flex-col justify-start bg-transparent p-0 gap-1 overflow-x-auto border-b md:border-none pb-4 md:pb-0 text-left">
        {categories.map((cat) => (
          <TabsTrigger key={cat.name} value={cat.name} className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-active:bg-muted data-active:text-foreground">
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 w-full min-w-0 md:max-w-xl lg:max-w-4xl">
        {categories.map((category) => (
          <TabsContent key={category.name} value={category.name} className="space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{category.name} Permissions</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleCategory(category)}
                disabled={disabled}
              >
                {category.permissions.every((p) => selectedPermissions.includes(p))
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="space-y-2">
              {category.permissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                    disabled={disabled}
                  />
                  <Label htmlFor={permission} className="flex-1 cursor-pointer font-normal text-sm">
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{permission}</code>
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

/**
 * Default permission categories (fallback)
 */
function getDefaultCategories(): PermissionCategory[] {
  return [
    {
      name: "User",
      permissions: [
        "USER_READ_OWN",
        "USER_READ_ANY",
        "USER_UPDATE_OWN",
        "USER_UPDATE_ANY",
        "USER_DELETE_OWN",
        "USER_DELETE_ANY",
        "USER_CREATE",
      ],
      description: "User account management permissions",
    },
    {
      name: "Content",
      permissions: [
        "CONTENT_READ_OWN",
        "CONTENT_READ_ANY",
        "CONTENT_CREATE",
        "CONTENT_UPDATE_OWN",
        "CONTENT_UPDATE_ANY",
        "CONTENT_DELETE_OWN",
        "CONTENT_DELETE_ANY",
        "CONTENT_PUBLISH",
      ],
      description: "Content creation and management",
    },
    {
      name: "Settings",
      permissions: ["SETTINGS_READ", "SETTINGS_UPDATE"],
      description: "Application settings access",
    },
    {
      name: "Analytics",
      permissions: ["ANALYTICS_VIEW", "ANALYTICS_EXPORT"],
      description: "Analytics and reporting",
    },
    {
      name: "Admin",
      permissions: [
        "ADMIN_PANEL_ACCESS",
        "ADMIN_USERS_MANAGE",
        "ADMIN_ROLES_MANAGE",
        "ADMIN_PERMISSIONS_MANAGE",
      ],
      description: "Administrative functions",
    },
  ];
}

export { getDefaultCategories as PERMISSION_CATEGORIES };
