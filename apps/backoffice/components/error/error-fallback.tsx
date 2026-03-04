import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-4">Something went wrong</p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left text-sm text-gray-500 mb-4">
            <summary>Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">{error.stack}</pre>
          </details>
        )}
        <Button onClick={resetError}>Try again</Button>
      </div>
    </div>
  );
}
