/**
 * Apps & Channels Management Page
 *
 * Main client component for managing support apps and their channels.
 * Refactored to use custom hooks for better code organization and maintainability.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Sparkles,
  MessageSquare,
  Ticket,
  Settings,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { usePermissions } from "@/lib/rbac-client/provider";
import { cn } from "@/lib/utils";
import type {
  App,
  Channel,
  ChannelType,
  DeleteDialogState,
} from "@/lib/types/apps";
import { CHANNEL_TYPE_OPTIONS, getChannelConfig } from "@/lib/constants/channel-config";
import { getIntegrationCode } from "@/lib/utils/integration-helpers";
import { useAppDialog } from "@/hooks/use-app-dialog";
import { useChannelDialog } from "@/hooks/use-channel-dialog";
import { useAppMutations } from "@/hooks/use-app-mutations";
import { useChannelMutations } from "@/hooks/use-channel-mutations";

/** Query key for apps list */
const APPS_QUERY_KEY = ["apps"] as const;

export function AppsClient() {
  const userPermissions = usePermissions();
  const canManage = userPermissions?.permissions.includes("TICKET_APP_MANAGE") ?? false;

  // Custom hooks for state management
  const appDialog = useAppDialog();
  const channelDialog = useChannelDialog();

  // Delete dialog state (separate since it handles both apps and channels)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: "app",
    item: null,
    app: null,
  });

  // Copy code state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search state
  const [search, setSearch] = useState("");

  // Mutations
  const appMutations = useAppMutations(appDialog.close);
  const channelMutations = useChannelMutations(
    channelDialog.closeDialog,
    channelDialog.closeSheet,
  );

  // Query apps
  const { data, isLoading } = useQuery({
    queryKey: APPS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Failed to fetch apps");
      return res.json();
    },
  });

  // Memoized filtered apps
  const filteredApps = useMemo(() => {
    const apps = data?.items ?? [];
    if (!search) return apps;

    const searchLower = search.toLowerCase();
    return apps.filter((app: App) =>
      app.name.toLowerCase().includes(searchLower) ||
      app.slug.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  // Stats calculations
  const stats = useMemo(() => {
    const apps = data?.items ?? [];
    return {
      totalApps: apps.length,
      totalChannels: apps.reduce((sum: number, app: App) => sum + app.channels.length, 0),
      totalTickets: apps.reduce((sum: number, app: App) => sum + (app._count?.tickets ?? 0), 0),
    };
  }, [data]);

  // Handlers
  const openDeleteDialog = useCallback((type: "app" | "channel", item: App | Channel, app: App) => {
    setDeleteDialog({ open: true, type, item, app });
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteDialog.item) return;

    if (deleteDialog.type === "app") {
      appMutations.deleteApp((deleteDialog.item as App).id);
    } else {
      channelMutations.deleteChannel((deleteDialog.item as Channel).id);
    }
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  }, [deleteDialog.item, deleteDialog.type, appMutations, channelMutations]);

  const copyToClipboard = useCallback((text: string, key: string) => {
    // Fallback for browsers where clipboard API is not available
    if (!navigator.clipboard) {
      // Use the deprecated but more widely supported method
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedCode(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (err) {
        toast.error("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedCode(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  }, []);

  const handleSaveApp = useCallback(() => {
    const error = appDialog.validate();
    if (error) {
      toast.error(error);
      return;
    }

    if (appDialog.dialog.mode === "create") {
      appMutations.createApp(appDialog.getCreatePayload());
    } else if (appDialog.dialog.app) {
      const payload = appDialog.getUpdatePayload();
      if (payload && Object.keys(payload).length > 0) {
        appMutations.updateApp({ id: appDialog.dialog.app.id, data: payload });
      } else {
        toast.info("No changes to save");
        appDialog.close();
      }
    }
  }, [appDialog, appMutations]);

  const handleSaveChannel = useCallback(() => {
    const error = channelDialog.validate();
    if (error) {
      toast.error(error);
      return;
    }

    const isEdit = channelDialog.isEditMode();

    if (!isEdit) {
      const payload = channelDialog.getCreatePayload("dummy");
      if (payload) {
        channelMutations.createChannel(payload);
      }
    } else {
      const payload = channelDialog.getUpdatePayload();
      const targetChannel = channelDialog.dialog.channel || channelDialog.sheet.channel;
      if (payload && targetChannel) {
        channelMutations.updateChannel({ id: targetChannel.id, data: payload });
      } else if (!payload) {
        toast.info("No changes to save");
        channelDialog.closeDialog();
        channelDialog.closeSheet();
      }
    }
  }, [channelDialog, channelMutations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Apps & Channels</h1>
          <p className="text-muted-foreground">
            Manage support apps and their channels for ticket routing
          </p>
        </div>
        {canManage && (
          <button onClick={appDialog.openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New App
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm input-soft pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
              <div className="text-sm text-muted-foreground">Total Apps</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <MessageSquare className="size-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalChannels}</div>
              <div className="text-sm text-muted-foreground">Total Channels</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <Ticket className="size-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          hasSearch={!!search}
          onCreateApp={appDialog.openCreate}
          canManage={canManage}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map((app: App) => (
            <AppCard
              key={app.id}
              app={app}
              canManage={canManage}
              onEdit={() => appDialog.openEdit(app)}
              onAddChannel={() => channelDialog.openCreate(app)}
              onManageChannel={(channel) => channelDialog.openSheet(app, channel)}
              onDeleteChannel={(channel) => openDeleteDialog("channel", channel, app)}
              onDelete={() => openDeleteDialog("app", app, app)}
            />
          ))}
        </div>
      )}

      {/* App Dialog */}
      <AppDialog
        dialog={appDialog.dialog}
        formData={appDialog.formData}
        onOpenChange={appDialog.setOpen}
        onSave={handleSaveApp}
        onNameChange={(name) => appDialog.dispatchForm({ type: "SET_NAME", name })}
        onSlugChange={(slug) => appDialog.dispatchForm({ type: "SET_SLUG", slug: appDialog.formatSlug(slug) })}
        onDescriptionChange={(description) => appDialog.dispatchForm({ type: "SET_DESCRIPTION", description })}
        onActiveChange={(isActive) => appDialog.dispatchForm({ type: "SET_ACTIVE", isActive })}
        isSaving={appMutations.isCreating || appMutations.isUpdating}
      />

      {/* Channel Dialog */}
      <ChannelDialog
        dialog={channelDialog.dialog}
        formData={channelDialog.formData}
        onOpenChange={channelDialog.setDialogOpen}
        onSave={handleSaveChannel}
        onNameChange={(name) => channelDialog.dispatchForm({ type: "SET_NAME", name })}
        onTypeChange={(type) => channelDialog.dispatchForm({ type: "SET_TYPE", channelType: type as ChannelType })}
        onActiveChange={(isActive) => channelDialog.dispatchForm({ type: "SET_ACTIVE", isActive })}
        isSaving={channelMutations.isCreating || channelMutations.isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        dialog={deleteDialog}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleDelete}
        isDeleting={appMutations.isDeleting || channelMutations.isDeleting}
      />

      {/* Manage Channel Sheet */}
      <ManageChannelSheet
        sheet={channelDialog.sheet}
        formData={channelDialog.formData}
        onOpenChange={channelDialog.setSheetOpen}
        onSave={handleSaveChannel}
        onDelete={() => {
          channelDialog.setSheetOpen(false);
          if (channelDialog.sheet.channel && channelDialog.sheet.app) {
            openDeleteDialog("channel", channelDialog.sheet.channel, channelDialog.sheet.app);
          }
        }}
        onNameChange={(name) => channelDialog.dispatchForm({ type: "SET_NAME", name })}
        onTypeChange={(type) => channelDialog.dispatchForm({ type: "SET_TYPE", channelType: type as ChannelType })}
        onActiveChange={(isActive) => channelDialog.dispatchForm({ type: "SET_ACTIVE", isActive })}
        onCopy={copyToClipboard}
        copiedCode={copiedCode}
        isSaving={channelMutations.isUpdating}
      />
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

/** Empty State Component */
function EmptyState({
  hasSearch,
  onCreateApp,
  canManage,
}: {
  hasSearch: boolean;
  onCreateApp: () => void;
  canManage: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
        <Sparkles className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No apps found</h3>
      <p className="text-muted-foreground mb-4">
        {hasSearch ? "Try a different search term" : "Create your first app to get started"}
      </p>
      {canManage && !hasSearch && (
        <button onClick={onCreateApp} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create First App
        </button>
      )}
    </div>
  );
}

/** App Dialog Component */
function AppDialog({
  dialog,
  formData,
  onOpenChange,
  onSave,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onActiveChange,
  isSaving,
}: {
  dialog: { open: boolean; mode: "create" | "edit" };
  formData: { name: string; slug: string; description: string; isActive: boolean };
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
  onActiveChange: (isActive: boolean) => void;
  isSaving: boolean;
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialog.mode === "create" ? "Create New App" : "Edit App"}</DialogTitle>
          <DialogDescription>
            {dialog.mode === "create"
              ? "Create a new support app to organize tickets by service or product."
              : "Update the app details."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Name *</Label>
            <Input
              id="appName"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Customer Support"
              className="input-soft"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appSlug">Slug</Label>
            <Input
              id="appSlug"
              value={formData.slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="e.g., customer-support"
              className="input-soft"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from name
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appDescription">Description</Label>
            <Textarea
              id="appDescription"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of this app..."
              rows={3}
              className="input-soft"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Enable this app for ticket creation
              </p>
            </div>
            <Switch checked={formData.isActive} onCheckedChange={onActiveChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="btn-primary">
            {isSaving ? "Saving..." : dialog.mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Channel Dialog Component */
function ChannelDialog({
  dialog,
  formData,
  onOpenChange,
  onSave,
  onNameChange,
  onTypeChange,
  onActiveChange,
  isSaving,
}: {
  dialog: { open: boolean; mode: "create" | "edit"; app: App | null };
  formData: { name: string; type: string; isActive: boolean };
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  onActiveChange: (isActive: boolean) => void;
  isSaving: boolean;
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dialog.mode === "create" ? "Add Channel" : "Edit Channel"}
          </DialogTitle>
          <DialogDescription>
            {dialog.mode === "create"
              ? `Add a new channel to ${dialog.app?.name || "this app"}`
              : "Update the channel details."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelName">Name *</Label>
            <Input
              id="channelName"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Website Form"
              className="input-soft"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelType">Type *</Label>
            <Select value={formData.type} onValueChange={onTypeChange}>
              <SelectTrigger id="channelType" className="input-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Enable this channel for ticket creation
              </p>
            </div>
            <Switch checked={formData.isActive} onCheckedChange={onActiveChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="btn-primary">
            {isSaving ? "Saving..." : dialog.mode === "create" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Delete Confirmation Dialog */
function DeleteDialog({
  dialog,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  dialog: DeleteDialogState;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {dialog.type === "app" ? "App" : "Channel"}?</DialogTitle>
          <DialogDescription>
            {dialog.type === "app"
              ? "This will delete the app and all its channels. This action cannot be undone."
              : "This will delete the channel. This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** App Card Component */
function AppCard({
  app,
  canManage,
  onEdit,
  onAddChannel,
  onManageChannel,
  onDeleteChannel,
  onDelete,
}: {
  app: App;
  canManage: boolean;
  onEdit: () => void;
  onAddChannel: () => void;
  onManageChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
  onDelete: () => void;
}) {
  const [showAllChannels, setShowAllChannels] = useState(false);
  const displayChannels = showAllChannels ? app.channels : app.channels.slice(0, 3);

  return (
    <div className="card-interactive group p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg truncate">{app.name}</h3>
            <Badge variant={app.isActive ? "default" : "secondary"} className="shrink-0">
              {app.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <code className="text-xs bg-muted px-2 py-0.5 rounded mt-1 inline-block">
            {app.slug}
          </code>
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex size-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                aria-label="App options"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <EditIcon />
                Edit App
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddChannel}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Channel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <DeleteIcon />
                Delete App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Description */}
      {app.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {app.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{app.channels.length} channels</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Ticket className="h-4 w-4" />
          <span>{app._count.tickets} tickets</span>
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Channels</span>
          {app.channels.length > 3 && (
            <button
              onClick={() => setShowAllChannels(!showAllChannels)}
              className="text-xs text-primary hover:underline"
            >
              {showAllChannels ? "Show less" : `Show ${app.channels.length - 3} more`}
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {displayChannels.map((channel) => (
            <ChannelBadge
              key={channel.id}
              channel={channel}
              onManage={onManageChannel}
              canManage={canManage}
            />
          ))}
          {app.channels.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">No channels yet</div>
          )}
        </div>
      </div>

      {/* Add Channel Button */}
      {canManage && (
        <button
          onClick={onAddChannel}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </button>
      )}
    </div>
  );
}

/** Channel Badge Component */
function ChannelBadge({
  channel,
  onManage,
  canManage,
}: {
  channel: Channel;
  onManage: (channel: Channel) => void;
  canManage: boolean;
}) {
  const config = getChannelConfig(channel.type);
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors group/channel">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn("flex size-8 items-center justify-center rounded-lg", config.bgLight, config.bgDark)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate flex items-center gap-1.5">
            {channel.name}
            {!channel.isActive && (
              <span className="text-xs text-muted-foreground">(inactive)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{config.label}</div>
        </div>
      </div>
      {canManage && (
        <div className="flex items-center gap-1 opacity-0 group-hover/channel:opacity-100 transition-opacity">
          <button
            onClick={() => onManage(channel)}
            className="flex size-7 items-center justify-center rounded-md hover:bg-accent"
            title="Manage channel"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Manage Channel Sheet Component */
function ManageChannelSheet({
  sheet,
  formData,
  onOpenChange,
  onSave,
  onDelete,
  onNameChange,
  onTypeChange,
  onActiveChange,
  onCopy,
  copiedCode,
  isSaving,
}: {
  sheet: { open: boolean; app: App | null; channel: Channel | null };
  formData: { name: string; type: string; isActive: boolean };
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  onActiveChange: (isActive: boolean) => void;
  onCopy: (text: string, key: string) => void;
  copiedCode: string | null;
  isSaving: boolean;
}) {
  if (!sheet.app || !sheet.channel) return null;

  const config = getChannelConfig(sheet.channel.type);

  return (
    <Sheet open={sheet.open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>Manage Channel</SheetTitle>
          <SheetDescription>
            Edit channel settings or view integration documentation
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="edit" className="w-full mt-4">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="edit">
              <EditIcon />
              Edit
            </TabsTrigger>
            <TabsTrigger value="integration">
              <CodeIcon />
              Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 py-4">
            {/* Channel Info */}
            {config && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={cn("flex size-10 items-center justify-center rounded-lg", config.bgLight, config.bgDark)}>
                  <config.icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{sheet.channel.name}</div>
                  <div className={cn("text-sm", config.color)}>{config.label}</div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manageChannelName">Name *</Label>
                <Input
                  id="manageChannelName"
                  value={formData.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g., Website Form"
                  className="input-soft"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manageChannelType">Type *</Label>
                <Select value={formData.type} onValueChange={onTypeChange}>
                  <SelectTrigger id="manageChannelType" className="input-soft">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", option.color)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable this channel for ticket creation
                  </p>
                </div>
                <Switch checked={formData.isActive} onCheckedChange={onActiveChange} />
              </div>
            </div>

            <SheetFooter className="sm:justify-end gap-2">
              <Button variant="destructive" onClick={onDelete}>
                <DeleteIcon />
                Delete Channel
              </Button>
              <Button onClick={onSave} disabled={isSaving} className="btn-primary">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </TabsContent>

          <TabsContent value="integration" className="py-4">
            <IntegrationGuideContent
              app={sheet.app}
              channel={sheet.channel}
              copiedCode={copiedCode}
              onCopy={onCopy}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/** Integration Guide Content */
function IntegrationGuideContent({
  app,
  channel,
  copiedCode,
  onCopy,
}: {
  app: App;
  channel: Channel;
  copiedCode: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const code = getIntegrationCode(app, channel);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
        <CodeIcon />
        <div className="flex-1">
          <div className="font-medium">{code.title}</div>
          <div className="text-sm text-muted-foreground">{code.description}</div>
        </div>
      </div>

      {channel.type === "INTEGRATED_APP" && (
        <SecurityWarning />
      )}

      {code.sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h4 className="font-medium text-sm">{section.title}</h4>
          <CodeBlock
            code={section.content}
            isCode={section.isCode}
            copied={copiedCode === `code-${idx}`}
            onCopy={() => onCopy(section.content, `code-${idx}`)}
          />
        </div>
      ))}

      {channel.type === "WEB_FORM" && (
        <div className="p-4 rounded-lg border">
          <h4 className="font-medium text-sm mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/support/tickets/new?app=${app.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Form
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/** Security Warning for API Keys */
function SecurityWarning() {
  return (
    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
      <div className="flex items-start gap-2">
        <span className="text-amber-500">⚠️</span>
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Important:</strong> Keep your API Key secure. Don't share it publicly or commit it to version control.
        </div>
      </div>
    </div>
  );
}

/** Code Block with Copy Button */
function CodeBlock({
  code,
  isCode,
  copied,
  onCopy,
}: {
  code: string;
  isCode: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      {isCode && (
        <button
          onClick={onCopy}
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md bg-background shadow transition-opacity hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon />
          ) : (
            <CopyIcon />
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Icon Components (simplified for reusability)
// ============================================================================

function EditIcon() {
  return <Edit className="mr-2 h-4 w-4" />;
}

function DeleteIcon() {
  return <Trash2 className="mr-2 h-4 w-4" />;
}

function CopyIcon() {
  return <Copy className="h-4 w-4 text-muted-foreground" />;
}

function CheckIcon() {
  return <Check className="h-4 w-4 text-green-500" />;
}

function CodeIcon() {
  return <Code className="mr-2 h-4 w-4" />;
}
