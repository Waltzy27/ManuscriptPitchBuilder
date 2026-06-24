import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useDraftSave } from "../hooks/use-draft-save";
import { SaveControls } from "../components/save-status";
import { PageHeader, SectionHeader } from "../components/field-group";
import { ImportanceSlider } from "../components/importance-slider";
import { Switch } from "../components/ui/switch";
import type { SectionWeights } from "@shared/schema";
import {
  BookOpenIcon, UsersIcon, MapPinIcon, WandIcon, UserIcon,
  ShieldIcon, AtomIcon, FlameIcon, CoinsIcon, SlidersIcon, BookMarkedIcon
} from "lucide-react";
import { cn } from "../lib/utils";

interface WeightRow {
  label: string;
  description: string;
  icon: React.ReactNode;
  activeKey: keyof SectionWeights;
  importanceKey: keyof SectionWeights;
  alwaysOn?: boolean;
}

const WEIGHT_ROWS: WeightRow[] = [
  {
    label: "Story Identity & Hook",
    description: "Genre, tone, scale, pitch loglines, stakes, unique hook. Core of every query letter.",
    icon: <BookOpenIcon size={16} />,
    activeKey: "storyIdentityActive",
    importanceKey: "storyIdentityImportance",
    alwaysOn: true,
  },
  {
    label: "Characters",
    description: "Protagonist arc, antagonist, supporting cast — how central are character details to your pitch?",
    icon: <UsersIcon size={16} />,
    activeKey: "charactersActive",
    importanceKey: "charactersImportance",
  },
  {
    label: "World & Locations",
    description: "Setting, atmosphere, key places. More important for world-driven or epic stories.",
    icon: <MapPinIcon size={16} />,
    activeKey: "worldActive",
    importanceKey: "worldImportance",
  },
  {
    label: "Magic System",
    description: "Relevant for fantasy. Disable for genres without a magic system.",
    icon: <WandIcon size={16} />,
    activeKey: "magicActive",
    importanceKey: "magicImportance",
  },
  {
    label: "Political System",
    description: "For stories where political intrigue, power, or governance drives the plot.",
    icon: <ShieldIcon size={16} />,
    activeKey: "politicsActive",
    importanceKey: "politicsImportance",
  },
  {
    label: "Science & Technology",
    description: "For sci-fi, near-future, or techno-thriller stories. Disable for pure fantasy.",
    icon: <AtomIcon size={16} />,
    activeKey: "scienceActive",
    importanceKey: "scienceImportance",
  },
  {
    label: "Religion & Mythology",
    description: "For stories where faith, gods, or mythology drives conflict or world-building.",
    icon: <FlameIcon size={16} />,
    activeKey: "religionActive",
    importanceKey: "religionImportance",
  },
  {
    label: "Economics & Resources",
    description: "For stories where wealth, trade, scarcity, or class drives the conflict.",
    icon: <CoinsIcon size={16} />,
    activeKey: "economicsActive",
    importanceKey: "economicsImportance",
  },
  {
    label: "Social Structure",
    description: "Caste systems, discrimination, social hierarchy — for socially-themed stories.",
    icon: <UsersIcon size={16} />,
    activeKey: "socialStructureActive",
    importanceKey: "socialStructureImportance",
  },
  {
    label: "History & Lore",
    description: "For stories where the past — real or invented — shapes present conflict.",
    icon: <BookMarkedIcon size={16} />,
    activeKey: "historyLoreActive",
    importanceKey: "historyLoreImportance",
  },
  {
    label: "Author Bio",
    description: "Your professional background and publishing credits. Always relevant.",
    icon: <UserIcon size={16} />,
    activeKey: "authorBioActive",
    importanceKey: "authorBioImportance",
  },
  {
    label: "Comp Titles",
    description: "Comparative titles for market positioning. Critical for any query letter.",
    icon: <SlidersIcon size={16} />,
    activeKey: "compsActive",
    importanceKey: "compsImportance",
  },
];

const IMPORTANCE_LABELS = ["", "Skim", "Minor", "Notable", "Important", "Critical"];

export default function SectionWeightsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qKey = ["/api/projects", id, "section-weights"];
  const url = `/api/projects/${id}/section-weights`;

  const { data: serverData, isLoading } = useQuery<SectionWeights>({
    queryKey: qKey,
    queryFn: async () => (await apiRequest("GET", url)).json(),
    enabled: !!id,
  });

  const { draft: data, setField, save, isDirty, status } = useDraftSave<SectionWeights>(
    serverData,
    url,
    [qKey],
  );

  if (isLoading) return (
    <div className="p-8 space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
  );

  return (
    <div>
      <PageHeader
        title="Section Weights"
        badge="Step 6"
        description="Control which sections appear in your pitch and how much weight each carries."
      >
        <SaveControls status={status} isDirty={isDirty} onSave={save} />
      </PageHeader>

      <div className="px-8 py-6 max-w-3xl">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>How this works:</strong> Active sections appear in the Pitch Preview. Importance (1–5) controls how much detail is surfaced for that section. Disabled sections are completely excluded from the pitch output.
          </p>
        </div>

        <div className="space-y-3">
          {WEIGHT_ROWS.map(row => {
            const active = row.alwaysOn ? true : !!(data as any)?.[row.activeKey];
            const importance: number = (data as any)?.[row.importanceKey] ?? 3;

            return (
              <div
                key={row.label}
                className={cn(
                  "border rounded-xl p-5 transition-all",
                  active ? "bg-card" : "bg-muted/20 opacity-60"
                )}
                data-testid={`weight-row-${row.label.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon + label */}
                  <div className={cn(
                    "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {row.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{row.label}</span>
                      {row.alwaysOn && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full">Always On</span>
                      )}
                      {!active && !row.alwaysOn && (
                        <span className="text-[10px] bg-muted text-muted-foreground border px-1.5 py-0.5 rounded-full">Disabled</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{row.description}</p>

                    {active && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Importance:</span>
                        <ImportanceSlider
                          value={importance}
                          onChange={v => setField(row.importanceKey, v)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  {!row.alwaysOn && (
                    <Switch
                      checked={active}
                      onCheckedChange={v => setField(row.activeKey, v)}
                      data-testid={`toggle-${row.activeKey}`}
                      className="mt-1 shrink-0"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
