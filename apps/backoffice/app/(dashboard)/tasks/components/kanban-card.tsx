"use client";

/**
 * Kanban Card Component
 *
 * Individual task card for the Kanban board
 * Shows title, priority badge, assignee avatar, due date
 * Click to edit (opens TaskDialog)
 * Drag handle for reordering
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import type { Task } from "@/lib/services/task-service";

interface KanbanCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

// Priority badge colors
const priorityColors: Record<string, string> = {
  LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
};

// Priority border colors
const priorityBorderColors: Record<string, string> = {
  LOW: "border-l-blue-500",
  MEDIUM: "border-l-yellow-500",
  HIGH: "border-l-orange-500",
  URGENT: "border-l-red-500",
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate &&
    dueDate < new Date() &&
    task.status !== "DONE" &&
    task.status !== "ARCHIVED";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <Card
        className={`
          p-3 cursor-pointer transition-all hover:shadow-md
          border-l-4 ${priorityBorderColors[task.priority] || "border-l-transparent"}
          ${isDragging ? "shadow-lg" : ""}
        `}
        onClick={() => onClick?.(task)}
      >
        {/* Drag handle */}
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm mb-2 pr-6 line-clamp-2">
          {task.title}
        </h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority badge */}
          <Badge
            variant="outline"
            className={`text-xs ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </Badge>

          {/* Due date */}
          {dueDate && (
            <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
              {dueDate.toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
              {task.assignee.name?.charAt(0) || task.assignee.email.charAt(0)}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {task.assignee.name || task.assignee.email}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs px-1.5 py-0"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Comment/attachment counts */}
        {(task.commentCount > 0 || task.attachmentCount > 0) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {task.commentCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {task.commentCount}
              </span>
            )}
            {task.attachmentCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {task.attachmentCount}
              </span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
