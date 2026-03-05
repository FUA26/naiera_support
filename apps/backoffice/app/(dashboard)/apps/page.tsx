import { requireAuth } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/permissions";
import { AppsClient } from "./apps-client";

export default async function AppsPage() {
  const session = await requireAuth();
  await requirePermission(session.user.id, "TICKET_APP_VIEW");

  return <AppsClient />;
}
