import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useDraftSave } from "../hooks/use-draft-save";
import { SaveControls } from "../components/save-status";
import { PageHeader, FieldGroup, SectionHeader } from "../components/field-group";
import { ImportanceSlider } from "../components/importance-slider";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import type { StoryMechanics } from "@shared/schema";
import { WandIcon, ShieldIcon, AtomIcon, FlameIcon, CoinsIcon, UsersIcon, BookMarkedIcon, MessageSquareIcon } from "lucide-react";
import { cn } from "../lib/utils";

const MAGIC_TYPES = ["Hard Magic (strict, learnable rules)", "Soft Magic (mysterious, unknown limits)", "Semi-Hard (some rules, some mystery)", "Innate / Born-With Power", "Learned / Trained Power", "Divine / Granted Power", "Symbiotic / Borrowed Power", "Technology-as-Magic", "Other"];
const POLITICAL_STRUCTURES = ["Absolute Monarchy", "Constitutional Monarchy", "Republic / Democracy", "Theocracy", "Oligarchy / Plutocracy", "Feudal System", "Tribal / Clan Confederacy", "Empire", "Dictatorship / Authoritarianism", "Anarchy / No Central Power", "Dystopian State", "Colonial System", "Multi-Faction Power Vacuum", "Other"];
const TECH_LEVELS = ["Pre-Agricultural / Primitive", "Ancient / Classical (Bronze/Iron Age)", "Medieval / Pre-Industrial", "Renaissance / Early Industrial", "Industrial Revolution", "Early Modern (1900s-1950s)", "Contemporary", "Near-Future (20-50 years)", "Mid-Future (50-200 years)", "Far Future (200+ years)", "Post-Apocalyptic / Collapsed", "Post-Scarcity", "Mixed / Technologically Uneven", "Retro-Futuristic / Dieselpunk", "Other"];

interface ModuleToggleProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
  importance: number;
  onImportanceChange: (v: number) => void;
}

