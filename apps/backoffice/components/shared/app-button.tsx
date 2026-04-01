/**
 * App-Branded Button Component (Pisky Style)
 *
 * Modern buttons with soft borders and neutral shadows using Pisky design system.
 *
 * PATTERN FOR OTHER APPS:
 * Copy this file to your app's components/shared/
 */

import * as React from "react";
import { Button, type ButtonProps } from "@workspace/ui";
import { cn } from "@/lib/utils";

export interface AppButtonProps extends ButtonProps {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline" | "app-ghost" | "app-outline";
  children?: React.ReactNode;
}

/**
 * App-branded button (Pisky style)
 *
 * - default/primary: Pisky blue with neutral shadow
 * - secondary: White with soft border
 * - ghost: Transparent with subtle hover
 * - outline: Border only, transparent background
 */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = "default", size, ...props }, ref) => {
    const getVariantProps = () => {
      switch (variant) {
        case "primary":
        case "default":
          return {
            variant: "default" as const,
            className: cn(
              "btn-pisky-primary rounded-lg px-4 py-2",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          };
        case "secondary":
          return {
            variant: "default" as const,
            className: cn(
              "btn-pisky-secondary rounded-lg px-4 py-2",
              size === "sm" && "px-3 py-1.5 text-sm",
              size === "lg" && "px-6 py-3 text-base",
              className
            ),
          };
        case "ghost":
        case "app-ghost":
          return {
            variant: "ghost" as const,
            className: cn(
              "rounded-lg hover:bg-accent/50",
              className
            ),
          };
        case "outline":
        case "app-outline":
          return {
            variant: "outline" as const,
            className: cn(
              "rounded-lg border-border hover:bg-accent hover:border-border-medium",
              className
            ),
          };
        default:
          return {
            variant: variant as ButtonProps["variant"],
            className,
          };
      }
    };

    const { variant: mappedVariant, className: mappedClassName } = getVariantProps();

    return <Button ref={ref} variant={mappedVariant} className={mappedClassName} {...props} />;
  }
);

AppButton.displayName = "AppButton";

/**
 * Action button for cards/tables
 */
export function AppActionButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      size="sm"
      className={cn(
        "btn-pisky-primary rounded-lg text-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Icon button - soft hover
 */
export function AppIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "rounded-lg transition-all hover:bg-accent/50 hover:scale-105",
        className
      )}
      {...props}
    />
  );
}

/**
 * Group of buttons
 */
export function AppButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
