/**
 * Integrated App Ticket View (Public)
 *
 * Public page for external app users to view their tickets.
 * Uses JWT token authentication with externalUserId or email.
 *
 * Security:
 * - JWT token signed with channel API key
 * - Token expires after 30 minutes
 * - Rate limited token generation
 * - Token is tied to specific channel and app
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/services/ticketing/integration-service";
import { TicketListClient } from "./ticket-list-client";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function IntegratedViewTicketsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // Redirect if no token
  if (!token) {
    redirect("/support/error?error=MISSING_TOKEN");
  }

  try {
    // Verify token - accept list_tickets, view_ticket, or create_ticket purposes
    const payload = await verifyAccessToken(token);

    // Check if purpose is valid
    const validPurposes = ["list_tickets", "view_ticket", "create_ticket"];
    if (!validPurposes.includes(payload.purpose)) {
      redirect("/support/error?error=INVALID_TOKEN");
    }

    // Get channel info
    const channel = await prisma.channel.findUnique({
      where: { id: payload.channelId },
      include: { app: true },
    });

    if (!channel) {
      redirect("/support/error?error=CHANNEL_NOT_FOUND");
    }

    // Fetch tickets based on identifier type
    const whereClause: {
      appId: string;
      channelId: string;
      externalUserId?: string;
      guestEmail?: string;
    } = {
      appId: payload.appId,
      channelId: payload.channelId,
    };

    // Use externalUserId or email based on what's in the token
    if (payload.externalUserId) {
      whereClause.externalUserId = payload.externalUserId;
    } else if (payload.email) {
      whereClause.guestEmail = payload.email;
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { isInternal: false },
            },
          },
        },
      },
    });

    // Serialize dates to strings for client component
    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString() || null,
      closedAt: ticket.closedAt?.toISOString() || null,
      messages: ticket.messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      })),
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {channel.app.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  My Support Tickets
                </p>
              </div>
            </div>
          </div>

          {/* Ticket List */}
          <Suspense fallback={<LoadingState />}>
            <TicketListClient
              tickets={serializedTickets}
              token={token}
              channelName={channel.name}
              appName={channel.app.name}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in view-tickets page:", error);

    // Redirect based on error type
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);

      if (error.message === "TOKEN_EXPIRED") {
        redirect("/support/error?error=TOKEN_EXPIRED");
      }
      if (error.message === "INVALID_TOKEN" || error.message === "INVALID_TOKEN_PURPOSE") {
        redirect("/support/error?error=INVALID_TOKEN");
      }
      if (error.message === "CHANNEL_NOT_FOUND" || error.message === "CHANNEL_INACTIVE") {
        redirect("/support/error?error=CHANNEL_NOT_FOUND");
      }
    }

    redirect("/support/error?error=UNKNOWN");
  }
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
