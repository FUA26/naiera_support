"use client";

/**
 * Task Comments Panel Component
 *
 * Displays and manages comments for a task
 * Demonstrates nested resource management and activity feed pattern
 */

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import {
  addTaskComment,
  getTaskComments,
  getTaskActivity,
  type TaskComment,
  type TaskActivity,
} from "@/lib/services/task-service";

interface TaskCommentsPanelProps {
  taskId: string;
  taskTitle?: string;
}

export function TaskCommentsPanel({ taskId, taskTitle }: TaskCommentsPanelProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments and activities on mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [commentsData, activitiesData] = await Promise.all([
        getTaskComments(taskId),
        getTaskActivity(taskId),
      ]);
      setComments(commentsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to load comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || !session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const comment = await addTaskComment(taskId, newComment, session.user.id);
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      toast.success("Comment added");

      // Reload activities to include the new comment activity
      const activitiesData = await getTaskActivity(taskId);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getActionLabel = (action: string, changes?: Record<string, unknown> | null) => {
    switch (action) {
      case "CREATED":
        return "created this task";
      case "UPDATED":
        return "updated this task";
      case "STATUS_CHANGED":
        const from = changes?.from;
        const to = changes?.to;
        return `changed status from ${from} to ${to}`;
      case "ASSIGNED":
        const assignee = changes?.to;
        return `assigned to ${assignee}`;
      case "COMMENT_ADDED":
        return "added a comment";
      case "ATTACHMENT_ADDED":
        return "added an attachment";
      case "DELETED":
        return "deleted this task";
      default:
        return action.toLowerCase().replace(/_/g, " ");
    }
  };

  // Combine comments and activities into a single timeline
  const timeline = [
    ...comments.map((c) => ({ ...c, type: "comment" as const })),
    ...activities.map((a) => ({ ...a, type: "activity" as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Activity & Comments</h3>
        {taskTitle && <p className="text-sm text-muted-foreground">{taskTitle}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No activity yet. Be the first to add a comment!
          </div>
        ) : (
          timeline.map((item) => {
            if (item.type === "comment") {
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {(item as TaskComment).author.name?.charAt(0) ||
                        (item as TaskComment).author.email.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {(item as TaskComment).author.name || (item as TaskComment).author.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{(item as TaskComment).content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {(item as TaskActivity).user.name?.charAt(0) ||
                      (item as TaskActivity).user.email.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {(item as TaskActivity).user.name || (item as TaskActivity).user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getActionLabel((item as TaskActivity).action, (item as TaskActivity).changes)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitComment();
          }}
        >
          <Field>
            <FieldContent>
              <Textarea
                placeholder="Add a comment..."
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting || !session?.user}
              />
            </FieldContent>
            <FieldError />
          </Field>
          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || isSubmitting || !session?.user}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
