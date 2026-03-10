"use client";

import { useQuery } from "@tanstack/react-query";
import { TicketMessages } from "./ticket-messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttachmentPreview } from "@/components/ticketing/attachment-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  ticketId: string;
  currentUserId: string;
}

export function TicketDetail({ ticketId, currentUserId }: Props) {
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const updateTicket = async (updates: { status?: string; assignedTo?: string | null }) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  const claimTicket = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: currentUserId }),
      });
      if (!res.ok) throw new Error("Failed to claim");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  const unassignTicket = async () => {
    setUnassignDialogOpen(false);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: null }),
      });
      if (!res.ok) throw new Error("Failed to unassign");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  const closeTicket = async () => {
    setCloseDialogOpen(false);
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/close`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to close");
      refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (!data?.ticket) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground">The ticket you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const ticket = data.ticket;
  const assignedTo = ticket.assignedToUser || ticket.assignedTo; // Handle both API responses
  const isAssignedToCurrentUser = assignedTo?.id === currentUserId;
  const isUnassigned = !assignedTo;

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4 gap-1"
      >
        <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <Badge variant="outline">{ticket.ticketNumber}</Badge>
            <Badge variant="outline">{ticket.app.name}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {ticket.channel.type} • Created{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
          {/* Show ticket attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-3">
              <AttachmentPreview
                attachments={ticket.attachments.map((a: any) => ({
                  url: a.file.serveUrl || a.file.cdnUrl || a.file.storagePath,
                  name: a.file.originalFilename,
                  type: a.file.mimeType,
                  size: a.file.size,
                }))}
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isAssignedToCurrentUser && (
            <Button
              onClick={claimTicket}
              disabled={isUpdating}
              variant="default"
            >
              {isUnassigned ? "Claim Ticket" : "Take Over"}
            </Button>
          )}
          <Select
            value={ticket.status}
            onValueChange={(value: string) => updateTicket({ status: value })}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          {isAssignedToCurrentUser && (
            <Button
              variant="outline"
              onClick={() => setUnassignDialogOpen(true)}
              disabled={isUpdating}
            >
              Unassign
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setCloseDialogOpen(true)}
            disabled={isUpdating || ticket.status === "CLOSED"}
          >
            Close
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketMessages ticketId={ticketId} onUpdate={refetch} />
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Customer</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Name: </span>
                {ticket.user?.name || ticket.guestName || "Unknown"}
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                {ticket.user?.email || ticket.guestEmail || "-"}
              </p>
              {ticket.guestPhone && (
                <p>
                  <span className="text-muted-foreground">Phone: </span>
                  {ticket.guestPhone}
                </p>
              )}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <Badge>{ticket.status.replace("_", " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Priority</span>
                <Badge>{ticket.priority}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Assigned To</span>
                {assignedTo ? (
                  <div className="flex items-center gap-2">
                    {assignedTo.name && (
                      <span>{assignedTo.name}</span>
                    )}
                    {isAssignedToCurrentUser && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign this ticket? It will be available for others to claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={unassignTicket} disabled={isUpdating}>
              Unassign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Ticket Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this ticket? You can reopen it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={closeTicket} disabled={isUpdating}>
              Close Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
