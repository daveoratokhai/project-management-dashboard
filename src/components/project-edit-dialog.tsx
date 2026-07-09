"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TAGS,
  TAG_KEYS,
  type SerializedAssignee,
  type SerializedProject,
  type TagKey,
} from "@/lib/projects";

// The form lives in its own component inside DialogContent, which Radix
// unmounts on close. Each open therefore mounts a fresh form seeded from the
// latest project props, with no effect-based re-seeding.
function EditProjectForm({
  project,
  people,
  onOpenChange,
}: {
  project: SerializedProject;
  people: SerializedAssignee[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [repository, setRepository] = useState(project.repository);
  const [team, setTeam] = useState(project.team);
  const [tech, setTech] = useState(project.tech);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [tags, setTags] = useState<Set<TagKey>>(new Set(project.tags));
  const [assigneeIds, setAssigneeIds] = useState<Set<string>>(
    new Set(project.assignees.map((a) => a.id)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  async function save() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        repository,
        team,
        tech,
        startDate,
        endDate,
        tags: [...tags],
        assigneeIds: [...assigneeIds],
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save changes");
      return;
    }
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ep-name">Name</Label>
          <Input id="ep-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ep-desc">Description</Label>
          <Textarea
            id="ep-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ep-team">Team</Label>
            <Input id="ep-team" value={team} onChange={(e) => setTeam(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ep-tech">Tech</Label>
            <Input id="ep-tech" value={tech} onChange={(e) => setTech(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ep-repo">Repository</Label>
          <Input
            id="ep-repo"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ep-start">Start date</Label>
            <Input
              id="ep-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ep-end">End date</Label>
            <Input
              id="ep-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
              <p className="text-sm text-muted-foreground">No people yet.</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ProjectEditDialog({
  project,
  people,
  open,
  onOpenChange,
}: {
  project: SerializedProject;
  people: SerializedAssignee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>
        <EditProjectForm project={project} people={people} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
