import { requireAuth } from "@/lib/auth/permissions";
import { NoAppAccess } from "@/components/dashboard/no-app-access";

export default async function NoAccessPage() {
  await requireAuth();
  return <NoAppAccess />;
}
