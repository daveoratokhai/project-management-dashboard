// Shared vocabulary, types, and helpers for projects.
// Pure constants/functions only; no Prisma import here, so this module is safe
// to use from both server and client components. DB access lives in the server
// pages and API routes.

// --- STATUS ---
export const STATUS_VARIANTS = ["active", "inProgress", "onHold"] as const;
export type StatusVariant = (typeof STATUS_VARIANTS)[number];

export const STATUS_LABELS: Record<StatusVariant, string> = {
  active: "Active",
  inProgress: "In Progress",
  onHold: "On Hold",
};

export type Tone = "green" | "yellow" | "red" | "gray";

export const STATUS_TONE: Record<StatusVariant, Tone> = {
  active: "green",
  inProgress: "yellow",
  onHold: "red",
};

export function isStatusVariant(v: unknown): v is StatusVariant {
  return typeof v === "string" && (STATUS_VARIANTS as readonly string[]).includes(v);
}

// --- TASK STATUS ---
export const TASK_STATUSES = ["Completed", "In Progress", "Pending"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TONE: Record<TaskStatus, Tone> = {
  Completed: "green",
  "In Progress": "yellow",
  Pending: "gray",
};

export function isTaskStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && (TASK_STATUSES as readonly string[]).includes(v);
}

// --- TAGS ---
export type TagKey =
  | "design"
  | "clientWork"
  | "engineering"
  | "docs"
  | "research"
  | "internal";

export const TAGS: Record<TagKey, { label: string; className: string }> = {
  design: { label: "Design", className: "bg-rose-400 text-white dark:bg-rose-500/90" },
  clientWork: { label: "Client Work", className: "bg-muted text-foreground" },
  engineering: { label: "Engineering", className: "bg-blue-500 text-white" },
  docs: { label: "Docs", className: "bg-muted text-foreground" },
  research: { label: "Research", className: "bg-violet-500 text-white" },
  internal: { label: "Internal", className: "bg-muted text-foreground" },
};

export const TAG_KEYS = Object.keys(TAGS) as TagKey[];

export function parseTags(json: string | null | undefined): TagKey[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((k): k is TagKey => k in TAGS) : [];
  } catch {
    return [];
  }
}

// --- ATTACHMENTS ---
export type AttachmentType = "pdf" | "figma" | "doc" | "image" | "other";

export function attachmentType(filename: string, mime = ""): AttachmentType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "fig") return "figma";
  if (["doc", "docx", "txt", "md", "rtf"].includes(ext)) return "doc";
  if (
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext) ||
    mime.startsWith("image/")
  )
    return "image";
  return "other";
}

// --- FORMATTERS ---
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "YYYY-MM-DD" -> "June 3, 2025". Empty -> "TBD". Parsed manually to avoid
// timezone shifts from Date parsing.
export function formatDate(iso: string): string {
  if (!iso) return "TBD";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIndex < 0 || monthIndex > 11) return iso;
  return `${MONTHS[monthIndex]} ${day}, ${year}`;
}

export function formatSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

// --- SERIALIZED SHAPES (server -> client props) ---
export type SerializedAssignee = {
  id: string;
  name: string;
  avatarUrl: string;
  fallback: string;
};

export type SerializedAttachment = {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
};

export type SerializedTask = {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  dueDate: string;
  order: number;
  // Where the task came from ("manual" | "whatsapp") and whether a human has
  // confirmed an AI-created task. Manual tasks are reviewed by default.
  source: string;
  reviewed: boolean;
};

export type SerializedProject = {
  id: string;
  name: string;
  repository: string;
  team: string;
  tech: string;
  status: StatusVariant;
  description: string;
  startDate: string;
  endDate: string;
  tags: TagKey[];
  assignees: SerializedAssignee[];
  attachments: SerializedAttachment[];
  tasks: SerializedTask[];
};
