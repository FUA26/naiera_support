/**
 * App Identity Demo Page
 *
 * This page demonstrates the app identity system.
 * Each app should have their own version showing their unique identity.
 *
 * This can serve as:
 * 1. A reference for developers building new apps
 * 2. A visual style guide for the app
 * 3. A living documentation of the app's identity
 */

import { getAppIdentity } from "@/lib/config/app-identity";
import { AppIdentityBanner, PageHeaderWithIdentity } from "@/components/shared/app-identity-banner";
import { AppButton, AppActionButton, AppIconButton } from "@/components/shared/app-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui";
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  Globe,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function AppIdentityDemoPage() {
  const appIdentity = getAppIdentity();
  const AppIcon = appIdentity.icon;

  return (
    <div className="space-y-6">
      {/* Full App Identity Banner */}
      <AppIdentityBanner showDescription showPattern />

      {/* Page Header with Breadcrumb */}
      <PageHeaderWithIdentity
        title="App Identity Demo"
        description="Visual demonstration of Naiera Support's unique identity within the ecosystem"
        actions={
          <AppButton>
            <Settings className="size-4" />
            Settings
          </AppButton>
        }
      />

      {/* Identity Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">App Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appIdentity.name}</div>
            <p className="text-sm text-muted-foreground">{appIdentity.fullName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appIdentity.version}</div>
            <p className="text-sm text-muted-foreground">Current Release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{appIdentity.category}</div>
            <p className="text-sm text-muted-foreground">{appIdentity.industry}</p>
          </CardContent>
        </Card>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            The unique colors that identify this app within the ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ColorSwatch
              name="Primary"
              color="var(--primary)"
              description="Main brand color"
            />
            <ColorSwatch
              name="Primary Light"
              color="var(--primary-light)"
              description="Backgrounds and accents"
            />
            <ColorSwatch
              name="Primary Dark"
              color="var(--primary-dark)"
              description="Hover states"
            />
            <ColorSwatch
              name="Accent"
              color="var(--accent)"
              description="Secondary highlights"
            />
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Styles</CardTitle>
          <CardDescription>
            App-branded button variants for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <AppButton>Default Button</AppButton>
            <AppButton variant="app-gradient">Gradient Button</AppButton>
            <AppButton variant="app-ghost">Ghost Button</AppButton>
            <AppButton variant="app-outline">Outline Button</AppButton>
            <AppActionButton>Action Button</AppActionButton>
            <AppIconButton>
              <Settings className="size-4" />
            </AppIconButton>
          </div>
        </CardContent>
      </Card>

      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle>App Features</CardTitle>
          <CardDescription>
            Key capabilities of {appIdentity.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {appIdentity.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <AppIcon className="size-5 shrink-0 text-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Users */}
      <Card>
        <CardHeader>
          <CardTitle>Target Users</CardTitle>
          <CardDescription>
            Primary user types for this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {appIdentity.targetUsers.map((user, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {user}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Metrics</CardTitle>
          <CardDescription>
            Key metrics displayed on the app dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {appIdentity.defaultMetrics.map((metric) => {
              const Icon = getMetricIcon(metric.icon);
              return (
                <div
                  key={metric.id}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-app-gradient">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-2xl font-bold">---</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Configuration</CardTitle>
          <CardDescription>
            Visual style settings for this app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <ThemeSetting label="Style" value={appIdentity.theme.style} />
            <ThemeSetting label="Mood" value={appIdentity.theme.mood} />
            <ThemeSetting label="Color Family" value={appIdentity.theme.primaryColorFamily} />
            <ThemeSetting label="Border Style" value={appIdentity.theme.borderStyle} />
            <ThemeSetting label="Animation" value={appIdentity.theme.animationStyle} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorSwatch({
  name,
  color,
  description,
}: {
  name: string;
  color: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div
        className="aspect-square w-full rounded-lg shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function ThemeSetting({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function getMetricIcon(icon: string) {
  switch (icon) {
    case "ticket":
      return LifeBuoy;
    case "alert-circle":
      return AlertCircle;
    case "check-circle":
      return CheckCircle;
    case "clock":
      return Clock;
    default:
      return BarChart3;
  }
}
