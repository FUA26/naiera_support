import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketList } from "./components/ticket-list";

export default async function TicketsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");
  return (
    <div className="space-y-6">
      <TicketList currentUserId={session.user.id} />
    </div>
  );
}
