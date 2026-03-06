"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MAX_ATTACHMENTS_PER_TICKET,
  isImageAttachment,
  formatFileSize,
  MAX_ATTACHMENT_SIZE,
} from "@/lib/file-upload/attachment-validation";

type AttachmentFile = {
  file: File;
  preview?: string;
  uploadedUrl?: string;
  uploadProgress?: number;
  error?: string;
};

type AttachmentUploadProps = {
  maxFiles?: number;
  onFilesChange: (files: AttachmentFile[]) => void;
  disabled?: boolean;
  value?: AttachmentFile[];
  uploadEndpoint?: "ticket-attachment" | "message-attachment";
};

export function AttachmentUpload({
  maxFiles = MAX_ATTACHMENTS_PER_TICKET,
  onFilesChange,
  disabled = false,
  value = [],
  uploadEndpoint = "ticket-attachment",
}: AttachmentUploadProps) {
  const [files, setFiles] = useState<AttachmentFile[]>(value);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Process files
    const newFiles: AttachmentFile[] = acceptedFiles.map((file) => {
      const preview = isImageAttachment(file.type)
        ? URL.createObjectURL(file)
        : undefined;

      return {
        file,
        preview,
        uploadProgress: 0,
      };
    });

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    // Upload files
    setUploading(true);
    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];
      if (!fileData) continue;

      const formData = new FormData();
      formData.append("files", fileData.file);

      try {
        const response = await fetch(`/api/upload/${uploadEndpoint}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();

        // Update file with uploaded data
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === files.length + i
              ? { ...f, uploadedUrl: result.files[0].url, uploadProgress: 100 }
              : f
          )
        );

        const updatedWithUpload = files.map((f, idx) =>
          idx === files.length + i
            ? { ...f, uploadedUrl: result.files[0].url, uploadProgress: 100 }
            : f
        );
        onFilesChange(updatedWithUpload);
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === files.length + i ? { ...f, error: error.message } : f
          )
        );
      }
    }
    setUploading(false);
  }, [files, maxFiles, onFilesChange, uploadEndpoint]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: MAX_ATTACHMENT_SIZE,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    disabled: disabled || files.length >= maxFiles || uploading,
  });

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((fileData, index) => (
            <AttachmentThumbnail
              key={index}
              file={fileData}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {/* Dropzone */}
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            (disabled || uploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop files here..."
              : `Drag & drop or click to attach (max ${maxFiles} files, 5MB each)`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images: JPG, PNG, GIF, WebP | Documents: PDF, DOC, DOCX, XLS, XLSX
          </p>
        </div>
      )}
    </div>
  );
}

function AttachmentThumbnail({
  file,
  onRemove,
}: {
  file: AttachmentFile;
  onRemove: () => void;
}) {
  const isImg = file.preview || isImageAttachment(file.file.type);

  return (
    <div className="relative group w-20 h-20 bg-muted rounded-lg overflow-hidden border">
      {file.preview ? (
        <img
          src={file.preview}
          alt={file.file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <File className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {file.uploadProgress !== undefined &&
        file.uploadProgress < 100 &&
        file.uploadProgress > 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      {file.error && (
        <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
          <span className="text-xs text-white p-1 text-center">
            Error
          </span>
        </div>
      )}
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-xs p-1 truncate">
        {file.file.name}
      </div>
    </div>
  );
}

export type { AttachmentFile };
