"use client";

/**
 * System Settings Form Component
 *
 * Client component for managing system-wide settings with tabbed interface
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUpload } from "@/components/logo-upload";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { systemSettingsSchema, type SystemSettingsInput } from "@/lib/validations/system-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { FieldPath } from "react-hook-form";

interface Role {
  id: string;
  name: string;
}

interface SystemSettingsData {
  id: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRoleId: string;
  emailVerificationExpiryHours: number;
  minPasswordLength: number;
  requireStrongPassword: boolean;
  siteName: string;
  siteDescription: string | null;
  siteLogoId?: string | null;
  siteLogo?: { id: string; cdnUrl: string } | null;
  siteSubtitle?: string | null;
  citizenName?: string | null;
  heroBackgroundId?: string | null;
  heroBackground?: { id: string; cdnUrl: string } | null;
  contactAddress?: string | null;
  contactPhones?: string[] | null;
  contactEmails?: string[] | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialYouTube?: string | null;
  copyrightText?: string | null;
  versionNumber?: string | null;
  defaultUserRole: {
    id: string;
    name: string;
  };
}

export function SystemSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentSettings, setCurrentSettings] = useState<SystemSettingsData | null>(null);

  const form = useForm<SystemSettingsInput>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      allowRegistration: true,
      requireEmailVerification: true,
      defaultUserRoleId: "",
      emailVerificationExpiryHours: 24,
      minPasswordLength: 8,
      requireStrongPassword: false,
      siteName: "Naiera",
      siteDescription: "",
      siteLogoId: "",
      siteSubtitle: "",
      citizenName: "Warga",
      heroBackgroundId: "",
      contactAddress: "",
      contactPhones: [],
      contactEmails: [],
      socialFacebook: "",
      socialTwitter: "",
      socialInstagram: "",
      socialYouTube: "",
      copyrightText: "",
      versionNumber: "1.0.0",
    },
  });

  // useFieldArray has type inference issues with Zod schemas containing optional union types
  // The runtime behavior is correct - this is a TypeScript limitation
  const phonesArray = useFieldArray({
    control: form.control,
    // @ts-expect-error - contactPhones is an array field, TypeScript can't infer from Zod schema
    name: "contactPhones",
  });

  const emailsArray = useFieldArray({
    control: form.control,
    // @ts-expect-error - contactEmails is an array field, TypeScript can't infer from Zod schema
    name: "contactEmails",
  });

  // Fetch roles and settings on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch roles
        const rolesRes = await fetch("/api/roles");
        console.log("Roles response:", rolesRes.status);
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          console.log("Roles data:", rolesData);
          setRoles(rolesData.roles || []);
        }

        // Fetch settings
        const settingsRes = await fetch("/api/system-settings/full");
        console.log("Settings response:", settingsRes.status);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          console.log("Settings data:", data);
          setCurrentSettings(data.settings);

          // Populate form
          form.reset({
            allowRegistration: data.settings.allowRegistration,
            requireEmailVerification: data.settings.requireEmailVerification,
            defaultUserRoleId: data.settings.defaultUserRoleId,
            emailVerificationExpiryHours: data.settings.emailVerificationExpiryHours,
            minPasswordLength: data.settings.minPasswordLength,
            requireStrongPassword: data.settings.requireStrongPassword,
            siteName: data.settings.siteName,
            siteDescription: data.settings.siteDescription || "",
            siteLogoId: data.settings.siteLogoId || "",
            siteSubtitle: data.settings.siteSubtitle || "",
            citizenName: data.settings.citizenName || "Warga",
            heroBackgroundId: data.settings.heroBackgroundId || "",
            contactAddress: data.settings.contactAddress || "",
            contactPhones: data.settings.contactPhones || [],
            contactEmails: data.settings.contactEmails || [],
            socialFacebook: data.settings.socialFacebook || "",
            socialTwitter: data.settings.socialTwitter || "",
            socialInstagram: data.settings.socialInstagram || "",
            socialYouTube: data.settings.socialYouTube || "",
            copyrightText: data.settings.copyrightText || "",
            versionNumber: data.settings.versionNumber || "1.0.0",
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: SystemSettingsInput) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/system-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update settings");
      }

      toast.success("Settings updated successfully");

      // Update current settings - fetch fresh data with logo
      const settingsRes = await fetch("/api/system-settings/full");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setCurrentSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  const formState = form.formState;
  const isDirty = formState.isDirty;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="registration" orientation="vertical" className="flex flex-col md:flex-row gap-6 w-full items-start">
        <TabsList className="flex w-full md:w-56 shrink-0 flex-row md:flex-col justify-start bg-transparent p-0 gap-1 overflow-x-auto border-b md:border-none pb-4 md:pb-0 text-left">
          <TabsTrigger value="registration" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Registration
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Security
          </TabsTrigger>
          <TabsTrigger value="site" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Site Identity
          </TabsTrigger>
          <TabsTrigger value="contact" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Contact
          </TabsTrigger>
          <TabsTrigger value="social" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="footer" className="justify-start md:w-full px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold">
            Footer
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full min-w-0 max-w-4xl">

          {/* Registration Tab */}
          <TabsContent value="registration" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>Control user registration and email verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowRegistration">Allow Registration</Label>
                    <p className="text-xs text-muted-foreground">Enable public user registration</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={form.watch("allowRegistration")}
                    onCheckedChange={(checked) =>
                      form.setValue("allowRegistration", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-xs text-muted-foreground">
                      Users must verify their email before accessing
                    </p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={form.watch("requireEmailVerification")}
                    onCheckedChange={(checked) =>
                      form.setValue("requireEmailVerification", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="defaultUserRoleId">Default User Role</FieldLabel>
                  <FieldDescription>The role assigned to newly registered users</FieldDescription>
                  <FieldContent>
                    <select
                      id="defaultUserRoleId"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...form.register("defaultUserRoleId")}
                    >
                      <option value="">Select a role...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {roles.length === 0 && (
                      <p className="text-xs text-destructive mt-1">No roles available. Please create roles first.</p>
                    )}
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="emailVerificationExpiryHours">
                    Email Verification Expiry (Hours)
                  </FieldLabel>
                  <FieldDescription>
                    How long verification links remain valid (1-168 hours)
                  </FieldDescription>
                  <FieldContent>
                    <Input
                      id="emailVerificationExpiryHours"
                      type="number"
                      min="1"
                      max="168"
                      {...form.register("emailVerificationExpiryHours", { valueAsNumber: true })}
                    />
                  </FieldContent>
                  <FieldError />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure password policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="minPasswordLength">Minimum Password Length</FieldLabel>
                  <FieldDescription>Minimum number of characters required (6-128)</FieldDescription>
                  <FieldContent>
                    <Input
                      id="minPasswordLength"
                      type="number"
                      min="6"
                      max="128"
                      {...form.register("minPasswordLength", { valueAsNumber: true })}
                    />
                  </FieldContent>
                  <FieldError />
                </Field>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireStrongPassword">Require Strong Password</Label>
                    <p className="text-xs text-muted-foreground">Enforce complex password requirements</p>
                  </div>
                  <Switch
                    id="requireStrongPassword"
                    checked={form.watch("requireStrongPassword")}
                    onCheckedChange={(checked) =>
                      form.setValue("requireStrongPassword", checked, { shouldDirty: true })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Identity Tab */}
          <TabsContent value="site" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Site Identity</CardTitle>
                <CardDescription>Configure your site's basic information and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="siteName">Site Name</FieldLabel>
                  <FieldDescription>The name of your site</FieldDescription>
                  <FieldContent>
                    <Input id="siteName" {...form.register("siteName")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="siteSubtitle">Site Subtitle</FieldLabel>
                  <FieldDescription>A subtitle or tagline (optional)</FieldDescription>
                  <FieldContent>
                    <Input id="siteSubtitle" {...form.register("siteSubtitle")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="siteDescription">Site Description</FieldLabel>
                  <FieldDescription>A short description of your site (optional)</FieldDescription>
                  <FieldContent>
                    <Textarea id="siteDescription" rows={3} {...form.register("siteDescription")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="citizenName">Citizen Name</FieldLabel>
                  <FieldDescription>What to call citizens in greetings (e.g., "Warga Naiera")</FieldDescription>
                  <FieldContent>
                    <Input id="citizenName" {...form.register("citizenName")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <div>
                  <Label htmlFor="siteLogoId">Site Logo</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a logo for your site (optional)
                  </p>
                  <LogoUpload
                    value={form.watch("siteLogoId")}
                    logoUrl={currentSettings?.siteLogoId ? `/api/public/files/${currentSettings.siteLogoId}/serve` : null}
                    onChange={(value) => form.setValue("siteLogoId", value, { shouldDirty: true })}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="heroBackgroundId">Hero Background Image</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a background image for the landing page hero section (optional)
                  </p>
                  <LogoUpload
                    value={form.watch("heroBackgroundId")}
                    logoUrl={currentSettings?.heroBackgroundId ? `/api/public/files/${currentSettings.heroBackgroundId}/serve` : null}
                    onChange={(value) => form.setValue("heroBackgroundId", value, { shouldDirty: true })}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Contact details displayed on the landing page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="contactAddress">Address</FieldLabel>
                  <FieldDescription>Full physical address</FieldDescription>
                  <FieldContent>
                    <Textarea id="contactAddress" rows={2} {...form.register("contactAddress")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Phone Numbers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => phonesArray.append("")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Phone
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {phonesArray.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`contactPhones.${index}` as const)}
                          placeholder="+62 xxx xxx xxx"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => phonesArray.remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Email Addresses</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => emailsArray.append("")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Email
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {emailsArray.fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`contactEmails.${index}` as const)}
                          type="email"
                          placeholder="info@naiera.go.id"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => emailsArray.remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="socialFacebook">Facebook</FieldLabel>
                  <FieldDescription>Your Facebook page URL</FieldDescription>
                  <FieldContent>
                    <Input id="socialFacebook" placeholder="https://facebook.com/..." {...form.register("socialFacebook")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="socialTwitter">Twitter / X</FieldLabel>
                  <FieldDescription>Your Twitter profile URL</FieldDescription>
                  <FieldContent>
                    <Input id="socialTwitter" placeholder="https://twitter.com/..." {...form.register("socialTwitter")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="socialInstagram">Instagram</FieldLabel>
                  <FieldDescription>Your Instagram profile URL</FieldDescription>
                  <FieldContent>
                    <Input id="socialInstagram" placeholder="https://instagram.com/..." {...form.register("socialInstagram")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="socialYouTube">YouTube</FieldLabel>
                  <FieldDescription>Your YouTube channel URL</FieldDescription>
                  <FieldContent>
                    <Input id="socialYouTube" placeholder="https://youtube.com/..." {...form.register("socialYouTube")} />
                  </FieldContent>
                  <FieldError />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Customize the footer content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="copyrightText">Copyright Text</FieldLabel>
                  <FieldDescription>Custom copyright message (optional)</FieldDescription>
                  <FieldContent>
                    <Input id="copyrightText" placeholder="© 2026 Pemerintah Kabupaten Naiera" {...form.register("copyrightText")} />
                  </FieldContent>
                  <FieldError />
                </Field>

                <Field>
                  <FieldLabel htmlFor="versionNumber">Version Number</FieldLabel>
                  <FieldDescription>Application version (shown in footer)</FieldDescription>
                  <FieldContent>
                    <Input id="versionNumber" {...form.register("versionNumber")} />
                  </FieldContent>
                  <FieldError />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => {
            console.log("Button clicked!");
            console.log("Form errors:", form.formState.errors);
            console.log("Form values:", form.getValues());
            console.log("Is dirty:", form.formState.isDirty);
            console.log("Is valid:", form.formState.isValid);
          }}
        >
          Debug
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (currentSettings) {
              form.reset({
                allowRegistration: currentSettings.allowRegistration,
                requireEmailVerification: currentSettings.requireEmailVerification,
                defaultUserRoleId: currentSettings.defaultUserRoleId,
                emailVerificationExpiryHours: currentSettings.emailVerificationExpiryHours,
                minPasswordLength: currentSettings.minPasswordLength,
                requireStrongPassword: currentSettings.requireStrongPassword,
                siteName: currentSettings.siteName,
                siteDescription: currentSettings.siteDescription || "",
                siteLogoId: currentSettings.siteLogoId || "",
                siteSubtitle: currentSettings.siteSubtitle || "",
                citizenName: currentSettings.citizenName || "Warga",
                heroBackgroundId: currentSettings.heroBackgroundId || "",
                contactAddress: currentSettings.contactAddress || "",
                contactPhones: currentSettings.contactPhones || [],
                contactEmails: currentSettings.contactEmails || [],
                socialFacebook: currentSettings.socialFacebook || "",
                socialTwitter: currentSettings.socialTwitter || "",
                socialInstagram: currentSettings.socialInstagram || "",
                socialYouTube: currentSettings.socialYouTube || "",
                copyrightText: currentSettings.copyrightText || "",
                versionNumber: currentSettings.versionNumber || "1.0.0",
              });
            }
          }}
          disabled={!form.formState.isDirty}
        >
          Reset
        </Button>
      </div>

      {formState.errors.root && (
        <div className="text-sm text-destructive">{formState.errors.root.message}</div>
      )}
    </form>
  );
}
