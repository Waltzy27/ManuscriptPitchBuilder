import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import type { Project, SectionWeights } from "@shared/schema";
import { cn } from "../lib/utils";
import {
  BookOpenIcon, UsersIcon, MapPinIcon, WandIcon, UserIcon,
  SlidersIcon, FileTextIcon, HomeIcon, ChevronLeftIcon
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  alwaysShow?: boolean;
  weightsKey?: keyof SectionWeights;
}

const navItems: NavItem[] = [
  { href: "/story-identity", label: "Story Identity", icon: <BookOpenIcon size={16} />, alwaysShow: true },
  { href: "/characters", label: "Characters", icon: <UsersIcon size={16} />, weightsKey: "charactersActive" },
  { href: "/locations", label: "World & Locations", icon: <MapPinIcon size={16} />, weightsKey: "worldActive" },
  { href: "/mechanics", label: "Story Mechanics", icon: <WandIcon size={16} />, alwaysShow: true },
  { href: "/author-bio", label: "Author Bio", icon: <UserIcon size={16} />, weightsKey: "authorBioActive" },
  { href: "/weights", label: "Section Weights", icon: <SlidersIcon size={16} />, alwaysShow: true },
  { href: "/pitch-preview", label: "Pitch Preview", icon: <FileTextIcon size={16} />, alwaysShow: true },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string; page?: string }>();
  const id = params.id;
  const [location, setLocation] = useLocation();

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", id],
    queryFn: async () => (await apiRequest("GET", `/api/projects/${id}`)).json(),
    enabled: !!id,
  });

  const { data: weights } = useQuery<SectionWeights>({
    queryKey: ["/api/projects", id, "section-weights"],
    queryFn: async () => (await apiRequest("GET", `/api/projects/${id}/section-weights`)).json(),
    enabled: !!id,
  });

  // Current path relative to /project/:id
  const basePath = `/project/${id}`;
  // Get current page from URL like /#/project/1/characters
  const currentPage = location.startsWith(basePath)
    ? location.slice(basePath.length).replace(/^\//, "") || "story-identity"
    : "story-identity";

  const isActive = (href: string) => {
    const key = href.replace("/", "") || "story-identity";
    if (key === "story-identity") return currentPage === "story-identity" || currentPage === "";
    return currentPage === key;
  };

  const isNavItemVisible = (item: NavItem): boolean => {
    if (item.alwaysShow) return true;
    if (!item.weightsKey || !weights) return true;
    return !!(weights as any)[item.weightsKey];
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))]">
        {/* Project header */}
        <div className="px-4 py-4 border-b border-[hsl(var(--sidebar-border))]">
          <button
            data-testid="link-home"
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--sidebar-foreground)/0.6)] hover:text-[hsl(var(--sidebar-foreground))] mb-3 transition-colors"
          >
            <ChevronLeftIcon size={12} />
            All Projects
          </button>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-label="Manuscript" className="text-[hsl(var(--sidebar-primary))] shrink-0">
              <rect x="5" y="3" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M5 7h4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[hsl(var(--sidebar-foreground))] truncate leading-tight">
                {project?.title || "Loading…"}
              </p>
              {project?.subtitle && (
                <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.5)] truncate">{project.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(item => {
            if (!isNavItemVisible(item)) return null;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                data-testid={`nav-${item.href.replace("/","")}`}
                onClick={() => setLocation(`${basePath}${item.href === '/story-identity' ? '/story-identity' : item.href}`)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  active
                    ? "bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))] font-medium"
                    : "text-[hsl(var(--sidebar-foreground)/0.7)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                )}
              >
                <span className={active ? "text-[hsl(var(--sidebar-primary))]" : "opacity-70"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom hint */}
        <div className="px-4 py-3 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.4)] leading-relaxed">
            Changes save automatically as you type.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