function MechanicModule({ label, icon, active, onToggle, children, importance, onImportanceChange }: ModuleToggleProps) {
  return (
    <div className={cn("border rounded-xl overflow-hidden transition-all", active ? "bg-card" : "bg-muted/20 opacity-75")}>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
            {icon}
          </span>
          <span className="font-semibold text-sm">{label}</span>
          {!active && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Disabled</span>}
        </div>
        <div className="flex items-center gap-4">
          {active && (
            <ImportanceSlider
              value={importance}
              onChange={onImportanceChange}
            />
          )}
          <Switch
            checked={active}
            onCheckedChange={onToggle}
            data-testid={`switch-${label.toLowerCase().replace(/ /g, "-")}`}
          />
        </div>
      </div>
      {active && (
        <div className="px-5 pb-6 pt-2 border-t space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function MechanicsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qKey = ["/api/projects", id, "story-mechanics"];
  const url = `/api/projects/${id}/story-mechanics`;

  const { data: serverData, isLoading } = useQuery<StoryMechanics>({
    queryKey: qKey,
    queryFn: async () => (await apiRequest("GET", url)).json(),
    enabled: !!id,
  });

  const { draft: data, setField, save, isDirty, status } = useDraftSave<StoryMechanics>(
    serverData,
    url,
    [qKey],
  );

  const f = (key: keyof StoryMechanics) => ({
    value: (data as any)?.[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(key, e.target.value),
  });

  const sel = (key: keyof StoryMechanics) => ({
    value: (data as any)?.[key] ?? "",
    onValueChange: (v: string) => setField(key, v),
  });

  const bool = (key: keyof StoryMechanics) => ({
    checked: !!(data as any)?.[key],
    onCheckedChange: (v: boolean) => setField(key, v),
  });

  const imp = (key: keyof StoryMechanics) => ({
    value: (data as any)?.[key] ?? 3,
    onChange: (v: number) => setField(key, v),
  });

  if (isLoading) return (
    <div className="p-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Story Mechanics"
        badge="Step 4"
        description="Enable the systems that drive your world. Disable sections that don't apply."
      >
        <SaveControls status={status} isDirty={isDirty} onSave={save} />
      </PageHeader>

      <div className="px-8 py-6 space-y-4 max-w-3xl">
        <p className="text-sm text-muted-foreground bg-muted/40 border rounded-lg px-4 py-3">
          Toggle each system on or off based on what's relevant to your story. Enabled sections appear in the Pitch Preview, weighted by their importance.
        </p>

        {/* ── Magic System ── */}
        <MechanicModule
          label="Magic System"
          icon={<WandIcon size={16} />}
          active={!!data?.magicSystemActive}
          onToggle={v => setField("magicSystemActive", v)}
          importance={imp("magicPitchImportance").value}
          onImportanceChange={imp("magicPitchImportance").onChange}
        >
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Magic System Name">
              <Input placeholder="The Allomantic Arts / Naming / The Song" {...f("magicSystemName")} />
            </FieldGroup>
            <FieldGroup label="System Type">
              <Select {...sel("magicSystemType")}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{MAGIC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup label="How It Works" hint="The core rules. What can it do? Who can use it? How is it accessed?">
            <Textarea rows={4} placeholder="Describe the core mechanic — the source, the activation, the range of effects…" {...f("magicRules")} />
          </FieldGroup>
          <FieldGroup label="Costs, Limits & Drawbacks" hint="What makes the magic dangerous, exhausting, or limited? Hard magic systems need clear rules.">
            <Textarea rows={3} placeholder="Every use burns years from the caster's life. The more powerful the working, the more years it costs. This creates impossible choices in climactic moments." {...f("magicCosts")} />
          </FieldGroup>
          <FieldGroup label="Origin & Lore" hint="Where did this magic come from? Is its origin known, disputed, or hidden?">
            <Textarea rows={3} placeholder="The magic was gifted by a dying god to her seven disciples. Each bloodline carries a fragment of that gift — but none carry the whole." {...f("magicOrigin")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Political System ── */}
        <MechanicModule
          label="Political System"
          icon={<ShieldIcon size={16} />}
          active={!!data?.politicalSystemActive}
          onToggle={v => setField("politicalSystemActive", v)}
          importance={imp("politicalPitchImportance").value}
          onImportanceChange={imp("politicalPitchImportance").onChange}
        >
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="System Name">
              <Input placeholder="The Conclave of Five / The Republic of Arden" {...f("politicalSystemName")} />
            </FieldGroup>
            <FieldGroup label="Structure Type">
              <Select {...sel("politicalStructure")}>
                <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{POLITICAL_STRUCTURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup label="Core Political Conflict" hint="The fundamental power struggle that drives or shapes the plot">
            <Textarea rows={3} placeholder="Three noble houses vie for regency over a child emperor. Each has the crown's ear. None can be trusted. And the child is smarter than any of them expect." {...f("politicalConflict")} />
          </FieldGroup>
          <FieldGroup label="Key Factions" hint="The major political, military, or ideological groups in conflict. Comma-separated or brief descriptions.">
            <Textarea rows={4} placeholder="The Crown Guard (loyal to the old order) / The Reform Council (merchant class seeking power) / The Unnamed (underground abolitionists) / The Church of the Eternal (controls information)" {...f("factions")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Science & Technology ── */}
        <MechanicModule
          label="Science & Technology"
          icon={<AtomIcon size={16} />}
          active={!!data?.scienceTechActive}
          onToggle={v => setField("scienceTechActive", v)}
          importance={imp("techPitchImportance").value}
          onImportanceChange={imp("techPitchImportance").onChange}
        >
          <FieldGroup label="Technology Level">
            <Select {...sel("techLevel")}>
              <SelectTrigger><SelectValue placeholder="Select tech level" /></SelectTrigger>
              <SelectContent>{TECH_LEVELS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Key Technologies" hint="The specific technologies, machines, or scientific principles that are central to the story. Comma-separated.">
            <Textarea rows={3} placeholder="Orbital drop ships, neural interface tattoos, memory-splicing tech, anti-gravity rails" {...f("keyTechnologies")} />
          </FieldGroup>
          <FieldGroup label="Scientific Concepts & Themes" hint="Real or speculative science concepts the story explores, challenges, or extrapolates from">
            <Textarea rows={4} placeholder="The story explores what happens when memory can be surgically altered — who owns a mind's history? Uses current neuroscience research on memory reconsolidation as its jumping-off point." {...f("scienceConcepts")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Religion & Mythology ── */}
        <MechanicModule
          label="Religion & Mythology"
          icon={<FlameIcon size={16} />}
          active={!!data?.religionMythologyActive}
          onToggle={v => setField("religionMythologyActive", v)}
          importance={imp("religionPitchImportance").value}
          onImportanceChange={imp("religionPitchImportance").onChange}
        >
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Religion / Belief System Name" className="col-span-2">
              <Input placeholder="The Church of the Veil / The Old Ways / The Cycle of Returning" {...f("religionName")} />
            </FieldGroup>
          </div>
          <FieldGroup label="Deities, Spirits, or Powers" hint="Who or what is worshipped, feared, or appeased? Are they real within the story?">
            <Textarea rows={3} placeholder="The Seven Aspects of the Unnamed God — each a philosophical concept made divine. Whether they're real is the novel's central question." {...f("deities")} />
          </FieldGroup>
          <FieldGroup label="Mythology & Sacred Narratives" hint="The creation stories, prophecies, and sacred texts that shape the world's understanding of itself">
            <Textarea rows={3} placeholder="The Founding Lie — the origin story that the entire empire was built on, which the protagonist discovers is a fabrication." {...f("mythologyNotes")} />
          </FieldGroup>
          <FieldGroup label="Role in the Story" hint="How does religion drive conflict, motivate characters, or shape the world?">
            <Textarea rows={3} placeholder="The inquisition is the story's primary antagonistic force. Religion as institutional power vs. genuine faith is a central tension." {...f("religionRoleInStory")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Economics ── */}
        <MechanicModule
          label="Economics & Resources"
          icon={<CoinsIcon size={16} />}
          active={!!data?.economicsActive}
          onToggle={v => setField("economicsActive", v)}
          importance={imp("economicsPitchImportance").value}
          onImportanceChange={imp("economicsPitchImportance").onChange}
        >
          <FieldGroup label="Economic System">
            <Input placeholder="Mercantilist trade empire / barter-and-favor / debt-based spellcasting economy" {...f("economicSystem")} />
          </FieldGroup>
          <FieldGroup label="Key Resources" hint="What are the things people kill, trade, or die for?">
            <Input placeholder="Aetheria crystals, fresh water rights, indentured mages, memory vials" {...f("keyResources")} />
          </FieldGroup>
          <FieldGroup label="Economic Conflict" hint="How does wealth distribution, scarcity, or trade drive your plot or world tensions?">
            <Textarea rows={3} placeholder="The aetheria trade monopoly controlled by three families has pushed 80% of the population into bond-labor. The protagonist's rebellion is, at its core, an economic one." {...f("economicConflict")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Social Structure ── */}
        <MechanicModule
          label="Social Structure"
          icon={<UsersIcon size={16} />}
          active={!!data?.socialStructureActive}
          onToggle={v => setField("socialStructureActive", v)}
          importance={imp("socialPitchImportance").value}
          onImportanceChange={imp("socialPitchImportance").onChange}
        >
          <FieldGroup label="Social Hierarchy">
            <Input placeholder="Caste system / class-based / species hierarchy / meritocracy (corrupted)" {...f("socialHierarchy")} />
          </FieldGroup>
          <FieldGroup label="Major Social Groups" hint="The communities, castes, species, or identity groups that shape society">
            <Textarea rows={3} placeholder="The Marked (those born with power) / The Unmarked (the majority) / The Liminal (those who changed) / The Exiles" {...f("majorGroups")} />
          </FieldGroup>
          <FieldGroup label="Discrimination, Injustice & Systemic Issues" hint="The prejudices, power imbalances, or injustices your story engages with">
            <Textarea rows={3} placeholder="The Marked are conscripted into military service at birth, legally classified as state property regardless of bloodline. This is presented as 'honor' by those who benefit from it." {...f("discriminationOrInjustice")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── History & Lore ── */}
        <MechanicModule
          label="History & Lore"
          icon={<BookMarkedIcon size={16} />}
          active={!!data?.historyLoreActive}
          onToggle={v => setField("historyLoreActive", v)}
          importance={imp("historyPitchImportance").value}
          onImportanceChange={imp("historyPitchImportance").onChange}
        >
          <FieldGroup label="Historical Context" hint="The period, era, or historical backdrop of the story — real or fictional">
            <Input placeholder="500 years after the Fall of the First Empire / an alternate 1920s Vienna" {...f("historicalContext")} />
          </FieldGroup>
          <FieldGroup label="Key Historical Events" hint="Events in the world's past that directly affect the present story">
            <Textarea rows={3} placeholder="The Sundering (the war that split the continent) / The Long Silence (when magic disappeared for a generation) / The Betrayal at Vaen's Gate" {...f("keyHistoricalEvents")} />
          </FieldGroup>
          <FieldGroup label="Lore Notes" hint="Myths, legends, prophecies, or in-world knowledge that shapes the story's texture">
            <Textarea rows={4} placeholder="The Prophecy of the Unbound is the most well-known lore element — but within the story, it functions as political propaganda rather than genuine divination. The protagonist's arc is about recognizing that." {...f("loreNotes")} />
          </FieldGroup>
        </MechanicModule>

        {/* ── Language ── */}
        <MechanicModule
          label="Language & Linguistics"
          icon={<MessageSquareIcon size={16} />}
          active={!!data?.languageActive}
          onToggle={v => setField("languageActive", v)}
          importance={imp("languagePitchImportance").value}
          onImportanceChange={imp("languagePitchImportance").onChange}
        >
          <FieldGroup label="Constructed Languages" hint="Names of any invented languages (conlangs) in your world. Comma-separated.">
            <Input placeholder="Vaerith (the high court tongue) / the Kheth trade pidgin" {...f("constructedLanguages")} />
          </FieldGroup>
          <FieldGroup label="Language Notes" hint="How language functions narratively — code-switching, dialect, linguistic power dynamics, etc.">
            <Textarea rows={4} placeholder="The story uses dialect deliberately: the protagonist code-switches between the gutter-speech of her childhood and the court-tongue she learned in service. This linguistic performance is central to her imposter syndrome arc." {...f("languageNotes")} />
          </FieldGroup>
        </MechanicModule>

        <div className="h-8" />
      </div>
    </div>
  );
}
