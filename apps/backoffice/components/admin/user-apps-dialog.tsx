"use client";

import { useState, useEffect } from "react";
import { useCan } from "@/lib/rbac-client/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";

interface App {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface UserAppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export function UserAppsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: UserAppsDialogProps) {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const canAssignApps = useCan(["TICKET_APP_ASSIGN"]);

  // Fetch apps and user's current assignments
  useEffect(() => {
    if (open && userId) {
      fetchData();
    }
  }, [open, userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all apps
      const appsRes = await fetch("/api/apps?pageSize=100");
      if (!appsRes.ok) throw new Error("Failed to fetch apps");
      const appsData = await appsRes.json();

      // Fetch user's assigned apps
      const userAppsRes = await fetch(`/api/apps/accessible?userId=${userId}`);
      if (userAppsRes.ok) {
        const userAppsData = await userAppsRes.json();
        const assignedIds = (userAppsData.apps || []).map((app: App) => app.id);
        setSelectedAppIds(assignedIds);
      }

      setApps(appsData.items || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApp = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSave = async () => {
    if (!canAssignApps) {
      toast.error("You don't have permission to assign apps");
      return;
    }

    setSaving(true);
    try {
      // Get current assignments
      const userAppsRes = await fetch(`/api/apps/accessible?userId=${userId}`);
      const userAppsData = await userAppsRes.ok ? await userAppsRes.json() : { apps: [] };
      const currentAppIds = (userAppsData.apps || []).map((app: App) => app.id);

      // Calculate additions and removals
      const toAdd = selectedAppIds.filter((id) => !currentAppIds.includes(id));
      const toRemove = currentAppIds.filter((id) => !selectedAppIds.includes(id));

      // Add new assignments
      for (const appId of toAdd) {
        const res = await fetch(`/api/apps/${appId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to assign app");
        }
      }

      // Remove assignments
      for (const appId of toRemove) {
        const res = await fetch(`/api/apps/${appId}/assign?userId=${userId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to remove assignment");
        }
      }

      toast.success("App assignments updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving assignments:", error);
      toast.error(error.message || "Failed to save assignments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Apps to User</DialogTitle>
          <DialogDescription>
            Select which apps {userName} can access. Users with admin roles have access to all apps.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading apps...</div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No apps available. Create an app first.
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedAppIds.includes(app.id)
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    id={`app-${app.id}`}
                    checked={selectedAppIds.includes(app.id)}
                    onCheckedChange={() => handleToggleApp(app.id)}
                    disabled={!canAssignApps || !app.isActive}
                  />
                  <label
                    htmlFor={`app-${app.id}`}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                        <rect width="8" height="4" x="8" y="8" rx="1" />
                        <rect width="8" height="4" x="8" y="14" rx="1" />
                        <path d="M4 6h1" />
                        <path d="M4 12h1" />
                        <path d="M4 18h1" />
                        <path d="M19 6h1" />
                        <path d="M19 12h1" />
                        <path d="M19 18h1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.name}</span>
                        <span className="text-xs text-muted-foreground">({app.slug})</span>
                        {!app.isActive && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !canAssignApps}>
            {saving ? "Saving..." : "Save Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
