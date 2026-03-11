"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, MessageSquare, User, Clock, Paperclip } from "lucide-react";
import { AttachmentPreview } from "@/components/ticketing/attachment-preview";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface TicketMessage {
  id: string;
  message: string;
  sender: "CUSTOMER" | "AGENT" | "SYSTEM";
  isInternal: boolean;
  createdAt: string;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  updatedAt: string;
  guestName?: string;
  guestEmail?: string;
  messages: TicketMessage[];
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
}

interface ApiResponse {
  success: boolean;
  ticket?: Ticket;
  error?: string;
  message?: string;
}

interface Props {
  ticketId: string;
  token: string;
}

export function TicketDetailPublic({ ticketId, token }: Props) {
  const [data, setData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/integrated/tickets/${ticketId}?token=${encodeURIComponent(token)}`);

        const responseData: ApiResponse = await res.json();

        if (!res.ok) {
          throw new Error(responseData.message || responseData.error || "Gagal memuat tiket");
        }

        if (!responseData.ticket) {
          throw new Error("Tiket tidak ditemukan");
        }

        setData(responseData.ticket);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat tiket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, token]);

  // Status badge variant
  const getStatusVariant = (status: Ticket["status"]) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "RESOLVED":
        return "outline";
      case "CLOSED":
        return "destructive" as const;
      default:
        return "outline";
    }
  };

  // Status label in Indonesian
  const getStatusLabel = (status: Ticket["status"]) => {
    switch (status) {
      case "OPEN":
        return "Terbuka";
      case "IN_PROGRESS":
        return "Dalam Proses";
      case "RESOLVED":
        return "Terselesaikan";
      case "CLOSED":
        return "Ditutup";
      default:
        return status;
    }
  };

  // Priority badge variant
  const getPriorityVariant = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "LOW":
        return "outline";
      case "NORMAL":
        return "secondary";
      case "HIGH":
        return "default";
      case "URGENT":
        return "destructive" as const;
      default:
        return "outline";
    }
  };

  // Priority label in Indonesian
  const getPriorityLabel = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "LOW":
        return "Rendah";
      case "NORMAL":
        return "Normal";
      case "HIGH":
        return "Tinggi";
      case "URGENT":
        return "Sangat Penting";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Tiket tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  const ticket = data;
  const sortedMessages = [...ticket.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Tiket #{ticket.ticketNumber}</span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{ticket.subject}</h1>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
            <Badge variant={getPriorityVariant(ticket.priority)}>
              Prioritas: {getPriorityLabel(ticket.priority)}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Dibuat{" "}
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            </div>
            {ticket.guestName && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{ticket.guestName}</span>
              </div>
            )}
          </div>

          {/* Ticket Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Paperclip className="h-4 w-4" />
                <span>Lampiran Tiket</span>
              </div>
              <AttachmentPreview attachments={ticket.attachments} />
            </div>
          )}
        </div>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Percakapan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada pesan
                </p>
              ) : (
                sortedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === "AGENT" ? "justify-end" : ""
                    }`}
                  >
                    {message.sender === "CUSTOMER" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "AGENT"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {/* Sender label */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-80">
                          {message.sender === "CUSTOMER"
                            ? "Anda"
                            : message.sender === "AGENT"
                              ? "Agen"
                              : "Sistem"}
                        </span>
                        <span className="text-xs opacity-60">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>

                      {/* Message content */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>

                      {/* Message attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2">
                          <AttachmentPreview attachments={message.attachments} />
                        </div>
                      )}
                    </div>
                    {message.sender === "AGENT" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-primary-foreground font-medium">
                          A
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Terakhir diperbarui{" "}
            {formatDistanceToNow(new Date(ticket.updatedAt), {
              addSuffix: true,
              locale: id,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
