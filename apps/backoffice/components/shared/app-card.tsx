/**
 * App-Branded Card Component (Attio Style)
 *
 * Clean cards without visible borders - using subtle shadows instead.
 *
 * PATTERN FOR OTHER APPS:
 * Copy this file to your app's components/shared/
 */

import * as React from "react";
import { cn } from "@workspace/utils";

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "floating" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * App-branded card (Attio style)
 *
 * - default: Subtle shadow, no visible border
 * - interactive: Hover effect with lift
 * - floating: More prominent shadow, elevated look
 * - glass: Glass morphism effect
 */
export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-background",
          paddingStyles[padding],
          {
            "card-attio": variant === "default",
            "card-attio-interactive": variant === "interactive",
            "shadow-lg": variant === "floating",
            "glass-card": variant === "glass",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppCard.displayName = "AppCard";

/**
 * Card header with clean styling
 */
export function AppCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

/**
 * Card title
 */
export function AppCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

/**
 * Card description
 */
export function AppCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Card content
 */
export function AppCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

/**
 * Card footer
 */
export function AppCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  );
}

/**
 * Stat card - for dashboard metrics
 */
export function AppStatCard({
  value,
  label,
  icon: Icon,
  trend,
  className,
}: {
  value: string | number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive?: boolean };
  className?: string;
}) {
  return (
    <AppCard variant="interactive" padding="lg" className={className}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>
    </AppCard>
  );
}

/**
 * Divider - subtle line for visual separation
 */
export function AppDivider({ className }: { className?: string }) {
  return <div className={cn("divider-attio my-4", className)} />;
}
