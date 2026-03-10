"use client";

/**
 * Kanban Board Component
 *
 * Main Kanban board with drag-and-drop functionality
 * Displays 5 columns based on TaskStatus enum
 * Supports dragging tasks between columns
 */

import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState, useMemo } from "react";
import type { Task, TaskStatus } from "@/lib/services/task-service";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { toast } from "sonner";

// All task statuses in order
const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "ARCHIVED"];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
  onRefresh?: () => void;
}

export function KanbanBoard({ tasks, onTaskUpdate, onTaskClick, onRefresh }: KanbanBoardProps) {
  // Group tasks by status using useMemo to update when props change
  const tasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
      ARCHIVED: [],
    };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    return grouped;
  }, [tasks]);

  // Track active drag
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start dragging
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column (status change)
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus;
      if (newStatus !== activeTask.status) {
        // Update via callback or API call
        if (onTaskUpdate) {
          onTaskUpdate(activeId, { status: newStatus });
        }
        await updateTaskStatus(activeId, newStatus, onRefresh);
      }
      return;
    }

    // Check if dropping on another task (move to that task's column)
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.status !== activeTask.status) {
      const newStatus = targetTask.status;
      if (onTaskUpdate) {
        onTaskUpdate(activeId, { status: newStatus });
      }
      await updateTaskStatus(activeId, newStatus, onRefresh);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, onRefresh?: () => void) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to update task");
        onRefresh?.();
      } else {
        toast.success(`Task moved to ${status.replace("_", " ")}`);
        onRefresh?.();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
      onRefresh?.();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
