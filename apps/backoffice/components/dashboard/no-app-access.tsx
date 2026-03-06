"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export function NoAppAccess() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: apps } = useQuery({
    queryKey: ["all-apps-for-request"],
    queryFn: async () => {
      const res = await fetch("/api/apps?all=true");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleSubmit = async () => {
    if (!selectedAppId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/app-access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: selectedAppId,
          reason: "Requesting access to manage tickets",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Access request submitted");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No App Access</h2>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have access to any apps yet. Request access to get started.
        </p>
        <Button onClick={() => setDialogOpen(true)}>
          Request Access
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request App Access</DialogTitle>
            <DialogDescription>
              Select the app you need access to and submit a request to the administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedAppId} onValueChange={setSelectedAppId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an app" />
              </SelectTrigger>
              <SelectContent>
                {apps?.items?.map((app: { id: string; name: string }) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedAppId || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
