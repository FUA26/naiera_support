"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, MessageSquare, User, Clock, Paperclip, Send, RefreshCw, XCircle } from "lucide-react";
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

type ErrorType = "TOKEN_EXPIRED" | "INVALID_TOKEN" | "ACCESS_DENIED" | "OTHER";

interface Props {
  ticketId: string;
  token: string;
}

export function TicketDetailPublic({ ticketId, token }: Props) {
  const [data, setData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine error type for appropriate UI
  const getErrorType = (errorMessage: string, errorCode?: string): ErrorType => {
    if (errorCode === "TOKEN_EXPIRED" || errorMessage.includes("kadaluarsa")) {
      return "TOKEN_EXPIRED";
    }
    if (errorCode === "INVALID_TOKEN" || errorMessage.includes("tidak valid")) {
      return "INVALID_TOKEN";
    }
    if (errorCode === "ACCESS_DENIED" || errorMessage.includes("akses")) {
      return "ACCESS_DENIED";
    }
    return "OTHER";
  };

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      setErrorType(null);

      try {
        const res = await fetch(`/api/integrated/tickets/${ticketId}?token=${encodeURIComponent(token)}`);

        const responseData: ApiResponse = await res.json();

        if (!res.ok) {
          const errorMsg = responseData.message || responseData.error || "Gagal memuat tiket";
          const errorCode = responseData.error;
          setError(errorMsg);
          setErrorType(getErrorType(errorMsg, errorCode));
          return;
        }

        if (!responseData.ticket) {
          setError("Tiket tidak ditemukan");
          setErrorType("OTHER");
          return;
        }

        setData(responseData.ticket);
        setError(null);
        setErrorType(null);
      } catch (err: any) {
        const errorMsg = err.message || "Terjadi kesalahan saat memuat tiket";
        setError(errorMsg);
        setErrorType(getErrorType(errorMsg));
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  // Refresh ticket data
  const refreshTicket = async () => {
    try {
      const res = await fetch(`/api/integrated/tickets/${ticketId}?token=${encodeURIComponent(token)}`);
      const responseData: ApiResponse = await res.json();

      if (res.ok && responseData.ticket) {
        setData(responseData.ticket);
      }
    } catch (err) {
      console.error("Failed to refresh ticket:", err);
    }
  };

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/integrated/tickets/${ticketId}/messages?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Gagal mengirim pesan");
      }

      // Clear input
      setNewMessage("");

      // Refresh ticket data to show new message
      await refreshTicket();
    } catch (err: any) {
      setSendError(err.message || "Terjadi kesalahan saat mengirim pesan");
    } finally {
      setSendingMessage(false);
    }
  };

  // Check if ticket is closed (cannot send message to closed tickets)
  const isClosed = data?.status === "CLOSED";

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
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {/* Icon based on error type */}
              <div className="flex justify-center">
                {errorType === "TOKEN_EXPIRED" ? (
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                )}
              </div>

              {/* Error title */}
              <div>
                {errorType === "TOKEN_EXPIRED" && (
                  <h1 className="text-xl font-bold">Token Kadaluarsa</h1>
                )}
                {errorType === "INVALID_TOKEN" && (
                  <h1 className="text-xl font-bold">Token Tidak Valid</h1>
                )}
                {errorType === "ACCESS_DENIED" && (
                  <h1 className="text-xl font-bold">Akses Ditolak</h1>
                )}
                {!errorType && (
                  <h1 className="text-xl font-bold">Terjadi Kesalahan</h1>
                )}
              </div>

              {/* Error message with explanation */}
              <div className="text-sm text-muted-foreground space-y-2">
                {errorType === "TOKEN_EXPIRED" && (
                  <p>
                    Token akses Anda telah kedaluwarsa. Token hanya berlaku selama 30 menit untuk keamanan.
                  </p>
                )}
                {errorType === "INVALID_TOKEN" && (
                  <p>
                    Token akses tidak valid. Silakan akses tiket melalui aplikasi terintegrasi.
                  </p>
                )}
                {errorType === "ACCESS_DENIED" && (
                  <p>
                    Anda tidak memiliki akses ke tiket ini. Pastikan Anda menggunakan akun yang benar.
                  </p>
                )}
                {!errorType && <p>{error}</p>}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                {/* Primary action based on error type */}
                {errorType === "TOKEN_EXPIRED" || errorType === "INVALID_TOKEN" ? (
                  <Button
                    onClick={() => window.close()}
                    className="w-full"
                  >
                    Kembali ke Aplikasi
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Coba Lagi
                  </Button>
                )}

                {/* Help text */}
                <p className="text-xs text-muted-foreground pt-2">
                  Jika masalah berlanjut, hubungi tim support Anda atau buat tiket baru.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input Form */}
        {!isClosed && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kirim Pesan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                {sendError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{sendError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Textarea
                    placeholder="Ketik pesan Anda di sini..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    maxLength={5000}
                    disabled={sendingMessage}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{newMessage.length}/5000 karakter</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="w-full gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Pesan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Closed ticket notice */}
        {isClosed && (
          <Card className="bg-muted/50">
            <CardContent className="py-6">
              <div className="text-center text-muted-foreground">
                <p className="font-medium">Tiket ini telah ditutup</p>
                <p className="text-sm mt-1">Silakan buat tiket baru untuk bantuan lebih lanjut.</p>
              </div>
            </CardContent>
          </Card>
        )}

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
