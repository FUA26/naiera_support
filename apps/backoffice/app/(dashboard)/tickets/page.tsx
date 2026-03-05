import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketList } from "./components/ticket-list";

export default async function TicketsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <p className="text-muted-foreground">Manage customer support tickets</p>
      </div>
      <TicketList />
    </div>
  );
}
