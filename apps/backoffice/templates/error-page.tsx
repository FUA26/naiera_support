import { Button } from "@/components/ui/button";

export interface ErrorPageProps {
  title: string;
  description: string;
  illustration?: "404" | "500" | "default";
  actions?: Array<{ label: string; onClick: () => void } | { label: string; href: string }>;
  error?: Error;
}

export function ErrorPage({
  title,
  description,
  illustration = "default",
  actions = [],
  error,
}: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        {illustration === "404" && <div className="text-8xl font-bold text-gray-200 mb-4">404</div>}
        {illustration === "500" && <div className="text-8xl font-bold text-red-100 mb-4">500</div>}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="text-left text-sm text-gray-500 mb-6">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {actions.map((action, index) => {
            if ("onClick" in action) {
              return (
                <Button key={index} onClick={action.onClick}>
                  {action.label}
                </Button>
              );
            }
            return (
              <Button key={index} asChild>
                <a href={action.href}>{action.label}</a>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
