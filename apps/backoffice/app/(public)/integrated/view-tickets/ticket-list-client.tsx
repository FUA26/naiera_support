/**
 * Ticket List Client Component
 *
 * Client component for displaying tickets in the integrated view
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  resolvedAt: string | null; // ISO date string or null
  closedAt: string | null; // ISO date string or null
  messages: Array<{ id: string; message: string; sender: string; createdAt: string }>;
  _count: { messages: number };
}

interface TicketListClientProps {
  tickets: Ticket[];
  token: string;
  channelName: string;
  appName: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  OPEN: { label: "Open", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950", icon: Clock },
  RESOLVED: { label: "Resolved", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950", icon: CheckCircle2 },
  CLOSED: { label: "Closed", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LOW: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" },
  NORMAL: { label: "Normal", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900" },
  HIGH: { label: "High", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900" },
  URGENT: { label: "Urgent", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900" },
};

export function TicketListClient({ tickets, token, channelName, appName }: TicketListClientProps) {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} color="bg-slate-100 dark:bg-slate-800" />
        <StatCard label="Open" value={stats.open} color="bg-blue-50 dark:bg-blue-950" />
        <StatCard label="In Progress" value={stats.inProgress} color="bg-yellow-50 dark:bg-yellow-950" />
        <StatCard label="Resolved" value={stats.resolved} color="bg-green-50 dark:bg-green-950" />
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <EmptyState token={token} appName={appName} />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.OPEN;
            const priority = priorityConfig[ticket.priority] || priorityConfig.NORMAL;
            const StatusIcon = status.icon;

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-800"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn("flex w-12 h-12 items-center justify-center rounded-xl shrink-0 cursor-pointer", status.bgColor)}
                  >
                    <StatusIcon className={cn("w-6 h-6", status.color)} />
                  </div>

                  {/* Content */}
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                        #{ticket.ticketNumber}
                      </span>
                      <Badge className={cn("shrink-0", status.bgColor, status.color, "border-0")}>
                        {status.label}
                      </Badge>
                      <Badge className={cn("shrink-0", priority.bgColor, priority.color, "border-0")}>
                        {priority.label}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                      {ticket.subject}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {ticket.description || ticket.messages[0]?.message || "No description"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket._count.messages} messages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(ticket.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open in new tab button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/support/tickets/${ticket.id}?token=${token}`, '_blank');
                    }}
                    className="shrink-0 gap-1.5 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-slate-500">
                    #{selectedTicket.ticketNumber}
                  </span>
                  <Badge className={cn(
                    statusConfig[selectedTicket.status].bgColor,
                    statusConfig[selectedTicket.status].color,
                    "border-0"
                  )}>
                    {statusConfig[selectedTicket.status].label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                <DialogDescription>
                  Created {formatTimeAgo(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Messages would go here - for now show description */}
              <div className="space-y-4">
                {selectedTicket.description && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedTicket.description}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/support/tickets/${selectedTicket.id}?token=${token}`, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Conversation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("rounded-xl p-4", color)}>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  );
}

function EmptyState({ token, appName }: { token: string; appName: string }) {
  const router = useRouter();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        No tickets yet
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        You haven't created any support tickets yet.
      </p>
      <Button
        onClick={() => router.push(`/support/tickets/new?token=${token}`)}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Your First Ticket
      </Button>
    </div>
  );
}
