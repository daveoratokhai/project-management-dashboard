import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/people - list everyone who can be assigned to projects.
export async function GET() {
  const people = await prisma.person.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(people);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

// POST /api/people - add a teammate.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const person = await prisma.person.create({
    data: {
      name,
      avatarUrl: typeof body?.avatarUrl === "string" ? body.avatarUrl : "",
      fallback: initials(name),
    },
  });

  return NextResponse.json(person, { status: 201 });
}
