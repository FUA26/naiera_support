/**
 * Unauthorized Page
 *
 * Shown when a user tries to access a resource they don't have
 * permissions for.
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon, Locker01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <HugeiconsIcon icon={Locker01Icon} className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-sm">
          <p className="font-medium">Why am I seeing this?</p>
          <p className="mt-2 text-muted-foreground">
            Your account doesn&apos;t have the required permissions to view this page. Contact your
            administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/settings">Request Access</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
