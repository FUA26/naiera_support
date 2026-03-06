"use client";

import { FileImage, File, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isImageAttachment } from "@/lib/file-upload/attachment-validation";

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
  if (attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map((attachment, index) => (
        <AttachmentItem key={index} attachment={attachment} />
      ))}
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: Attachment }) {
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
          onClick={() => window.open(attachment.url, "_blank")}
        />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors">
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
