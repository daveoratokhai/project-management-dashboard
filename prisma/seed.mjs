import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PEOPLE = [
  { name: "Achmad Hakim", avatarUrl: "https://i.pravatar.cc/150?u=achmad", fallback: "AH" },
  { name: "Samantha Emanuel", avatarUrl: "https://i.pravatar.cc/150?u=samantha", fallback: "SE" },
  { name: "David Chen", avatarUrl: "https://i.pravatar.cc/150?u=davidchen", fallback: "DC" },
  { name: "Maria Lopez", avatarUrl: "https://i.pravatar.cc/150?u=marialopez", fallback: "ML" },
  { name: "Jamal Wright", avatarUrl: "https://i.pravatar.cc/150?u=jamalwright", fallback: "JW" },
];

const DEFAULT_TASKS = [
  { title: "Schedule initial client meeting", category: "Discovery", status: "Completed", dueDate: "2025-06-03", order: 0 },
  { title: "Gather business goals and user needs", category: "Discovery", status: "Completed", dueDate: "2025-06-04", order: 1 },
  { title: "Review current website performance", category: "Discovery", status: "In Progress", dueDate: "2025-06-05", order: 2 },
  { title: "Define information architecture", category: "Design", status: "Pending", dueDate: "2025-06-10", order: 3 },
];

async function main() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log(`Skipping seed: ${count} projects already exist.`);
    return;
  }

  const people = [];
  for (const p of PEOPLE) {
    people.push(await prisma.person.create({ data: p }));
  }
  const byName = Object.fromEntries(people.map((p) => [p.name, p]));

  const projects = [
    {
      name: "Website Redesign for Client X",
      repository: "https://github.com/ruixenui/ruixen-buttons",
      team: "UI Guild",
      tech: "Next.js",
      status: "inProgress",
      description:
        "This task focuses on preparing a high-impact visual presentation that showcases the new website design concept for Client X. The goal is to clearly communicate the updated UI direction, design system, and user flow improvements to the client in a concise and engaging format.",
      startDate: "2025-06-03",
      endDate: "2025-06-28",
      tags: JSON.stringify(["design", "clientWork"]),
      assignees: ["Achmad Hakim", "Samantha Emanuel"],
      tasks: DEFAULT_TASKS,
    },
    {
      name: "RUIXEN Components",
      repository: "https://github.com/ruixenui/ruixen-buttons",
      team: "Component Devs",
      tech: "React",
      status: "inProgress",
      description:
        "Build and document a reusable component library used across internal products. Emphasis on accessibility, theming via design tokens, and a tight review process before each component ships.",
      startDate: "2025-05-22",
      endDate: "2025-07-15",
      tags: JSON.stringify(["engineering", "internal"]),
      assignees: ["David Chen", "Maria Lopez", "Jamal Wright"],
      tasks: DEFAULT_TASKS,
    },
    {
      name: "CV Jobs Platform",
      repository: "https://github.com/ruixenui/ruixen-buttons",
      team: "CV Core",
      tech: "Spring Boot",
      status: "active",
      description:
        "Backend services for a jobs marketplace: candidate profiles, employer postings, and a matching engine. Focus this cycle is on the search and ranking pipeline.",
      startDate: "2025-06-05",
      endDate: "2025-08-01",
      tags: JSON.stringify(["engineering"]),
      assignees: ["Jamal Wright"],
      tasks: DEFAULT_TASKS,
    },
    {
      name: "Job Portal Analytics",
      repository: "https://github.com/ruixenui/ruixen-buttons",
      team: "Data Squad",
      tech: "Python",
      status: "onHold",
      description:
        "Instrument the job portal and build dashboards for funnel conversion, time-to-hire, and source attribution. Paused pending a decision on the new infrastructure budget.",
      startDate: "2025-03-30",
      endDate: "",
      tags: JSON.stringify(["research", "internal"]),
      assignees: ["David Chen"],
      tasks: DEFAULT_TASKS,
    },
  ];

  for (const proj of projects) {
    const { assignees, tasks, ...data } = proj;
    await prisma.project.create({
      data: {
        ...data,
        assignees: { connect: assignees.map((name) => ({ id: byName[name].id })) },
        tasks: { create: tasks },
      },
    });
  }

  console.log(`Seeded ${people.length} people and ${projects.length} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
