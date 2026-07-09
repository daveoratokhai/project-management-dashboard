"use client";

import { type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  List,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Tag as TagIcon,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ProjectEditDialog } from "@/components/project-edit-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { TaskBoard } from "@/components/task-board";
import { cn } from "@/lib/utils";
import {
  attachmentType,
  formatDate,
  formatSize,
  STATUS_LABELS,
  STATUS_TONE,
  STATUS_VARIANTS,
  TAGS,
  TASK_STATUSES,
  TASK_TONE,
  type AttachmentType,
  type SerializedAssignee,
  type SerializedProject,
  type SerializedTask,
  type StatusVariant,
  type TaskStatus,
  type Tone,
} from "@/lib/projects";

function AttachmentIcon({ type }: { type: AttachmentType }) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "figma":
      return <FileIcon className="h-5 w-5 text-violet-500" />;
    case "doc":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "image":
      return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    default:
      return <FileIcon className="h-5 w-5 text-muted-foreground" />;
  }
}

// A status pill that opens a dropdown to change the value.
function StatusDropdown<T extends string>({
  value,
  options,
  label,
  tone,
  showDot,
  onChange,
}: {
  value: T;
  options: readonly T[];
  label: (v: T) => string;
  tone: (v: T) => Tone;
  showDot?: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <StatusBadge
          text={label(value)}
          tone={tone(value)}
          showDot={showDot}
          className="cursor-pointer hover:opacity-80"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            {label(o)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Field({
  icon,
  label,
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {children}
    </div>
  );
}

export function ProjectDetailView({
  project,
  people,
}: {
  project: SerializedProject;
  people: SerializedAssignee[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SerializedTask | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [taskView, setTaskView] = useState<"list" | "board">("list");

  async function patchProject(body: Record<string, unknown>) {
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  async function deleteProject() {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/projects");
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/projects/${project.id}/attachments`, {
        method: "POST",
        body: form,
      }).catch(() => null);
      if (!res?.ok) failed.push(file.name);
    }
    setUploading(false);
    if (failed.length > 0) {
      setUploadError(`Could not upload: ${failed.join(", ")} (max 25 MB per file).`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function deleteAttachment(id: string) {
    await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function downloadAll() {
    for (const att of project.attachments) {
      const a = document.createElement("a");
      a.href = `/api/attachments/${att.id}/download`;
      a.download = att.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  async function patchTask(id: string, body: Record<string, unknown>) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {project.name}
        </h1>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-red-600 hover:text-red-600 dark:text-red-400"
            onClick={deleteProject}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Field icon={<MoreHorizontal className="h-4 w-4" />} label="Status">
          <StatusDropdown<StatusVariant>
            value={project.status}
            options={STATUS_VARIANTS}
            label={(v) => STATUS_LABELS[v]}
            tone={(v) => STATUS_TONE[v]}
            showDot
            onChange={(v) => patchProject({ status: v })}
          />
        </Field>

        <Field icon={<Users className="h-4 w-4" />} label="Assignee">
          {project.assignees.length > 0 ? (
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {project.assignees.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={a.avatarUrl} alt={a.name} />
                    <AvatarFallback>{a.fallback}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{a.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Date">
          <div className="flex items-center gap-3 text-sm font-medium text-foreground">
            <span>{formatDate(project.startDate)}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(project.endDate)}</span>
          </div>
        </Field>

        <Field icon={<TagIcon className="h-4 w-4" />} label="Tags">
          {project.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((key) => (
                <span
                  key={key}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    TAGS[key].className,
                  )}
                >
                  {TAGS[key].label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No tags</span>
          )}
        </Field>

        <Field
          icon={<FileText className="h-4 w-4" />}
          label="Description"
          className="md:col-span-2"
        >
          {project.description ? (
            <p className="text-sm leading-relaxed text-foreground/90">
              {project.description}
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">No description yet.</span>
          )}
        </Field>
      </div>

      {/* Attachments */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-foreground">Attachments</h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {project.attachments.length}
            </span>
          </div>
          {project.attachments.length > 0 && (
            <button
              type="button"
              onClick={downloadAll}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Download All
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.attachments.map((file) => (
            <div
              key={file.id}
              className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <a
                href={`/api/attachments/${file.id}/download`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <AttachmentIcon type={attachmentType(file.filename, file.mimeType)} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
              </a>
              <button
                type="button"
                aria-label="Delete attachment"
                onClick={() => deleteAttachment(file.id)}
                className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-red-600 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            aria-label="Upload attachment"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[72px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-xs">Uploading...</span>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-500">{uploadError}</p>}
      </section>

      {/* Task list */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Task List</h2>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md border border-border p-0.5">
              <button
                type="button"
                onClick={() => setTaskView("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  taskView === "list"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => setTaskView("board")}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  taskView === "board"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </button>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setEditingTask(null);
                setTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add task
            </Button>
          </div>
        </div>

        {taskView === "board" ? (
          <TaskBoard tasks={project.tasks} />
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.tasks.length > 0 ? (
              project.tasks.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{t.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.category || "-"}
                  </TableCell>
                  <TableCell>
                    <StatusDropdown<TaskStatus>
                      value={t.status}
                      options={TASK_STATUSES}
                      label={(v) => v}
                      tone={(v) => TASK_TONE[v]}
                      onChange={(v) => patchTask(t.id, { status: v })}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(t.dueDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label="Edit task"
                        onClick={() => {
                          setEditingTask(t);
                          setTaskDialogOpen(true);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete task"
                        onClick={() => deleteTask(t.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tasks yet. Add the first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </section>

      <ProjectEditDialog
        project={project}
        people={people}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <TaskDialog
        projectId={project.id}
        task={editingTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
      />
    </main>
  );
}
