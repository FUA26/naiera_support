/**
 * File Dropzone Component
 *
 * Drag-and-drop file upload zone using react-dropzone.
 * Shows visual feedback for drag states and file preview.
 */

"use client";

import { cn } from "@/lib/utils";
import { FileUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type ReactEvent = React.MouseEvent<HTMLDivElement>;

interface FileDropzoneProps {
  onFilesDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesDrop,
  accept,
  maxSize,
  maxFiles = 1,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;
      onFilesDrop(acceptedFiles);
    },
    [onFilesDrop, disabled]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    noClick: true, // We'll handle clicks manually
  });

  const handleClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!disabled) {
        e.preventDefault();
        // Small delay to ensure event propagates
        setTimeout(() => open(), 0);
      }
    },
    [disabled, open]
  );

  // Merge root props with our click handler
  const rootProps = getRootProps();
  const mergedProps = {
    ...rootProps,
    onClick: handleClick,
    onTouchEnd: handleClick,
  };

  return (
    <div
      {...mergedProps}
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors touch-manipulation select-none",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        !isDragActive &&
          !isDragReject &&
          "border-muted-foreground/25 hover:border-muted-foreground/50 active:scale-[0.98]",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
        className
      )}
    >
      <input {...getInputProps()} className="sr-only" />

      <div className="flex flex-col items-center gap-4 text-center pointer-events-none select-none">
        <div
          className={cn(
            "rounded-full p-4 transition-colors",
            isDragActive && !isDragReject && "bg-primary text-primary-foreground",
            isDragReject && "bg-destructive text-destructive-foreground",
            !isDragActive && !isDragReject && "bg-muted text-muted-foreground"
          )}
        >
          <HugeiconsIcon icon={FileUploadIcon} className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive
              ? isDragReject
                ? "File type not accepted"
                : "Drop the files here"
              : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground">or tap to browse</p>
        </div>

        {maxFiles === 1 && (
          <p className="text-xs text-muted-foreground">
            Maximum file size: {maxSize ? `${(maxSize / 1024 / 1024).toFixed(0)}MB` : "N/A"}
          </p>
        )}
      </div>
    </div>
  );
}
