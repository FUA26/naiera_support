import { ErrorPage } from "@/templates/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      title="Page not found"
      description="The page you're looking for doesn't exist."
      illustration="404"
      actions={[{ label: "Go home", href: "/" }]}
    />
  );
}
