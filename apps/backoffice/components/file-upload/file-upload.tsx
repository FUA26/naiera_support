/**
 * File Upload Component
 *
 * Complete file upload interface with dropzone, progress tracking, and error handling.
 */

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FileCategory } from "@prisma/client";
import { useCallback, useState } from "react";
import { FileDropzone } from "./file-dropzone";

interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  fileId?: string;
  url?: string;
}

interface FileUploadProps {
  onUploadComplete?: (fileId: string, url: string, file: File) => void;
  category?: FileCategory;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  category = "OTHER",
  accept,
  maxSize,
  maxFiles = 1,
  disabled = false,
  className,
}: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadProgress> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      try {
        const response = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        console.log("[DEBUG] Upload response data:", data);
        console.log("[DEBUG] data.file.serveUrl:", data.file.serveUrl);
        console.log("[DEBUG] data.file.cdnUrl:", data.file.cdnUrl);
        console.log("[DEBUG] Using URL:", data.file.serveUrl || data.file.cdnUrl);

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        return {
          file,
          progress: 100,
          status: "success",
          fileId: data.file.id,
          url: data.file.serveUrl || data.file.cdnUrl,
        };
      } catch (error: unknown) {
        return {
          file,
          progress: 0,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    [category]
  );

  const handleFilesDrop = useCallback(
    async (files: File[]) => {
      if (disabled || isUploading) return;

      // Initialize uploads as pending
      const newUploads: UploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: "pending" as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);
      setIsUploading(true);

      // Upload each file
      for (let i = 0; i < newUploads.length; i++) {
        const upload = newUploads[i];
        if (!upload) continue;

        // Update status to uploading
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, status: "uploading" as const, progress: 10 } : u
          )
        );

        // Simulate progress (since fetch doesn't support progress)
        const progressInterval = setInterval(() => {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file && u.progress < 90 ? { ...u, progress: u.progress + 10 } : u
            )
          );
        }, 100);

        // Upload file
        const result = await uploadFile(upload.file);
        clearInterval(progressInterval);

        // Update with result
        setUploads((prev) => prev.map((u) => (u.file === upload.file ? result : u)));

        // Call completion callback
        if (result.status === "success" && result.fileId && result.url) {
          onUploadComplete?.(result.fileId, result.url, result.file);
        }
      }

      setIsUploading(false);
    },
    [disabled, isUploading, uploadFile, onUploadComplete]
  );

  const removeUpload = useCallback((file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <FileDropzone
        onFilesDrop={handleFilesDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        disabled={disabled || isUploading}
      />

      {uploads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Uploads ({uploads.length})</p>
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={isUploading}>
              Clear all
            </Button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeUpload(upload.file)}
                      disabled={isUploading}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {(upload.file.size / 1024).toFixed(1)} KB
                  </p>

                  {upload.status === "uploading" && (
                    <Progress value={upload.progress} className="h-2" />
                  )}

                  {upload.status === "success" && (
                    <Alert className="py-2">
                      <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        File uploaded successfully
                      </AlertDescription>
                    </Alert>
                  )}

                  {upload.status === "error" && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">{upload.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
