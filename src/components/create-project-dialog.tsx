"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  STATUS_VARIANTS,
  STATUS_LABELS,
  TAGS,
  TAG_KEYS,
  type SerializedAssignee,
  type StatusVariant,
  type TagKey,
} from "@/lib/projects";

const EMPTY = {
  name: "",
  team: "",
  tech: "",
  status: "inProgress" as StatusVariant,
  repository: "",
  description: "",
  startDate: "",
  endDate: "",
};

export function CreateProjectDialog({ people }: { people: SerializedAssignee[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tags, setTags] = useState<Set<TagKey>>(new Set());
  const [assigneeIds, setAssigneeIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggle<T>(s: Set<T>, v: T): Set<T> {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  }

  function reset() {
    setForm(EMPTY);
    setTags(new Set());
    setAssigneeIds(new Set());
    setError("");
  }

  async function submit() {
    if (!form.name.trim() || !form.team.trim() || !form.tech.trim()) {
      setError("Name, Team, and Tech are required.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: [...tags], assigneeIds: [...assigneeIds] }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not create project");
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cp-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cp-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Project name"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-team">
                Team <span className="text-red-500">*</span>
              </Label>
              <Input id="cp-team" value={form.team} onChange={(e) => set("team", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-tech">
                Tech <span className="text-red-500">*</span>
              </Label>
              <Input id="cp-tech" value={form.tech} onChange={(e) => set("tech", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as StatusVariant)}>
              <SelectTrigger id="cp-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_VARIANTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="pt-1 text-xs text-muted-foreground">
            Everything below is optional; you can fill it in now or edit later.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="cp-repo">Repository</Label>
            <Input
              id="cp-repo"
              value={form.repository}
              onChange={(e) => set("repository", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-start">Start date</Label>
              <Input
                id="cp-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-end">End date</Label>
              <Input
                id="cp-end"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-desc">Description</Label>
            <Textarea
              id="cp-desc"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {TAG_KEYS.map((key) => {
                const on = tags.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTags(toggle(tags, key))}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-opacity",
                      on ? TAGS[key].className : "bg-muted text-muted-foreground opacity-60",
                    )}
                  >
                    {TAGS[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="flex flex-col gap-2">
              {people.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={assigneeIds.has(p.id)}
                    onChange={() => setAssigneeIds(toggle(assigneeIds, p.id))}
                    className="h-4 w-4 rounded border-input"
                  />
                  {p.name}
                </label>
              ))}
              {people.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No people yet. Assignees become available once teammates exist.
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
