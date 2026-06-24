import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import type { Project } from "@shared/schema";
import { PlusIcon, BookOpenIcon, TrashIcon, PenLineIcon, BookTextIcon } from "lucide-react";
import { formatWordCount } from "../lib/utils";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [open, setOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => (await apiRequest("GET", "/api/projects")).json(),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/projects", { title: newTitle, subtitle: newSubtitle || undefined });
      return res.json() as Promise<Project>;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setOpen(false);
      setNewTitle("");
      setNewSubtitle("");
      setLocation(`/project/${project.id}/story-identity`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects"] }),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Manuscript logo" className="text-primary">
              <rect x="5" y="3" width="18" height="24" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
              <path d="M5 7h4V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="5" fill="hsl(var(--accent))" stroke="none"/>
              <line x1="24" y1="21.5" x2="24" y2="26.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="21.5" y1="24" x2="26.5" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-none">Manuscript</h1>
              <p className="text-xs text-muted-foreground">Literary Agent Pitch Builder</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-project" className="gap-2">
                <PlusIcon size={16} />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Novel Title <span className="text-destructive">*</span></label>
                  <Input
                    data-testid="input-project-title"
                    placeholder="The Name of the Wind"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && newTitle.trim() && createMutation.mutate()}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subtitle <span className="text-muted-foreground text-xs">(optional)</span></label>
                  <Input
                    data-testid="input-project-subtitle"
                    placeholder="A working title or series name"
                    value={newSubtitle}
                    onChange={e => setNewSubtitle(e.target.value)}
                  />
                </div>
                <Button
                  data-testid="button-create-project"
                  onClick={() => createMutation.mutate()}
                  disabled={!newTitle.trim() || createMutation.isPending}
                  className="mt-1"
                >
                  {createMutation.isPending ? "Creating…" : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <BookTextIcon size={14} />
          For authors querying literary agents
        </div>
        <h2 className="font-serif text-4xl font-bold text-foreground mb-4 leading-tight">
          Build the Perfect<br />Literary Agent Pitch
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Organize every dimension of your novel — genre, characters, world-building, story mechanics, and more — into a structured, weighted pitch that emphasizes what matters most to your story.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            "Genre & Themes", "Character Arcs", "Narrative Scale",
            "World & Locations", "Magic / Tech / Politics", "Importance Weighting",
            "Query Letter Builder", "Comp Titles", "Author Bio"
          ].map(f => (
            <span key={f} className="bg-muted text-muted-foreground text-xs rounded-full px-3 py-1.5 border">{f}</span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <BookOpenIcon size={40} className="mx-auto text-muted-foreground mb-4 opacity-40" />
            <p className="text-muted-foreground font-medium">No projects yet</p>
            <p className="text-muted-foreground text-sm mt-1">Create your first novel pitch project to get started</p>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Projects</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <Card
                  key={project.id}
                  data-testid={`card-project-${project.id}`}
                  className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => setLocation(`/project/${project.id}/story-identity`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-snug font-serif line-clamp-2">
                        {project.title}
                      </CardTitle>
                      <button
                        data-testid={`button-delete-project-${project.id}`}
                        onClick={e => { e.stopPropagation(); if (confirm("Delete this project?")) deleteMutation.mutate(project.id); }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded shrink-0"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                    {project.subtitle && (
                      <CardDescription className="text-xs mt-0.5">{project.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <PenLineIcon size={12} />
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* New project card */}
              <Card
                className="cursor-pointer border-dashed hover:border-primary/40 hover:bg-muted/30 transition-all group"
                onClick={() => setOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px] gap-2 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <PlusIcon size={18} className="opacity-50 group-hover:opacity-80" />
                  </div>
                  <span className="text-sm">New Project</span>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
