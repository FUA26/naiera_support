"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { AttachmentUpload, type AttachmentFile } from "@/components/ticketing/attachment-upload";
import { AttachmentPreview } from "@/components/ticketing/attachment-preview";
import { formatDistanceToNow } from "date-fns";
import { Paperclip } from "lucide-react";

export function TicketMessages({
  ticketId,
  onUpdate,
}: {
  ticketId: string;
  onUpdate: () => void;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<AttachmentFile[]>([]);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["ticket-messages", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      // Prepare attachment metadata
      const attachmentMetadata = messageAttachments
        .filter((a) => a.uploadedUrl)
        .map((a) => ({
          url: a.uploadedUrl!,
          name: a.file.name,
          type: a.file.type,
          size: a.file.size,
        }));

      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          isInternal,
          attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      return await res.json();
    },
    onSuccess: () => {
      setMessage("");
      setMessageAttachments([]);
      setShowAttachmentUpload(false); // Also hide upload zone
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      onUpdate();
    },
  });

  const ticket = data?.ticket;
  const messages = ticket?.messages || [];

  // Sort messages by createdAt ascending for proper timeline (oldest first)
  const sortedMessages = useMemo(() => {
    const sorted = [...messages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB;
    });
    // Debug: log attachments
    console.log('All messages:', sorted.map(m => ({ id: m.id, hasAttachments: !!m.attachments, attachments: m.attachments })));
    return sorted;
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversation</h2>
      </div>
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto" ref={messagesContainerRef}>
        {sortedMessages.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "AGENT" ? "justify-end" : ""}`}
          >
            {msg.sender === "CUSTOMER" && (
              <Avatar className="w-8 h-8">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-md rounded-lg p-3 ${
                msg.sender === "AGENT"
                  ? "bg-primary text-primary-foreground"
                  : msg.isInternal
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-muted"
              }`}
            >
              {msg.isInternal && (
                <p className="text-xs font-semibold mb-1">Internal Note</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              {/* Show attachments if present */}
              {(msg.attachments as any)?.length > 0 && (
                <div className="mt-2">
                  <AttachmentPreview
                    attachments={msg.attachments}
                    className="flex-wrap"
                  />
                </div>
              )}
              {/* Debug: log attachments */}
              {false && console.log('Message attachments:', msg.id, msg.attachments)}
              <p className="text-xs opacity-70 mt-1">
                {formatDistanceToNow(new Date(msg.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {msg.sender === "AGENT" && (
              <Avatar className="w-8 h-8">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t space-y-3">
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="internal"
              checked={isInternal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsInternal(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="internal" className="text-sm cursor-pointer">
              Internal note
            </label>
          </div>

          {/* Attachment button / upload area */}
          {showAttachmentUpload ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAttachmentUpload(false);
                setMessageAttachments([]); // Clear uploaded files
              }}
            >
              Cancel
            </Button>
          ) : messageAttachments.length >= 3 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled
            >
              <Paperclip className="h-4 w-4 mr-1" />
              Attach (3/3)
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachmentUpload(true)}
            >
              <Paperclip className="h-4 w-4 mr-1" />
              {messageAttachments.length > 0 ? `Attach (${messageAttachments.length}/3)` : "Attach"}
            </Button>
          )}
        </div>

        {/* Attachment upload - only show when button clicked */}
        {showAttachmentUpload && (
          <AttachmentUpload
            maxFiles={3}
            value={messageAttachments}
            onFilesChange={setMessageAttachments}
            onClose={() => setShowAttachmentUpload(false)}
            uploadEndpoint="message-attachment"
          />
        )}

        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          rows={3}
        />
        <Button
          onClick={() => sendMessage.mutate()}
          disabled={!message.trim() || sendMessage.isPending}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
