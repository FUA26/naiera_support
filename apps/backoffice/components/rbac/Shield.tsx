"use client";

/**
 * Shield Component
 *
 * Visual feedback component for explaining why an action is disabled.
 * Shows a tooltip or inline message when user lacks permissions.
 *
 * @example
 * ```tsx
 * import { Shield } from "@/components/rbac/Shield";
 *
 * function DeleteButton({ userId }) {
 *   return (
 *     <Shield
 *       permissions={["USER_DELETE_ANY"]}
 *       message="Only administrators can delete users"
 *       type="tooltip"
 *     >
 *       <button>Delete User</button>
 *     </Shield>
 *   );
 * }
 * ```
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissionContext } from "@/lib/rbac-client/provider";
import type { Permission } from "@/lib/rbac/types";
import React from "react";

interface ShieldProps {
  children: React.ReactNode;
  /** Required permissions for the action */
  permissions: Permission[];
  /** Message to show when user lacks permissions */
  message?: string;
  /** Display type */
  type?: "tooltip" | "inline" | "disabled";
  /** If true, ALL permissions must be present */
  strict?: boolean;
  /** Custom content to show when unauthorized */
  unauthorized?: React.ReactNode;
}

/**
 * Wrapper component that provides visual feedback for permission-based UI
 */
export function Shield({
  children,
  permissions,
  message = "You don't have permission to perform this action",
  type = "tooltip",
  strict = false,
  unauthorized,
}: ShieldProps) {
  const { permissions: userPermissions, isLoading } = usePermissionContext();

  // Check if user has access
  const hasAccess = React.useMemo(() => {
    if (!userPermissions) return false;

    if (strict) {
      return permissions.every((p) => userPermissions.permissions.includes(p));
    } else {
      return permissions.some((p) => userPermissions.permissions.includes(p));
    }
  }, [userPermissions, permissions, strict]);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // User has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // User lacks permissions, show feedback based on type
  const childElement = React.Children.only(children) as React.ReactElement;

  switch (type) {
    case "tooltip": {
      // Wrap in tooltip explaining why action is disabled
      const disabledChild = React.cloneElement(childElement, {
        ...((childElement.props || {}) as any),
        disabled: true,
      } as React.HTMLAttributes<HTMLElement>);

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{disabledChild}</TooltipTrigger>
            <TooltipContent>
              <p>{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    case "inline": {
      // Show message below the disabled element
      const disabledChild = React.cloneElement(childElement, {
        ...((childElement.props || {}) as any),
        disabled: true,
        className: `${(childElement.props as React.HTMLAttributes<HTMLElement>)?.className || ""} opacity-50 cursor-not-allowed`,
      } as React.HTMLAttributes<HTMLElement>);

      return (
        <div className="space-y-1">
          {disabledChild}
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      );
    }

    case "disabled": {
      // Just disable the element without additional feedback
      return React.cloneElement(childElement, {
        ...((childElement.props || {}) as any),
        disabled: true,
        className: `${(childElement.props as React.HTMLAttributes<HTMLElement>)?.className || ""} opacity-50 cursor-not-allowed`,
      } as React.HTMLAttributes<HTMLElement>);
    }

    default:
      return <>{children}</>;
  }
}

/**
 * ShieldButton - specialized button with permission feedback
 *
 * @example
 * ```tsx
 * <ShieldButton
 *   permissions={["USER_DELETE_ANY"]}
 *   message="Admin access required"
 *   onClick={handleDelete}
 * >
 *   Delete User
 * </ShieldButton>
 * ```
 */
export function ShieldButton({
  permissions,
  message = "You don't have permission",
  displayType = "tooltip",
  children,
  onClick,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  permissions: Permission[];
  message?: string;
  displayType?: "tooltip" | "inline" | "disabled";
}) {
  const { permissions: userPermissions } = usePermissionContext();

  const hasAccess = React.useMemo(() => {
    if (!userPermissions) return false;
    return permissions.some((p: Permission) => userPermissions.permissions.includes(p));
  }, [userPermissions, permissions]);

  const isDisabled = disabled || !hasAccess;

  const button = (
    <button onClick={onClick} disabled={isDisabled} {...props}>
      {children}
    </button>
  );

  if (!hasAccess && message && displayType === "tooltip") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {React.cloneElement(
              button as React.ReactElement,
              {
                disabled: true,
              } as React.HTMLAttributes<HTMLElement>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

/**
 * PermissionBadge - display component showing user's permissions
 *
 * @example
 * ```tsx
 * <PermissionBadge permissions={["USER_READ_ANY"]} />
 * // Shows: "USER_READ_ANY" badge
 * ```
 */
export function PermissionBadge({
  permissions,
  compact = false,
}: {
  permissions: Permission[];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {permissions.map((permission) => (
        <span
          key={permission}
          className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
          title={permission}
        >
          {compact ? <span>{permission.split("_").pop()}</span> : <span>{permission}</span>}
        </span>
      ))}
    </div>
  );
}

/**
 * RoleBadge - display user's role
 *
 * @example
 * ```tsx
 * <RoleBadge role="ADMIN" />
 * // Shows: "ADMIN" badge
 * ```
 */
export function RoleBadge({
  role,
  variant = "default",
}: {
  role: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]}`}
    >
      {role}
    </span>
  );
}

export type { ShieldProps };
