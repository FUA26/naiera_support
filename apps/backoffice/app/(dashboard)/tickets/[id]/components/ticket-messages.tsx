"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isInternal }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
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
    // Debug: log sorted order
    console.log("Messages order:", sorted.map((m, i) => `${i + 1}. [${m.sender}] ${m.createdAt}`));
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
        {sortedMessages.map((msg: { id: string; sender: string; isInternal?: boolean; message: string; createdAt: string }) => (
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
