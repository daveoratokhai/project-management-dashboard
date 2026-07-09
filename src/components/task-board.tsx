"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  formatDate,
  TASK_TONE,
  type SerializedTask,
  type TaskStatus,
  type Tone,
} from "@/lib/projects";

type Grouped = Record<TaskStatus, SerializedTask[]>;

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "Pending", label: "To Do" },
  { status: "In Progress", label: "In Progress" },
  { status: "Completed", label: "Done" },
];

const dotClass: Record<Tone, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  gray: "bg-muted-foreground",
};

function group(tasks: SerializedTask[]): Grouped {
  const g: Grouped = { Pending: [], "In Progress": [], Completed: [] };
  for (const t of tasks) (g[t.status] ?? g.Pending).push(t);
  return g;
}

function Card({ task }: { task: SerializedTask }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <span
          className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClass[TASK_TONE[task.status]])}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            {task.category && <span>{task.category}</span>}
            {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DraggableCard({ task }: { task: SerializedTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = { transform: CSS.Translate.toString(transform) };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <Card task={task} />
    </div>
  );
}

function Column({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: SerializedTask[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div className="flex w-full flex-col rounded-xl bg-muted/40 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", dotClass[TASK_TONE[status]])} />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
          isOver && "bg-foreground/5",
        )}
      >
        {tasks.map((t) => (
          <DraggableCard key={t.id} task={t} />
        ))}
        {tasks.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
        )}
      </div>
    </div>
  );
}

export function TaskBoard({ tasks }: { tasks: SerializedTask[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState<Grouped>(() => group(tasks));
  const [activeTask, setActiveTask] = useState<SerializedTask | null>(null);

  // Re-sync when the server data changes (e.g. after router.refresh()).
  // Adjusting state during render instead of in an effect avoids an extra
  // render pass; see react.dev "You Might Not Need an Effect".
  const [prevTasks, setPrevTasks] = useState(tasks);
  if (prevTasks !== tasks) {
    setPrevTasks(tasks);
    setColumns(group(tasks));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function findColumn(taskId: string): TaskStatus | null {
    for (const col of COLUMNS) {
      if (columns[col.status].some((t) => t.id === taskId)) return col.status;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    for (const col of COLUMNS) {
      const t = columns[col.status].find((x) => x.id === id);
      if (t) {
        setActiveTask(t);
        return;
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const from = findColumn(taskId);
    const to = over.id as TaskStatus;
    if (!from || from === to) return;

    // Optimistic move.
    setColumns((prev) => {
      const card = prev[from].find((t) => t.id === taskId);
      if (!card) return prev;
      return {
        ...prev,
        [from]: prev[from].filter((t) => t.id !== taskId),
        [to]: [{ ...card, status: to }, ...prev[to]],
      };
    });

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={columns[col.status]}
          />
        ))}
      </div>
      <DragOverlay>{activeTask ? <Card task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
