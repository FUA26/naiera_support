/**
 * Integration Code Generators
 *
 * Helper functions to generate integration code snippets for different channel types.
 */

import type { App, Channel, IntegrationGuide } from "@/lib/types/apps";

/**
 * Generate integration code snippets for a channel
 */
export function getIntegrationCode(app: App, channel: Channel): IntegrationGuide {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3100";
  const apiUrl = `${baseUrl}/api/integrated/tickets`;
  const apiKey = channel.apiKey || "YOUR_API_KEY";

  switch (channel.type) {
    case "INTEGRATED_APP":
      return {
        title: "Integrated App API",
        description: "Use this API Key to integrate your application",
        sections: [
          {
            title: "🔑 API Key",
            content: apiKey,
            isCode: true,
          },
          {
            title: "📡 API Endpoint",
            content: apiUrl,
            isCode: true,
          },
          {
            title: "📝 Create Ticket (POST)",
            content: `POST ${apiUrl}\nX-API-Key: ${apiKey}\nContent-Type: application/json\n\n{\n  "externalUserId": "user_123",\n  "externalUserName": "Budi Santoso",\n  "externalUserEmail": "budi@example.com",\n  "subject": "Laporan masalah",\n  "message": "Saya mengalami masalah...",\n  "priority": "NORMAL"\n}`,
            isCode: true,
          },
          {
            title: "📋 List Tickets (GET)",
            content: `GET ${apiUrl}?externalUserId=user_123\nX-API-Key: ${apiKey}\n\n# OR by email:\nGET ${apiUrl}?email=budi@example.com\nX-API-Key: ${apiKey}\n\n# Response:\n{\n  "tickets": [\n    {\n      "id": "ticket_id",\n      "ticketNumber": "TKT-001",\n      "subject": "Ticket subject",\n      "status": "OPEN",\n      "priority": "NORMAL",\n      "createdAt": "2024-01-01T00:00:00Z",\n      "updatedAt": "2024-01-01T00:00:00Z",\n      "messageCount": 3,\n      "lastMessage": "Last message content..."\n    }\n  ]\n}`,
            isCode: true,
          },
          {
            title: "🌐 Web View (externalUserId)",
            content: `# Generate Token for Web View
POST ${baseUrl}/api/integrated/auth/token
Content-Type: application/json\n
{
  "channelSlug": "${channel.slug}",
  "externalUserId": "user_123",
  "purpose": "list_tickets"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 1800
}

# Web View URL:
${baseUrl}/integrated/view-tickets?token=GENERATED_TOKEN

# Security Features:
# - JWT token signed with channel API key
# - Token expires after 30 minutes
# - Rate limited: 10 requests/minute per user
# - Token tied to specific channel and app`,
            isCode: true,
          },
          {
            title: "📜 Get Ticket Detail (GET)",
            content: `GET ${apiUrl}/{ticketId}\nX-API-Key: ${apiKey}\n\n# Example:\nGET ${apiUrl}/cmxxx123\nX-API-Key: ${apiKey}\n\n# Response:\n{\n  "id": "ticket_id",\n  "ticketNumber": "TKT-001",\n  "subject": "Ticket subject",\n  "description": "Ticket description...",\n  "status": "OPEN",\n  "priority": "NORMAL",\n  "createdAt": "2024-01-01T00:00:00Z",\n  "updatedAt": "2024-01-01T00:00:00Z",\n  "messages": [\n    {\n      "id": "msg_id",\n      "message": "Message content",\n      "sender": "CUSTOMER",\n      "createdAt": "2024-01-01T00:00:00Z"\n    }\n  ]\n}`,
            isCode: true,
          },
        ],
      };

    case "WEB_FORM":
      return {
        title: "Web Form Integration",
        description: "Embed this form on your website",
        sections: [
          {
            title: "🔗 Public Form URL",
            content: `${baseUrl}/support/tickets/new?app=${app.slug}`,
            isCode: true,
          },
          {
            title: "📋 Embed HTML",
            content: `<iframe\n  src="${baseUrl}/support/tickets/new?app=${app.slug}&embed=true"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border: 1px solid #e5e7eb; border-radius: 8px;">\n</iframe>`,
            isCode: true,
          },
        ],
      };

    case "PUBLIC_LINK":
      return {
        title: "Public Link",
        description: "Share this link to collect tickets",
        sections: [
          {
            title: "🔗 Public URL",
            content: `${baseUrl}/support/tickets/new?app=${app.slug}&channel=${channel.id}`,
            isCode: true,
          },
        ],
      };

    case "WIDGET":
      return {
        title: "Widget Embed",
        description: "Add floating support widget",
        sections: [
          {
            title: "📜 Embed Script",
            content: `<script src="${baseUrl}/widget/support.js"></script>\n<script>\n  SupportWidget.init({\n    appSlug: '${app.slug}',\n    channel: '${channel.id}',\n    position: 'bottom-right',\n    primaryColor: '#14b8a6',\n  });\n</script>`,
            isCode: true,
          },
        ],
      };

    default:
      return {
        title: channel.type,
        description: "Integration guide",
        sections: [],
      };
  }
}

/**
 * Get widget embed URL for a channel
 */
export function getWidgetEmbedUrl(app: App, channel: Channel): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3100";
  return `${baseUrl}/widget/support.js`;
}

/**
 * Get public form URL for an app
 */
export function getPublicFormUrl(app: App, channel?: Channel): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3100";
  const channelParam = channel ? `&channel=${channel.id}` : "";
  return `${baseUrl}/support/tickets/new?app=${app.slug}${channelParam}`;
}
