"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

type AccessRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  appId: string;
  appName: string;
  reason: string | null;
  status: string;
  requestedAt: Date;
};

type AccessRequestsResponse = {
  requests: AccessRequest[];
};

export function AccessRequestsClient() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const { data, isLoading } = useQuery<AccessRequestsResponse>({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const res = await fetch("/api/app-access-requests");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { mutate: handleAction, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/app-access-requests/${selectedRequest?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(`Request ${action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      setDialogOpen(false);
    },
  });

  const pendingRequests = data?.requests?.filter((r) => r.status === "PENDING") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground">
          Manage app access requests from users
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>App</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pendingRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-sm text-muted-foreground">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{request.appName}</TableCell>
                  <TableCell>{request.reason || "-"}</TableCell>
                  <TableCell>
                    <Badge>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction("approve");
                        setDialogOpen(true);
                      }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRequest(request);
                        setAction("reject");
                        setDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Request
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "This will give the user access to the app."
                : "This will deny the user's request."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={() => handleAction()}
              disabled={isPending}
            >
              {isPending ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
