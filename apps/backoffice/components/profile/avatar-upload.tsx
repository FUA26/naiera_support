/**
 * Avatar Upload Component
 *
 * Specialized file upload component for user avatars.
 * Shows preview before/after upload and integrates with user profile update.
 */

"use client";

import { FileUpload } from "@/components/file-upload/file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera01Icon, Cancel01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarSelect: (fileId: string, url: string) => void;
  onAvatarRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_ACCEPT: Record<string, string[]> = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
};

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarSelect,
  onAvatarRemove,
  disabled = false,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = (fileId: string, url: string) => {
    setPreviewUrl(url);
    onAvatarSelect(fileId, url);
    setIsUploading(false);
    setShowUpload(false);
  };

  const handleStartUpload = () => {
    if (disabled || isUploading) return;
    setIsUploading(true);
    setShowUpload(true);
  };

  const handleRemove = () => {
    if (disabled || isUploading) return;
    setPreviewUrl(null);
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
      <div className="flex-1 space-y-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs text-muted-foreground">
            Upload a new avatar. Max size: 5MB. Formats: JPG, PNG, WebP, GIF
          </p>
        </div>

        <div className="flex gap-2">
          {!showUpload ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartUpload}
                disabled={disabled || isUploading}
                className="touch-manipulation"
              >
                <HugeiconsIcon icon={Camera01Icon} className="h-4 w-4 mr-2" />
                Upload New
              </Button>

              {currentUrl && onAvatarRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="touch-manipulation"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUpload(false)}
              disabled={isUploading}
              className="touch-manipulation"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Upload Component */}
        {showUpload && (
          <div className="mt-4">
            <FileUpload
              category="AVATAR"
              maxSize={AVATAR_MAX_SIZE}
              accept={AVATAR_ACCEPT}
              onUploadComplete={(fileId, url, _file) => {
                console.log("[DEBUG] Upload successful:", { fileId, url });
                handleUploadComplete(fileId, url);
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
