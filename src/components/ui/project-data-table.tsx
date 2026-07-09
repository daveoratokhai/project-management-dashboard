import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { STATUS_TONE, type StatusVariant } from "@/lib/projects";
import { ExternalLink } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface Contributor {
  src: string;
  alt: string;
  fallback: string;
}

export interface Project {
  id: string;
  name: string;
  repository: string;
  team: string;
  tech: string;
  createdAt: string;
  contributors: Contributor[];
  status: {
    text: string;
    variant: StatusVariant;
  };
}

// --- PROPS INTERFACE ---
interface ProjectDataTableProps {
  projects: Project[];
  visibleColumns: Set<keyof Project>;
  onRowClick?: (project: Project) => void;
  emptyMessage?: string;
}

// Animation variants for the staggered row fade/slide-in.
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeInOut",
    },
  }),
};

const tableHeaders: { key: keyof Project; label: string }[] = [
  { key: "name", label: "Project" },
  { key: "repository", label: "Repository" },
  { key: "team", label: "Team" },
  { key: "tech", label: "Tech" },
  { key: "createdAt", label: "Created At" },
  { key: "contributors", label: "Contributors" },
  { key: "status", label: "Status" },
];

// --- MAIN COMPONENT ---
export const ProjectDataTable = ({
  projects,
  visibleColumns,
  onRowClick,
  emptyMessage = "No results.",
}: ProjectDataTableProps) => {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      {/* Table renders its own overflow wrapper for horizontal scrolling. */}
      <Table>
        <TableHeader>
          <TableRow>
            {tableHeaders
              .filter((header) => visibleColumns.has(header.key))
              .map((header) => (
                <TableHead key={header.key}>{header.label}</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.tr
                key={project.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={rowVariants}
                onClick={onRowClick ? () => onRowClick(project) : undefined}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                  onRowClick && "cursor-pointer",
                )}
              >
                {visibleColumns.has("name") && (
                  <TableCell className="font-medium">{project.name}</TableCell>
                )}

                {visibleColumns.has("repository") && (
                  <TableCell>
                    {project.repository ? (
                      <a
                        href={project.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex w-fit max-w-full items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="max-w-xs truncate">
                          {project.repository.replace("https://", "")}
                        </span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}

                {visibleColumns.has("team") && <TableCell>{project.team}</TableCell>}
                {visibleColumns.has("tech") && <TableCell>{project.tech}</TableCell>}
                {visibleColumns.has("createdAt") && (
                  <TableCell>{project.createdAt}</TableCell>
                )}

                {visibleColumns.has("contributors") && (
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.contributors.map((contributor, idx) => (
                        <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={contributor.src} alt={contributor.alt} />
                          <AvatarFallback>{contributor.fallback}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                )}

                {visibleColumns.has("status") && (
                  <TableCell>
                    <StatusBadge
                      text={project.status.text}
                      tone={STATUS_TONE[project.status.variant] ?? "gray"}
                      showDot
                    />
                  </TableCell>
                )}
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.size}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
