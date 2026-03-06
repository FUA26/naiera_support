"use client";

import { useQuery } from "@tanstack/react-query";
import { TicketMessages } from "./ticket-messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTicket = async (updates: { status?: string }) => {
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

  const closeTicket = async () => {
    if (!confirm("Are you sure you want to close this ticket?")) return;
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
  return (
    <div className="p-6">
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
        </div>
        <div className="flex gap-2">
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
          <Button
            variant="outline"
            onClick={closeTicket}
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
            <p className="text-sm">
              {ticket.user?.name || ticket.guestName || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
              {ticket.user?.email || ticket.guestEmail || "-"}
            </p>
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
              <div className="flex justify-between">
                <span>Assigned To</span>
                <span>{ticket.assignedTo?.name || "Unassigned"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
