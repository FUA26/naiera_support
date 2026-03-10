"use client";

import { useState } from "react";
import { FileImage, File, Download, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isImageAttachment } from "@/lib/file-upload/attachment-validation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type Attachment = {
  url: string;
  name: string;
  type: string;
  size?: number;
};

type AttachmentPreviewProps = {
  attachments: Attachment[];
  className?: string;
};

export function AttachmentPreview({
  attachments,
  className,
}: AttachmentPreviewProps) {
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {attachments.map((attachment, index) => (
          <AttachmentItem
            key={index}
            attachment={attachment}
            onPreview={setPreviewImage}
          />
        ))}
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent
          className="max-w-4xl w-full p-6 bg-background"
          showCloseButton={true}
        >
          <div className="relative w-full h-full flex flex-col items-center">
            <img
              src={previewImage?.url}
              alt={previewImage?.name || "Preview"}
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              {previewImage?.name}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AttachmentItem({
  attachment,
  onPreview,
}: {
  attachment: Attachment;
  onPreview: (attachment: Attachment) => void;
}) {
  const isImage = isImageAttachment(attachment.type);

  const handleDownload = () => {
    window.open(attachment.url, "_blank");
  };

  if (isImage) {
    return (
      <div className="group relative w-24 h-24 bg-muted rounded-lg overflow-hidden border">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onPreview(attachment)}
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => onPreview(attachment)}
          >
            <ZoomIn className="h-4 w-4" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border group hover:bg-muted/70 transition-colors">
      <File className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={handleDownload}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
}
