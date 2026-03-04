/**
 * Simple Avatar Upload Component
 *
 * Direct file input for avatar upload with preview.
 * Uses proxy pattern: returns fileId and proxy URL (not direct MinIO URL).
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera01Icon, Cancel01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface SimpleAvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarSelect: (fileId: string, url: string, file: File) => void;
  onAvatarRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SimpleAvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarSelect,
  onAvatarRemove,
  disabled = false,
  className,
}: SimpleAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || disabled || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", "AVATAR");

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // IMPORTANT: Use proxy URL, not result.file.cdnUrl
      const fileId = result.file.id;
      const proxyUrl = `/api/files/${fileId}/serve`;

      // Call parent with fileId and proxy URL
      onAvatarSelect(fileId, proxyUrl, selectedFile);

      // Reset preview
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      // TODO: Show toast notification to user
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (disabled || isUploading) return;
    setPreviewUrl(null);
    setSelectedFile(null);
    onAvatarRemove?.();
  };

  const currentUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Avatar Preview */}
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentUrl || undefined} alt={userName || "User"} />
        <AvatarFallback>
          <HugeiconsIcon icon={UserIcon} className="h-10 w-10 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      {/* Actions */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-muted-foreground">
            Upload a photo to personalize your profile
          </p>
        </div>

        {!selectedFile ? (
          // File selection
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:mt-2 file:rounded-md"
              id="avatar-upload-debug"
            />
            <label
              htmlFor="avatar-upload-debug"
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                "hover:border-primary/50 active:scale-[0.98]",
                (disabled || isUploading) && "cursor-not-allowed opacity-50"
              )}
            >
              <HugeiconsIcon icon={Camera01Icon} className="h-4 w-4" />
              <span className="text-sm">Choose Photo</span>
            </label>

            {currentUrl && onAvatarRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        ) : (
          // Upload action
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">Selected:</span>
              <span className="text-muted-foreground">{selectedFile.name}</span>
              <span className="text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            <Button
              type="button"
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Avatar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
