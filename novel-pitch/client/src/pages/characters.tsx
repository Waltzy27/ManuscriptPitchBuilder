import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { PageHeader, FieldGroup } from "../components/field-group";
import { ImportanceSlider } from "../components/importance-slider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import type { Character } from "@shared/schema";
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
import { cn } from "../lib/utils";

const ROLES = ["Protagonist", "Antagonist", "Deuteragonist", "Supporting Character", "Mentor / Guide", "Love Interest", "Foil", "Anti-Hero", "Narrator", "Other"];
const ARC_TYPES = ["Positive Change Arc (growth)", "Negative Change Arc (fall)", "Flat Arc (transforms others)", "Tragic Arc (fails to change)", "Corruption Arc", "Redemption Arc", "Disillusionment Arc"];
const ROLE_COLORS: Record<string, string> = {
  "Protagonist": "bg-primary/10 text-primary border-primary/25",
  "Antagonist": "bg-destructive/10 text-destructive border-destructive/25",
  "Deuteragonist": "bg-accent/15 text-accent border-accent/30",
  "Love Interest": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-300/30",
  "Mentor / Guide": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300/30",
};

function useCharacterSave(id: number, projectId: string) {
  const mutation = useMutation({
    mutationFn: async (data: Partial<Character>) => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}/characters/${id}`, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] }),
  });
  return mutation;
}

function CharacterCard({ char, projectId, onDelete }: { char: Character; projectId: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { mutate: save } = useCharacterSave(char.id, projectId);

  const F = (key: keyof Character) => ({
    value: (char as any)[key] ?? "",
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      save({ [key]: e.target.value }),
    defaultValue: undefined,
  });

  const selectF = (key: keyof Character) => ({
    value: (char as any)[key] ?? "",
    onValueChange: (v: string) => save({ [key]: v }),
  });

  const roleColor = ROLE_COLORS[char.role] || "bg-muted/50 text-muted-foreground border-border";

  return (
    <div className="border rounded-xl bg-card overflow-hidden" data-testid={`card-character-${char.id}`}>
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border", roleColor)}>
          {(char.name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-serif text-base">{char.name || "Unnamed Character"}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium shrink-0", roleColor)}>
              {char.role}
            </span>
          </div>
          {char.occupation && <p className="text-xs text-muted-foreground truncate mt-0.5">{char.occupation}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn("w-2 h-2 rounded-full imp-dot-" + (char.pitchImportance || 3))} title={`Pitch importance: ${char.pitchImportance}`} />
          <button
            data-testid={`button-delete-character-${char.id}`}
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-muted-foreground hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
          >
            <TrashIcon size={14} />
          </button>
          {expanded ? <ChevronDownIcon size={16} className="text-muted-foreground" /> : <ChevronRightIcon size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div className="px-5 pb-6 pt-2 border-t space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Character Name" required>
              <Input data-testid={`input-char-name-${char.id}`} key={`name-${char.id}`} defaultValue={char.name} onBlur={e => save({ name: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Role">
              <Select {...selectF("role")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Age">
              <Input data-testid={`input-char-age-${char.id}`} placeholder="Mid-30s / 34 / Ancient" key={`age-${char.id}`} defaultValue={char.age ?? ""} onBlur={e => save({ age: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Occupation / Role in World">
              <Input data-testid={`input-char-occ-${char.id}`} placeholder="Disgraced general / tavern keeper / queen" key={`occ-${char.id}`} defaultValue={char.occupation ?? ""} onBlur={e => save({ occupation: e.target.value })} />
            </FieldGroup>
          </div>

          <FieldGroup label="Physical Description">
            <Textarea rows={2} placeholder="Distinctive appearance details relevant to story or pitch…" key={`phys-${char.id}`} defaultValue={char.physicalDescription ?? ""} onBlur={e => save({ physicalDescription: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Personality Traits" hint="Comma-separated key traits">
            <Input placeholder="Stubborn, loyal to a fault, darkly humorous, deeply private" key={`traits-${char.id}`} defaultValue={char.personalityTraits ?? ""} onBlur={e => save({ personalityTraits: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Backstory" hint="Relevant history that shaped who they are. Focus on what the reader needs to understand their choices.">
            <Textarea rows={3} placeholder="The wound, the loss, the defining event in their past…" key={`back-${char.id}`} defaultValue={char.backstory ?? ""} onBlur={e => save({ backstory: e.target.value })} />
          </FieldGroup>

          <Separator />

          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Motivation" hint="What do they want more than anything?">
              <Textarea rows={3} placeholder="External want and deeper need…" key={`motiv-${char.id}`} defaultValue={char.motivation ?? ""} onBlur={e => save({ motivation: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Internal Conflict / Flaw" hint="The belief or wound that holds them back">
              <Textarea rows={3} placeholder="Their fatal flaw, false belief, or internal wound…" key={`intcon-${char.id}`} defaultValue={char.internalConflict ?? ""} onBlur={e => save({ internalConflict: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="External Goal" hint="The concrete, measurable objective driving the plot">
              <Textarea rows={3} placeholder="Stop the war / find the killer / reach the city before winter…" key={`extgoal-${char.id}`} defaultValue={char.externalGoal ?? ""} onBlur={e => save({ externalGoal: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Relationship to Protagonist">
              <Input placeholder="Childhood friend turned rival / mentor who betrayed her" key={`rel-${char.id}`} defaultValue={char.relationshipToProtagonist ?? ""} onBlur={e => save({ relationshipToProtagonist: e.target.value })} />
            </FieldGroup>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Arc Type">
              <Select {...selectF("arcType")}>
                <SelectTrigger><SelectValue placeholder="Select arc type" /></SelectTrigger>
                <SelectContent>{ARC_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Arc Start" hint="Who are they at the beginning?">
              <Textarea rows={2} placeholder="How they see themselves and the world when the story begins…" key={`arcstart-${char.id}`} defaultValue={char.characterArcStart ?? ""} onBlur={e => save({ characterArcStart: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Arc End" hint="Who have they become by the end?">
              <Textarea rows={2} placeholder="What has fundamentally changed — and what hasn't?" key={`arcend-${char.id}`} defaultValue={char.characterArcEnd ?? ""} onBlur={e => save({ characterArcEnd: e.target.value })} />
            </FieldGroup>
          </div>

          <FieldGroup label="Voice & Style Notes" hint="Any distinctive speech patterns, vocabulary, or perspective that defines their POV chapters or dialogue">
            <Textarea rows={2} placeholder="Speaks in clipped, military cadence. Thinks in metaphors from her seafaring childhood. Dry wit as a defense mechanism." key={`voice-${char.id}`} defaultValue={char.uniqueVoiceNotes ?? ""} onBlur={e => save({ uniqueVoiceNotes: e.target.value })} />
          </FieldGroup>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-sm font-medium">Pitch Importance</span>
            <ImportanceSlider
              value={(char.pitchImportance as number) ?? 3}
              onChange={v => save({ pitchImportance: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CharactersPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", id, "characters"],
    queryFn: async () => (await apiRequest("GET", `/api/projects/${id}/characters`)).json(),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("POST", `/api/projects/${id}/characters`, { name: "New Character", role });
      return res.json() as Promise<Character>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "characters"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (charId: number) => apiRequest("DELETE", `/api/projects/${id}/characters/${charId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "characters"] }),
  });

  const [addRole, setAddRole] = useState("Protagonist");
  const [dialogOpen, setDialogOpen] = useState(false);

  const grouped = {
    primary: characters.filter(c => ["Protagonist", "Antagonist", "Deuteragonist"].includes(c.role)),
    secondary: characters.filter(c => !["Protagonist", "Antagonist", "Deuteragonist"].includes(c.role)),
  };

  return (
    <div>
      <PageHeader
        title="Characters"
        badge="Step 2"
        description="Detail your protagonists, antagonists, and supporting cast."
      >
        <Button data-testid="button-add-character" onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <PlusIcon size={14} />
          Add Character
        </Button>
      </PageHeader>

      <div className="px-8 py-6 space-y-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : characters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <UsersIcon size={36} className="mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-muted-foreground font-medium">No characters yet</p>
            <p className="text-muted-foreground text-sm mt-1">Add your protagonist first, then build your cast.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}><PlusIcon size={14} className="mr-1.5" /> Add Character</Button>
          </div>
        ) : (
          <>
            {grouped.primary.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Primary Cast</h3>
                <div className="space-y-3 group">
                  {grouped.primary.map(c => (
                    <CharacterCard key={c.id} char={c} projectId={id} onDelete={() => deleteMutation.mutate(c.id)} />
                  ))}
                </div>
              </section>
            )}
            {grouped.secondary.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Secondary Cast</h3>
                <div className="space-y-3 group">
                  {grouped.secondary.map(c => (
                    <CharacterCard key={c.id} char={c} projectId={id} onDelete={() => deleteMutation.mutate(c.id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Character</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <FieldGroup label="Role">
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <Button
              className="w-full"
              onClick={() => { createMutation.mutate(addRole); setDialogOpen(false); }}
              disabled={createMutation.isPending}
            >
              Create Character
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
