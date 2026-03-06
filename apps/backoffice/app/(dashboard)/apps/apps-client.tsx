"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Edit, Trash2, MessageSquare, Code, Copy, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { usePermissions } from "@/lib/rbac-client/provider";
import { cn } from "@/lib/utils";

type App = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  channels: Channel[];
  _count: { tickets: number };
};

type Channel = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  apiKey?: string | null;
};

const channelTypeLabels: Record<string, string> = {
  WEB_FORM: "Web Form",
  PUBLIC_LINK: "Public Link",
  WIDGET: "Widget",
  INTEGRATED_APP: "Integrated App",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
};

const channelTypeColors: Record<string, string> = {
  WEB_FORM: "bg-blue-100 text-blue-800",
  PUBLIC_LINK: "bg-green-100 text-green-800",
  WIDGET: "bg-purple-100 text-purple-800",
  INTEGRATED_APP: "bg-orange-100 text-orange-800",
  WHATSAPP: "bg-emerald-100 text-emerald-800",
  TELEGRAM: "bg-sky-100 text-sky-800",
};

export function AppsClient() {
  const queryClient = useQueryClient();
  const userPermissions = usePermissions();
  const canManage = userPermissions?.permissions.includes("TICKET_APP_MANAGE");

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appDialog, setAppDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    app: App | null;
  }>({ open: false, mode: "create", app: null });
  const [channelDialog, setChannelDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    app: App | null;
    channel: Channel | null;
  }>({ open: false, mode: "create", app: null, channel: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "app" | "channel";
    item: App | Channel | null;
    app: App | null;
  }>({ open: false, type: "app", item: null, app: null });

  const [integrationDialog, setIntegrationDialog] = useState<{
    open: boolean;
    app: App | null;
    channel: Channel | null;
  }>({ open: false, app: null, channel: null });

  const [manageChannelDialog, setManageChannelDialog] = useState<{
    open: boolean;
    app: App | null;
    channel: Channel | null;
  }>({ open: false, app: null, channel: null });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [appName, setAppName] = useState("");
  const [appSlug, setAppSlug] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appIsActive, setAppIsActive] = useState(true);

  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("WEB_FORM");
  const [channelIsActive, setChannelIsActive] = useState(true);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["apps", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/apps?${params}`);
      if (!res.ok) throw new Error("Failed to fetch apps");
      return res.json();
    },
  });

  // Mutations
  const createAppMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string; description?: string; isActive?: boolean }) => {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create app");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setAppDialog({ open: false, mode: "create", app: null });
      toast.success("App created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateAppMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; slug?: string; description?: string; isActive?: boolean } }) => {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update app");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setAppDialog({ open: false, mode: "create", app: null });
      toast.success("App updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete app");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setDeleteDialog({ open: false, type: "app", item: null, app: null });
      toast.success("App deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: { appId: string; name: string; type: string; isActive?: boolean }) => {
      const res = await fetch(`/api/apps/${data.appId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create channel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setChannelDialog({ open: false, mode: "create", app: null, channel: null });
      toast.success("Channel created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; type?: string; isActive?: boolean } }) => {
      const res = await fetch(`/api/channels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update channel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setChannelDialog({ open: false, mode: "create", app: null, channel: null });
      setManageChannelDialog({ open: false, app: null, channel: null });
      toast.success("Channel updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete channel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apps"] });
      setDeleteDialog({ open: false, type: "app", item: null, app: null });
      toast.success("Channel deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const openCreateAppDialog = () => {
    setAppName("");
    setAppSlug("");
    setAppDescription("");
    setAppIsActive(true);
    setAppDialog({ open: true, mode: "create", app: null });
  };

  const openEditAppDialog = (app: App) => {
    setAppName(app.name);
    setAppSlug(app.slug);
    setAppDescription(app.description || "");
    setAppIsActive(app.isActive);
    setAppDialog({ open: true, mode: "edit", app });
  };

  const openCreateChannelDialog = (app: App) => {
    setChannelName("");
    setChannelType("WEB_FORM");
    setChannelIsActive(true);
    setChannelDialog({ open: true, mode: "create", app, channel: null });
  };

  const openEditChannelDialog = (app: App, channel: Channel) => {
    setChannelName(channel.name);
    setChannelType(channel.type);
    setChannelIsActive(channel.isActive);
    setChannelDialog({ open: true, mode: "edit", app, channel });
  };

  const openDeleteDialog = (type: "app" | "channel", item: App | Channel, app: App) => {
    setDeleteDialog({ open: true, type, item, app });
  };

  const openIntegrationDialog = (app: App, channel: Channel) => {
    setIntegrationDialog({ open: true, app, channel });
  };

  const openManageChannelDialog = (app: App, channel: Channel) => {
    // Pre-fill the channel form data
    setChannelName(channel.name);
    setChannelType(channel.type);
    setChannelIsActive(channel.isActive);
    setManageChannelDialog({ open: true, app, channel });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate integration guide based on channel type
  const getIntegrationGuide = (app: App, channel: Channel) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3100";
    const apiUrl = `${baseUrl}/api/integrated/tickets`;
    const apiKey = channel.apiKey || "YOUR_API_KEY";

    switch (channel.type) {
      case "INTEGRATED_APP":
        return {
          title: "Integrated App API (API Key)",
          description: "Gunakan API Key untuk integrasi dengan aplikasi Anda. Tidak perlu session/auth dari user.",
          sections: [
            {
              title: "🔑 API Key",
              content: "API Key ini digunakan untuk autentikasi. Jaga kerahasiaannya!",
              code: apiKey,
            },
            {
              title: "API Endpoint",
              content: "Base URL untuk semua operasi ticket",
              code: apiUrl,
            },
            {
              title: "1. Create Ticket (POST)",
              content: "Buat ticket baru atas nama user Anda. Kirim externalUserId untuk identifikasi.",
              code: `POST ${apiUrl}
X-API-Key: ${apiKey}
Content-Type: application/json

{
  "externalUserId": "user_123",
  "externalUserName": "Budi Santoso",
  "externalUserEmail": "budi@example.com",
  "subject": "Laporan masalah",
  "message": "Saya mengalami masalah dengan...",
  "priority": "NORMAL"
}`,
            },
            {
              title: "2. List Tickets (GET)",
              content: "Ambil semua ticket untuk user tertentu berdasarkan externalUserId.",
              code: `GET ${apiUrl}?externalUserId=user_123
X-API-Key: ${apiKey}

// Response:
{
  "tickets": [
    {
      "id": "ticket_id",
      "ticketNumber": "APP-00001",
      "subject": "Laporan masalah",
      "status": "OPEN",
      "priority": "NORMAL",
      "createdAt": "2025-01-01T00:00:00Z",
      "messageCount": 3,
      "lastMessage": "Terima kasih laporannya..."
    }
  ]
}`,
            },
            {
              title: "Example: JavaScript/Fetch",
              content: "Contoh implementasi di aplikasi JavaScript Anda:",
              code: `// Service untuk komunikasi dengan ticketing API
class TicketService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = '${apiUrl}';
  }

  // Buat ticket untuk user
  async createTicket(externalUserId, data) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        externalUserId,
        externalUserName: data.userName,
        externalUserEmail: data.userEmail,
        subject: data.subject,
        message: data.message,
        priority: data.priority || 'NORMAL',
      }),
    });
    return response.json();
  }

  // Ambil semua ticket user
  async getUserTickets(externalUserId) {
    const response = await fetch(\`\${this.baseUrl}?externalUserId=\${externalUserId}\`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
    });
    return response.json();
  }
}

// Usage di aplikasi Anda
const ticketService = new TicketService('${apiKey}');

// Saat user submit ticket:
await ticketService.createTicket('user_123', {
  userName: 'Budi Santoso',
  userEmail: 'budi@example.com',
  subject: 'Masalah login',
  message: 'Saya tidak bisa login...',
});

// Saat user lihat ticket mereka:
const tickets = await ticketService.getUserTickets('user_123');
console.log(tickets);`,
            },
            {
              title: "Example: React Hook",
              content: "Custom React hook untuk manajemen ticket di aplikasi Anda:",
              code: `"use client";

import { useState, useCallback } from 'react';

const TICKET_API = '${apiUrl}';
const API_KEY = '${apiKey}';

export function useTickets(externalUserId) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(\`\${TICKET_API}?externalUserId=\${externalUserId}\`, {
        headers: { 'X-API-Key': API_KEY },
      });
      const data = await res.json();
      setTickets(data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [externalUserId]);

  const createTicket = useCallback(async (ticketData) => {
    setLoading(true);
    try {
      const res = await fetch(TICKET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          externalUserId,
          ...ticketData,
        }),
      });
      const data = await res.json();
      await fetchTickets(); // Refresh list
      return data;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [externalUserId, fetchTickets]);

  return { tickets, loading, fetchTickets, createTicket };
}

// Usage di component:
function SupportPage({ user }) {
  const { tickets, loading, createTicket } = useTickets(user.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await createTicket({
      externalUserName: user.name,
      externalUserEmail: user.email,
      subject: formData.get('subject'),
      message: formData.get('message'),
    });
  };

  return (
    <div>
      <h1>Support Tickets</h1>
      <form onSubmit={handleSubmit}>
        <input name="subject" placeholder="Subject" required />
        <textarea name="message" placeholder="Describe your issue..." required />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
      <h2>Your Tickets</h2>
      <ul>
        {tickets.map(t => (
          <li key={t.id}>
            {t.ticketNumber}: {t.subject} ({t.status})
          </li>
        ))}
      </ul>
    </div>
  );
}`,
            },
          ],
        };

      case "WEB_FORM":
        return {
          title: "Web Form Integration",
          description: "Embed form ini di website Anda untuk collect tickets.",
          sections: [
            {
              title: "Public Form URL",
              content: `${baseUrl}/support/tickets/new?app=${app.slug}`,
              code: `${baseUrl}/support/tickets/new?app=${app.slug}`,
            },
            {
              title: "Embed HTML",
              content: "Copy kode berikut dan paste ke halaman website Anda:",
              code: `<iframe
  src="${baseUrl}/support/tickets/new?app=${app.slug}&embed=true"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;">
</iframe>`,
            },
            {
              title: "Styling Options",
              content: "Anda bisa menambahkan parameter berikut untuk custom tampilan:",
              code: `?app=${app.slug}&embed=true&theme=dark&primaryColor=3b82f6`,
            },
          ],
        };

      case "PUBLIC_LINK":
        return {
          title: "Public Link",
          description: "Share link ini untuk collect tickets dari user tanpa login.",
          sections: [
            {
              title: "Public Form URL",
              content: `${baseUrl}/support/tickets/new?app=${app.slug}&channel=${channel.id}`,
              code: `${baseUrl}/support/tickets/new?app=${app.slug}&channel=${channel.id}`,
            },
            {
              title: "QR Code",
              content: "Generate QR code untuk form ini:",
              code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${baseUrl}/support/tickets/new?app=${app.slug}`)}`,
            },
          ],
        };

      case "WIDGET":
        return {
          title: "Widget Embed",
          description: "Tambahkan floating widget support di website Anda.",
          sections: [
            {
              title: "Embed Script",
              content: "Paste kode ini sebelum closing </body> tag:",
              code: `<script src="${baseUrl}/widget/support.js"></script>
<script>
  SupportWidget.init({
    appSlug: '${app.slug}',
    channel: '${channel.id}',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
  });
</script>`,
            },
            {
              title: "Floating Button",
              content: "Widget akan menampilkan tombol floating di pojok halaman:",
              code: `<button class="support-widget-btn">
  💬 Support
</button>`,
            },
          ],
        };

      case "WHATSAPP":
        return {
          title: "WhatsApp Integration",
          description: "Connect WhatsApp Business API untuk ticket via WhatsApp.",
          sections: [
            {
              title: "Setup Required",
              content: "Hubungi admin untuk setup WhatsApp Business API integration.",
              code: null,
            },
            {
              title: "Configuration",
              content: "Parameter yang diperlukan:",
              code: `{
  "phoneNumber": "+628123456789",
  "businessAccountId": "your_business_id",
  "webhookUrl": "${baseUrl}/api/webhooks/whatsapp"
}`,
            },
          ],
        };

      case "TELEGRAM":
        return {
          title: "Telegram Integration",
          description: "Connect Telegram Bot untuk ticket via Telegram.",
          sections: [
            {
              title: "Setup Required",
              content: "Hubungi admin untuk setup Telegram Bot integration.",
              code: null,
            },
            {
              title: "Configuration",
              content: "Parameter yang diperlukan:",
              code: `{
  "botToken": "your_bot_token",
  "webhookUrl": "${baseUrl}/api/webhooks/telegram"
}`,
            },
          ],
        };

      default:
        return {
          title: "Integration Guide",
          description: "Panduan integrasi channel ini.",
          sections: [],
        };
    }
  };

  const handleSaveApp = () => {
    if (!appName.trim()) {
      toast.error("App name is required");
      return;
    }

    if (appDialog.mode === "create") {
      createAppMutation.mutate({
        name: appName,
        slug: appSlug || undefined,
        description: appDescription || undefined,
        isActive: appIsActive,
      });
    } else if (appDialog.app) {
      updateAppMutation.mutate({
        id: appDialog.app.id,
        data: {
          name: appName,
          ...(appSlug.trim() && { slug: appSlug }),
          description: appDescription || undefined,
          isActive: appIsActive,
        },
      });
    }
  };

  const handleSaveChannel = () => {
    if (!channelName.trim()) {
      toast.error("Channel name is required");
      return;
    }

    // Use manage channel dialog if open, otherwise use channel dialog
    const targetDialog = manageChannelDialog.open ? manageChannelDialog : channelDialog;

    if (!targetDialog.channel) return;

    updateChannelMutation.mutate({
      id: targetDialog.channel.id,
      data: {
        name: channelName,
        type: channelType,
        isActive: channelIsActive,
      },
    });
  };

  const handleDelete = () => {
    if (!deleteDialog.item) return;

    if (deleteDialog.type === "app") {
      deleteAppMutation.mutate((deleteDialog.item as App).id);
    } else {
      deleteChannelMutation.mutate((deleteDialog.item as Channel).id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apps & Channels</h1>
          <p className="text-muted-foreground">
            Manage support apps and their channels for ticket routing
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateAppDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New App
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Apps Table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="w-[70px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No apps found. Create your first app to get started.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((app: App) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.name}</div>
                        {app.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {app.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {app.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.channels.map((channel) => (
                          <Badge
                            key={channel.id}
                            variant="outline"
                            className={cn(
                              "text-xs",
                              !channel.isActive && "opacity-50"
                            )}
                          >
                            {channel.name}
                          </Badge>
                        ))}
                        {app.channels.length === 0 && (
                          <span className="text-sm text-muted-foreground">No channels</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app._count.tickets}</TableCell>
                    <TableCell>
                      <Badge variant={app.isActive ? "default" : "secondary"}>
                        {app.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditAppDialog(app)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit App
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openCreateChannelDialog(app)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Channel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {app.channels.map((channel) => (
                              <DropdownMenuItem
                                key={channel.id}
                                onClick={() => openManageChannelDialog(app, channel)}
                              >
                                <Settings className="mr-2 h-3 w-3 opacity-50" />
                                Manage: {channel.name}
                              </DropdownMenuItem>
                            ))}
                            {app.channels.length > 0 && <DropdownMenuSeparator />}
                            {app.channels.map((channel) => (
                              <DropdownMenuItem
                                key={`delete-${channel.id}`}
                                onClick={() => openDeleteDialog("channel", channel, app)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                {channel.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog("app", app, app)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete App
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* App Dialog */}
      <Dialog open={appDialog.open} onOpenChange={(open) => setAppDialog({ ...appDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{appDialog.mode === "create" ? "Create New App" : "Edit App"}</DialogTitle>
            <DialogDescription>
              {appDialog.mode === "create"
                ? "Create a new support app to organize tickets by service or product."
                : "Update the app details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Name *</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g., Customer Support"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appSlug">Slug</Label>
              <Input
                id="appSlug"
                value={appSlug}
                onChange={(e) => setAppSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="e.g., customer-support"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from name
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appDescription">Description</Label>
              <Textarea
                id="appDescription"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                placeholder="Brief description of this app..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this app for ticket creation
                </p>
              </div>
              <Switch checked={appIsActive} onCheckedChange={setAppIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppDialog({ ...appDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveApp}
              disabled={createAppMutation.isPending || updateAppMutation.isPending}
            >
              {appDialog.mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Dialog */}
      <Dialog open={channelDialog.open} onOpenChange={(open) => setChannelDialog({ ...channelDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {channelDialog.mode === "create" ? "Add Channel" : "Edit Channel"}
            </DialogTitle>
            <DialogDescription>
              {channelDialog.mode === "create"
                ? `Add a new channel to ${channelDialog.app?.name || "this app"}`
                : "Update the channel details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channelName">Name *</Label>
              <Input
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., Website Form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channelType">Type *</Label>
              <Select value={channelType} onValueChange={setChannelType}>
                <SelectTrigger id="channelType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB_FORM">Web Form</SelectItem>
                  <SelectItem value="PUBLIC_LINK">Public Link</SelectItem>
                  <SelectItem value="WIDGET">Widget</SelectItem>
                  <SelectItem value="INTEGRATED_APP">Integrated App</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="TELEGRAM">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this channel for ticket creation
                </p>
              </div>
              <Switch checked={channelIsActive} onCheckedChange={setChannelIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChannelDialog({ ...channelDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChannel}
              disabled={createChannelMutation.isPending || updateChannelMutation.isPending}
            >
              {channelDialog.mode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.type === "app" ? "App" : "Channel"}?</DialogTitle>
            <DialogDescription>
              {deleteDialog.type === "app"
                ? "This will delete the app and all its channels. This action cannot be undone."
                : "This will delete the channel. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAppMutation.isPending || deleteChannelMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Guide Dialog */}
      <Dialog open={integrationDialog.open} onOpenChange={(open) => setIntegrationDialog({ ...integrationDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {integrationDialog.channel && getIntegrationGuide(integrationDialog.app!, integrationDialog.channel).title}
            </DialogTitle>
            <DialogDescription>
              {integrationDialog.channel && getIntegrationGuide(integrationDialog.app!, integrationDialog.channel).description}
            </DialogDescription>
          </DialogHeader>
          {integrationDialog.app && integrationDialog.channel && (() => {
            const guide = getIntegrationGuide(integrationDialog.app, integrationDialog.channel);
            return (
              <div className="space-y-6 py-4">
                {guide.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    {section.content && <p className="text-sm text-muted-foreground">{section.content}</p>}
                    {section.code && (
                      <div className="relative group">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{section.code}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(section.code!, `code-${idx}`)}
                        >
                          {copiedCode === `code-${idx}` ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIntegrationDialog({ ...integrationDialog, open: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Channel Dialog with Tabs */}
      <Dialog open={manageChannelDialog.open} onOpenChange={(open) => setManageChannelDialog({ ...manageChannelDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Channel: {manageChannelDialog.channel?.name}
            </DialogTitle>
            <DialogDescription>
              Edit channel settings or view integration documentation
            </DialogDescription>
          </DialogHeader>
          {manageChannelDialog.app && manageChannelDialog.channel && (
            <Tabs defaultValue="edit" className="w-full">
              <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Channel
                </TabsTrigger>
                <TabsTrigger value="integration">
                  <Code className="mr-2 h-4 w-4" />
                  Integration Guide
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="manageChannelName">Name *</Label>
                  <Input
                    id="manageChannelName"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g., Website Form"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manageChannelType">Type *</Label>
                  <Select value={channelType} onValueChange={setChannelType}>
                    <SelectTrigger id="manageChannelType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEB_FORM">Web Form</SelectItem>
                      <SelectItem value="PUBLIC_LINK">Public Link</SelectItem>
                      <SelectItem value="WIDGET">Widget</SelectItem>
                      <SelectItem value="INTEGRATED_APP">Integrated App</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="TELEGRAM">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this channel for ticket creation
                    </p>
                  </div>
                  <Switch checked={channelIsActive} onCheckedChange={setChannelIsActive} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveChannel}
                    disabled={updateChannelMutation.isPending}
                  >
                    {updateChannelMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="integration" className="py-4">
                {(() => {
                  const guide = getIntegrationGuide(manageChannelDialog.app, manageChannelDialog.channel);
                  return (
                    <div className="space-y-6">
                      {guide.sections.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                          <h3 className="font-semibold text-lg">{section.title}</h3>
                          {section.content && <p className="text-sm text-muted-foreground">{section.content}</p>}
                          {section.code && (
                            <div className="relative group">
                              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                                <code>{section.code}</code>
                              </pre>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(section.code!, `manage-code-${idx}`)}
                              >
                                {copiedCode === `manage-code-${idx}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
