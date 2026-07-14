"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLES, type Role } from "@/lib/auth/roles";

type Member = { id: string; email: string; name: string; role: string };

export function TeamTable({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function changeRole(id: string, role: Role) {
    setSavingId(id);
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setSavingId(null);
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-40">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => {
          const isSelf = m.id === currentUserId;
          return (
            <TableRow key={m.id}>
              <TableCell className="font-medium text-foreground">
                {m.email}
                {isSelf && (
                  <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {m.name || "-"}
              </TableCell>
              <TableCell>
                <Select
                  value={m.role}
                  onValueChange={(v) => changeRole(m.id, v as Role)}
                  disabled={isSelf || savingId === m.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          );
        })}
        {members.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
              No one has signed in yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
