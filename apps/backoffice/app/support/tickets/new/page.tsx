"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, MessageSquare, Mail, User, Phone } from "lucide-react";
import { AttachmentUpload, type AttachmentFile } from "@/components/ticketing/attachment-upload";

function TicketForm() {
  const searchParams = useSearchParams();
  const appSlug = searchParams.get("app");
  const channelParam = searchParams.get("channel");
  const embed = searchParams.get("embed") === "true";

  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // Fetch app info
  useEffect(() => {
    if (appSlug) {
      fetch(`/api/apps/by-slug/${appSlug}`)
        .then((res) => {
          if (!res.ok) throw new Error("App not found");
          return res.json();
        })
        .then((data) => {
          setAppInfo(data);
        })
        .catch(() => {
          setError("App not found or inactive");
        })
        .finally(() => {
          setAppLoading(false);
        });
    } else {
      setAppLoading(false);
    }
  }, [appSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Prepare attachment metadata
    const attachmentMetadata = attachments
      .filter((a) => a.uploadedUrl)
      .map((a) => ({
        url: a.uploadedUrl!,
        name: a.file.name,
        type: a.file.type,
        size: a.file.size,
      }));

    try {
      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appSlug,
          channelType: "WEB_FORM",
          subject,
          message,
          priority,
          guestEmail: guestEmail || undefined,
          guestName: guestName || undefined,
          guestPhone: guestPhone || undefined,
          attachments: attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create ticket");
      }

      setTicketNumber(data.ticketNumber);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSubject("");
    setMessage("");
    setPriority("NORMAL");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setAttachments([]);
    setSubmitted(false);
    setTicketNumber("");
    setError(null);
  };

  // Show loading state while fetching app info
  if (appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error if app not found
  if (appSlug && !appInfo && !error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          App not found or inactive. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Ticket Created Successfully!</CardTitle>
          <CardDescription>
            Your ticket has been created and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Ticket Number</p>
            <p className="text-2xl font-bold">{ticketNumber}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            We have sent a confirmation email with your ticket details. You can use the ticket number to check the status of your request.
          </p>
          <Button onClick={resetForm} className="w-full">
            Create Another Ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={embed ? "border-0 shadow-none" : "max-w-2xl mx-auto"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Create Support Ticket
        </CardTitle>
        <CardDescription>
          {appInfo ? `Submit a support ticket for ${appInfo.name}` : "Fill out the form below to create a support ticket"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Guest Information Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Your Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guestName">
                  <User className="h-4 w-4 inline mr-1" />
                  Name
                </Label>
                <Input
                  id="guestName"
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone (Optional)
              </Label>
              <Input
                id="guestPhone"
                type="tel"
                placeholder="+62 812 3456 7890"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Ticket Details Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Ticket Details</h3>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - General inquiry</SelectItem>
                  <SelectItem value="NORMAL">Normal - Standard request</SelectItem>
                  <SelectItem value="HIGH">High - Urgent issue</SelectItem>
                  <SelectItem value="CRITICAL">Critical - System down</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                minLength={5}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {subject.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Please describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                maxLength={5000}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/5000 characters
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <AttachmentUpload
              maxFiles={3}
              value={attachments}
              onFilesChange={setAttachments}
              uploadEndpoint="ticket-attachment"
            />
            <p className="text-xs text-muted-foreground">
              Max 3 files, 5MB each. Images: JPG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX, XLS, XLSX
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EmbedWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "true";

  return (
    <div className={`
      min-h-screen bg-background p-4 md:p-8
      ${embed ? "p-0" : ""}
    `}>
      {children}
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <EmbedWrapper>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <TicketForm />
      </Suspense>
    </EmbedWrapper>
  );
}
