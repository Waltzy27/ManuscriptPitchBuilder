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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import type { Location } from "@shared/schema";
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import { cn } from "../lib/utils";

const LOCATION_TYPES = ["City / Town", "Region / Province", "Nation / Kingdom", "Continent", "World / Planet", "Dimension / Realm / Plane", "Building / Structure", "Natural Landscape", "Underwater / Underground", "Sky / Aerial", "Celestial Body", "Ship / Vehicle", "Other"];

function LocationCard({ loc, projectId, onDelete }: { loc: Location; projectId: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const save = useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}/locations/${loc.id}`, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "locations"] }),
  });

  const S = (key: keyof Location) => ({
    value: (loc as any)[key] ?? "",
    onValueChange: (v: string) => save.mutate({ [key]: v }),
  });

  return (
    <div className="border rounded-xl bg-card overflow-hidden" data-testid={`card-location-${loc.id}`}>
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
          <MapPinIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold font-serif text-base">{loc.name}</span>
            {loc.locationType && (
              <span className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground shrink-0">{loc.locationType}</span>
            )}
          </div>
          {loc.atmosphere && <p className="text-xs text-muted-foreground truncate mt-0.5">{loc.atmosphere}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className={cn("w-2 h-2 rounded-full imp-dot-" + (loc.pitchImportance || 3))} />
          <button
            data-testid={`button-delete-location-${loc.id}`}
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-muted-foreground hover:text-destructive p-1 rounded"
          >
            <TrashIcon size={14} />
          </button>
          {expanded ? <ChevronDownIcon size={16} className="text-muted-foreground" /> : <ChevronRightIcon size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-6 pt-2 border-t space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Location Name" required>
              <Input key={`name-${loc.id}`} defaultValue={loc.name} onBlur={e => save.mutate({ name: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="Location Type">
              <Select {...S("locationType")}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{LOCATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup label="Physical Description" hint="What does it look, sound, smell like? Sensory details that ground the reader.">
            <Textarea rows={3} placeholder="The city of Veyra clings to the volcanic cliffside like a wound that never healed — obsidian towers rising from sulfurous mist, streets carved into the rock itself…" key={`phys-${loc.id}`} defaultValue={loc.physicalDescription ?? ""} onBlur={e => save.mutate({ physicalDescription: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Atmosphere & Feel" hint="The emotional texture of this place — what does it feel like to be here?">
            <Input placeholder="Oppressive, beautiful, ancient, electric, grief-soaked" key={`atm-${loc.id}`} defaultValue={loc.atmosphere ?? ""} onBlur={e => save.mutate({ atmosphere: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Cultural Notes" hint="The people, customs, language, and society of this place">
            <Textarea rows={3} placeholder="Governed by a merchant council, though the old blood families still hold the true power. The locals never speak of the Collapse. Outsiders learn quickly not to ask." key={`cult-${loc.id}`} defaultValue={loc.culturalNotes ?? ""} onBlur={e => save.mutate({ culturalNotes: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Historical Significance" hint="What happened here? Why does it matter to the story's past?">
            <Textarea rows={3} placeholder="This is where the first empire fell. The ruins beneath the city still hold the binding seals — and someone has been breaking them one by one." key={`hist-${loc.id}`} defaultValue={loc.historicalSignificance ?? ""} onBlur={e => save.mutate({ historicalSignificance: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Role in the Story" hint="Why does this location exist in your narrative? What does it represent or provide?" required>
            <Textarea rows={3} placeholder="The central hub of political power. Every faction converges here. It represents the corrupt old order the protagonist is trying to either save or dismantle." key={`role-${loc.id}`} defaultValue={loc.roleInStory ?? ""} onBlur={e => save.mutate({ roleInStory: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Unique Features" hint="Comma-separated — what makes this place unlike any other in your world?">
            <Input placeholder="Tidal bridges, floating market districts, the Oracle's Well that shows only the past" key={`feat-${loc.id}`} defaultValue={loc.uniqueFeatures ?? ""} onBlur={e => save.mutate({ uniqueFeatures: e.target.value })} />
          </FieldGroup>

          <FieldGroup label="Real-World Inspiration" hint="Optional — what real place, city, or landscape inspired this?">
            <Input placeholder="Istanbul / Venice / the Amalfi coast" key={`inspr-${loc.id}`} defaultValue={loc.realWorldInspiration ?? ""} onBlur={e => save.mutate({ realWorldInspiration: e.target.value })} />
          </FieldGroup>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-sm font-medium">Pitch Importance</span>
            <ImportanceSlider
              value={(loc.pitchImportance as number) ?? 3}
              onChange={v => save.mutate({ pitchImportance: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function LocationsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/projects", id, "locations"],
    queryFn: async () => (await apiRequest("GET", `/api/projects/${id}/locations`)).json(),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${id}/locations`, { name: newName || "New Location" });
      return res.json() as Promise<Location>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "locations"] });
      setDialogOpen(false);
      setNewName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (locId: number) => apiRequest("DELETE", `/api/projects/${id}/locations/${locId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/projects", id, "locations"] }),
  });

  return (
    <div>
      <PageHeader
        title="World & Locations"
        badge="Step 3"
        description="Key places, regions, and settings that shape your story's world."
      >
        <Button data-testid="button-add-location" onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <PlusIcon size={14} />
          Add Location
        </Button>
      </PageHeader>

      <div className="px-8 py-6 space-y-4 max-w-3xl">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : locations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <MapPinIcon size={36} className="mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-muted-foreground font-medium">No locations yet</p>
            <p className="text-muted-foreground text-sm mt-1">Add key settings, cities, or regions that shape your world.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}><PlusIcon size={14} className="mr-1.5" /> Add Location</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map(loc => (
              <LocationCard key={loc.id} loc={loc} projectId={id} onDelete={() => deleteMutation.mutate(loc.id)} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Location</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <FieldGroup label="Location Name">
              <Input
                placeholder="The Sunken City of Aeveth"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createMutation.mutate()}
                autoFocus
              />
            </FieldGroup>
            <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              Create Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
