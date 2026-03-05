import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketDetail } from "./components/ticket-detail";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");
  return <TicketDetail ticketId={params.id} />;
}
