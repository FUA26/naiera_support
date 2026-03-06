import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import { AccessRequestsClient } from "./access-requests-client";

export default async function AccessRequestsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_APP_APPROVE");

  return <AccessRequestsClient />;
}
