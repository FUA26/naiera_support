import { requireAuth, requirePermission } from "@/lib/auth/permissions";
import { TicketDetail } from "./components/ticket-detail";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_VIEW_ALL");
  const { id } = await params;
  return <TicketDetail ticketId={id} />;
}
