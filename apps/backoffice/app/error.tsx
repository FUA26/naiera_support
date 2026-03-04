"use client";

import { ErrorPage } from "@/templates/error-page";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <ErrorPage
      title="Something went wrong"
      description="We encountered an unexpected error. Please try again."
      error={error}
      actions={[
        { label: "Try again", onClick: reset },
        { label: "Go home", href: "/" },
      ]}
    />
  );
}
