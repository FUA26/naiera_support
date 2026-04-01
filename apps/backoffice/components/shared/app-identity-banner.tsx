/**
 * App Identity Banner Component
 *
 * This component displays the app's identity visually at the top of key pages.
 * It helps users quickly recognize which app they're in while maintaining
 * consistency across the ecosystem.
 *
 * USAGE:
 * import { AppIdentityBanner } from "@/components/shared/app-identity-banner";
 *
 * <AppIdentityBanner />
 * <AppIdentityBanner variant="compact" />
 * <AppIdentityBanner showDescription />
 */

import { getAppIdentity } from "@/lib/config/app-identity";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@workspace/utils";

const bannerVariants = cva(
  "relative overflow-hidden border-b transition-all",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary/5 via-accent/5 to-background py-6",
        compact: "bg-gradient-to-r from-primary/5 to-accent/5 py-3",
        minimal: "bg-background border-primary/20 py-2",
      },
      radius: {
        none: "",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "none",
    },
  }
);

interface AppIdentityBannerProps extends VariantProps<typeof bannerVariants> {
  showDescription?: boolean;
  showPattern?: boolean;
  className?: string;
}

export function AppIdentityBanner({
  variant = "default",
  radius,
  showDescription = false,
  showPattern = true,
  className,
}: AppIdentityBannerProps) {
  const appIdentity = getAppIdentity();
  const AppIcon = appIdentity.icon;

  return (
    <div className={cn(bannerVariants({ variant, radius }), className)}>
      {/* Background pattern - subtle identity marker */}
      {showPattern && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Accent line at top - primary app color */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-app-gradient" />

      <div className="relative flex items-center gap-4">
        {/* App Icon */}
        <div className="flex size-12 items-center justify-center rounded-xl bg-app-gradient shadow-lg shadow-primary/20">
          <AppIcon className="size-6 text-white" strokeWidth={2} />
        </div>

        {/* App Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{appIdentity.name}</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              v{appIdentity.version}
            </span>
          </div>
          {showDescription ? (
            <p className="text-sm text-muted-foreground">{appIdentity.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{appIdentity.tagline}</p>
          )}
        </div>

        {/* Status indicator - shows app is active */}
        <div className="hidden items-center gap-2 rounded-full bg-background/50 px-3 py-1.5 text-sm md:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <span className="text-muted-foreground">System Active</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact page header with app identity
 */
export function PageHeaderWithIdentity({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const appIdentity = getAppIdentity();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb with app identity */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-primary">{appIdentity.shortName}</span>
        <span>/</span>
        <span>{title}</span>
      </div>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
