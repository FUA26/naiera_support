/**
 * Shared Components Index
 *
 * This file exports shared components that are specific to this app.
 * For base UI components, import from @workspace/ui instead.
 */

export { AppIdentityBanner, PageHeaderWithIdentity } from "./app-identity-banner";
export { AppButton, AppActionButton, AppIconButton, AppButtonGroup } from "./app-button";
export {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardContent,
  AppCardFooter,
  AppStatCard,
  AppDivider,
} from "./app-card";

// Re-export common types
export type { AppButtonProps } from "./app-button";
export type { AppCardProps } from "./app-card";
