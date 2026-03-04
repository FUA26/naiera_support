"use client";

/**
 * Task Dialog Component
 *
 * Dialog wrapper for task creation/editing form
 * Demonstrates form handling with validation and API integration
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  taskPriorityEnum,
  taskStatusEnum,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/validations/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { taskSchema } from "@/lib/validations/task";
import {
  createTask,
  getAssignableUsers,
  getTags,
  getTaskById,
  updateTask,
} from "@/lib/services/task-service";
import { Checkbox01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { XIcon } from "lucide-react";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  taskId?: string;
  onSuccess?: () => void;
}

export function TaskDialog({ open, onOpenChange, mode, taskId, onSuccess }: TaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string }>>(
    []
  );
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: "",
      tagIds: [],
    },
  });

  // Load users and tags when dialog opens
  useEffect(() => {
    if (open) {
      loadFormData();
      if (mode === "edit" && taskId) {
        loadTask();
      } else {
        form.reset();
        setSelectedTagIds([]);
      }
    }
  }, [open, mode, taskId]);

  async function loadFormData() {
    setIsLoadingData(true);
    try {
      const [usersData, tagsData] = await Promise.all([getAssignableUsers(), getTags()]);
      setUsers(usersData);
      setAvailableTags(tagsData);
    } catch (error) {
      console.error("Failed to load form data:", error);
      toast.error("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  }

  async function loadTask() {
    if (!taskId) return;

    setIsLoadingData(true);
    try {
      const task = await getTaskById(taskId);
      if (task) {
        form.reset({
          title: task.title,
          description: task.description || "",
          status: task.status as TaskStatus,
          priority: task.priority as TaskPriority,
          dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
          assigneeId: task.assignee?.id || "",
          tagIds: task.tags.map((t) => t.id),
        });
        setSelectedTagIds(task.tags.map((t) => t.id));
      } else {
        toast.error("Task not found");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to load task:", error);
      toast.error("Failed to load task data");
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleSubmit(data: CreateTaskInput) {
    setIsLoading(true);
    try {
      if (mode === "create") {
        await createTask({
          ...data,
          tagIds: selectedTagIds,
        });
        toast.success("Task created successfully");
      } else {
        await updateTask(taskId!, {
          ...data,
          tagIds: selectedTagIds,
        });
        toast.success("Task updated successfully");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Task" : "Edit Task"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new task to track work and assignments."
              : "Update task details, status, and assignments."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <form
            id="task-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 overflow-y-auto -mx-1 px-1"
          >
            <div className="space-y-4 py-4">
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    {...form.register("title")}
                    disabled={isLoading}
                  />
                </FieldContent>
                <FieldError errors={form.formState.errors.title} />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="description"
                    placeholder="Enter task description"
                    rows={3}
                    {...form.register("description")}
                    disabled={isLoading}
                  />
                </FieldContent>
                <FieldError errors={form.formState.errors.description} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <FieldContent>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("status", value as TaskStatus)
                      }
                      value={form.watch("status")}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError errors={form.formState.errors.status} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">Priority</FieldLabel>
                  <FieldContent>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("priority", value as TaskPriority)
                      }
                      value={form.watch("priority")}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError errors={form.formState.errors.priority} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
                  <FieldContent>
                    <Input
                      id="dueDate"
                      type="date"
                      {...form.register("dueDate")}
                      disabled={isLoading}
                    />
                  </FieldContent>
                  <FieldError errors={form.formState.errors.dueDate} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="assigneeId">Assignee</FieldLabel>
                  <FieldContent>
                    <Select
                      onValueChange={(value) => form.setValue("assigneeId", value)}
                      value={form.watch("assigneeId")}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError errors={form.formState.errors.assigneeId} />
                </Field>
              </div>

              <Field>
                <FieldLabel>Tags</FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {selectedTagIds.includes(tag.id) && (
                          <HugeiconsIcon icon={Checkbox01Icon} className="h-3 w-3 mr-1" />
                        )}
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </FieldContent>
              </Field>
            </div>
          </form>
        )}

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isLoadingData}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            disabled={isLoading || isLoadingData}
          >
            {isLoading ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
