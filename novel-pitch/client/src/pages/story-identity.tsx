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
import { Separator } from "../components/ui/separator";
import type { StoryIdentity } from "@shared/schema";

const GENRES = ["Fantasy", "Science Fiction", "Literary Fiction", "Thriller", "Mystery", "Horror", "Romance", "Historical Fiction", "Contemporary Fiction", "Young Adult", "Middle Grade", "Memoir/Narrative Nonfiction", "Upmarket Women's Fiction", "Magical Realism", "Speculative Fiction", "Dystopian", "Paranormal", "Urban Fantasy", "Epic Fantasy", "Dark Fantasy", "Space Opera", "Military Science Fiction", "Crime Fiction", "Psychological Thriller", "Cozy Mystery", "Western", "Action/Adventure", "Humor", "Satire", "Other"];
const AGE_CATEGORIES = ["Adult", "New Adult", "Young Adult", "Middle Grade", "Children's (8-12)", "Picture Book"];
const STORY_SCALES = ["Epic / Grand-Scale", "Intimate / Small-Scale", "Multi-Generational", "Mixed / Evolving"];
const NARRATIVE_DRIVERS = ["Character-Driven", "Plot-Driven", "World/Setting-Driven", "Concept/Idea-Driven", "Voice-Driven", "Mixed (Character & Plot)", "Mixed (World & Character)"];
const STRUCTURES = ["Three-Act Structure", "Five-Act Structure", "Non-Linear / Fragmented", "Episodic", "Frame Narrative", "Dual Timeline", "Multiple POV / Braided Narrative", "Circular Narrative", "In Medias Res", "Epistolary (Letters/Documents)", "Other"];
const POVS = ["First Person Singular", "First Person Plural", "Third Person Limited", "Third Person Omniscient", "Second Person", "Multiple POV (shifting chapters)", "Dual POV (two characters)", "Unreliable Narrator"];
const TENSES = ["Past Tense", "Present Tense", "Mixed Tenses"];
const TONES = ["Dark & Gritty", "Hopeful & Uplifting", "Melancholic / Bittersweet", "Comedic / Humorous", "Satirical", "Lyrical & Poetic", "Tense & Suspenseful", "Atmospheric & Immersive", "Philosophical", "Whimsical", "Cozy / Warm", "Disturbing / Unsettling", "Action-Packed", "Introspective", "Romantic", "Epic & Sweeping", "Slow Burn", "Frantic / Urgent", "Wry / Dry", "Gothic", "Nostalgic"];
const PACINGS = ["Very Slow Burn (literary focus)", "Slow (character/atmosphere heavy)", "Moderate (balanced pacing)", "Fast (plot-forward)", "Very Fast (thriller pace)", "Variable (shifts significantly)"];
const PROSE_STYLES = ["Sparse / Minimalist", "Commercial / Accessible", "Balanced / Mid-range", "Rich / Descriptive", "Lyrical / Literary", "Experimental / Unconventional"];
const CHAPTER_LENGTHS = ["Very Short (< 1,000 words)", "Short (1,000–2,500 words)", "Medium (2,500–4,000 words)", "Long (4,000–7,000 words)", "Very Long (7,000+ words)", "Variable Lengths"];
const SERIES_TYPES = ["Standalone", "Standalone with Series Potential", "Planned Series — Book 1", "Duology (2 books)", "Trilogy (3 books)", "Tetralogy (4 books)", "Open-Ended Series", "Companion Novel"];

export default function StoryIdentityPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qKey = ["/api/projects", id, "story-identity"];
  const url = `/api/projects/${id}/story-identity`;

  const { data: serverData, isLoading } = useQuery<StoryIdentity>({
    queryKey: qKey,
    queryFn: async () => (await apiRequest("GET", url)).json(),
    enabled: !!id,
  });

  const { draft: data, setField, save, isDirty, status } = useDraftSave<StoryIdentity>(
    serverData,
    url,
    [qKey],
  );

  const field = (key: keyof StoryIdentity) => ({
    value: (data as any)?.[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(key, e.target.value),
  });

  const selectField = (key: keyof StoryIdentity) => ({
    value: (data as any)?.[key] ?? "",
    onValueChange: (v: string) => setField(key, v),
  });

  const numField = (key: keyof StoryIdentity) => ({
    value: (data as any)?.[key]?.toString() ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setField(key, e.target.value ? parseInt(e.target.value) : null),
  });

  if (isLoading) return (
    <div className="p-8 space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Story Identity"
        badge="Step 1"
        description="Define the core genre, structure, tone, and pitch elements of your novel."
      >
        <SaveControls status={status} isDirty={isDirty} onSave={save} />
      </PageHeader>

      <div className="px-8 py-6 space-y-10 max-w-3xl">

        {/* ── Genre & Classification ── */}
        <section>
          <SectionHeader title="Genre & Classification" description="How your novel is positioned in the market." />
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Primary Genre" required>
              <Select {...selectField("primaryGenre")}>
                <SelectTrigger data-testid="select-primary-genre"><SelectValue placeholder="Select genre" /></SelectTrigger>
                <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Age Category" required>
              <Select {...selectField("ageCategory")}>
                <SelectTrigger data-testid="select-age-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{AGE_CATEGORIES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Subgenres / Blend" hint="e.g. Epic Fantasy, Secondary World, Grimdark" className="col-span-2">
              <Input data-testid="input-subgenres" placeholder="Fantasy / Political Intrigue / Dark Romance" {...field("subgenres")} />
            </FieldGroup>
            <FieldGroup label="Target Audience" hint="Who specifically reads this book?" className="col-span-2">
              <Input data-testid="input-target-audience" placeholder="Readers of Brandon Sanderson and Sarah J. Maas who want darker, grittier political intrigue" {...field("targetAudience")} />
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* ── Narrative Structure ── */}
        <section>
          <SectionHeader title="Narrative Structure" description="The architecture of how your story is told." />
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Story Scale">
              <Select {...selectField("storyScale")}>
                <SelectTrigger data-testid="select-story-scale"><SelectValue placeholder="Select scale" /></SelectTrigger>
                <SelectContent>{STORY_SCALES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Narrative Driver">
              <Select {...selectField("narrativeDriver")}>
                <SelectTrigger data-testid="select-narrative-driver"><SelectValue placeholder="What drives the story?" /></SelectTrigger>
                <SelectContent>{NARRATIVE_DRIVERS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Structure Type">
              <Select {...selectField("structureType")}>
                <SelectTrigger data-testid="select-structure-type"><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{STRUCTURES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Point of View (POV)">
              <Select {...selectField("pov")}>
                <SelectTrigger data-testid="select-pov"><SelectValue placeholder="Select POV" /></SelectTrigger>
                <SelectContent>{POVS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Tense">
              <Select {...selectField("tense")}>
                <SelectTrigger data-testid="select-tense"><SelectValue placeholder="Select tense" /></SelectTrigger>
                <SelectContent>{TENSES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* ── Tone, Pacing & Prose ── */}
        <section>
          <SectionHeader title="Tone, Pacing & Prose" description="The feel and voice of the reading experience." />
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Primary Tone">
              <Select {...selectField("primaryTone")}>
                <SelectTrigger data-testid="select-primary-tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Secondary Tones" hint="Comma-separated">
              <Input data-testid="input-secondary-tones" placeholder="Romantic, Philosophical, Wry" {...field("secondaryTones")} />
            </FieldGroup>
            <FieldGroup label="Pacing">
              <Select {...selectField("pacing")}>
                <SelectTrigger data-testid="select-pacing"><SelectValue placeholder="Select pacing" /></SelectTrigger>
                <SelectContent>{PACINGS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Prose Style">
              <Select {...selectField("proseStyle")}>
                <SelectTrigger data-testid="select-prose-style"><SelectValue placeholder="Select prose style" /></SelectTrigger>
                <SelectContent>{PROSE_STYLES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* ── Themes ── */}
        <section>
          <SectionHeader title="Themes" description="The ideas and questions your story explores." />
          <div className="space-y-5">
            <FieldGroup label="Primary Theme" hint="The central idea or question your novel wrestles with">
              <Input data-testid="input-primary-theme" placeholder="Identity and belonging in a world that rejects difference" {...field("primaryTheme")} />
            </FieldGroup>
            <FieldGroup label="Secondary Themes" hint="Comma-separated additional themes">
              <Input data-testid="input-secondary-themes" placeholder="Power and corruption, grief and memory, found family" {...field("secondaryThemes")} />
            </FieldGroup>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-medium text-foreground">Theme Centrality in Pitch</span>
              <ImportanceSlider
                value={(data?.themeImportance as number) ?? 3}
                onChange={v => setField("themeImportance", v)}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Length & Format ── */}
        <section>
          <SectionHeader title="Length & Format" description="Word count, chapter structure, and series information." />
          <div className="grid grid-cols-3 gap-5">
            <FieldGroup label="Word Count">
              <Input data-testid="input-word-count" type="number" placeholder="90000" {...numField("wordCount")} />
            </FieldGroup>
            <FieldGroup label="Estimated Pages">
              <Input data-testid="input-estimated-pages" type="number" placeholder="360" {...numField("estimatedPages")} />
            </FieldGroup>
            <FieldGroup label="Chapter Count">
              <Input data-testid="input-chapter-count" type="number" placeholder="38" {...numField("chapterCount")} />
            </FieldGroup>
            <FieldGroup label="Avg. Chapter Length">
              <Select {...selectField("avgChapterLength")}>
                <SelectTrigger data-testid="select-avg-chapter-length"><SelectValue placeholder="Chapter length" /></SelectTrigger>
                <SelectContent>{CHAPTER_LENGTHS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Standalone or Series" className="col-span-2">
              <Select {...selectField("seriesOrStandalone")}>
                <SelectTrigger data-testid="select-series-type"><SelectValue placeholder="Select series type" /></SelectTrigger>
                <SelectContent>{SERIES_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Series Name (if applicable)" className="col-span-3">
              <Input data-testid="input-series-name" placeholder="The Stormlight Archive" {...field("seriesName")} />
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* ── Pitch Core Elements ── */}
        <section>
          <SectionHeader
            title="Pitch Core Elements"
            description="The essential components agents look for. These directly feed into your Pitch Preview."
          />
          <div className="space-y-6">
            <FieldGroup label="One-Line Pitch" hint="A single sentence that encapsulates your entire novel. Think movie logline." required>
              <Input
                data-testid="input-one-liner"
                placeholder="A disgraced spy must recover a stolen bioweapon before her estranged daughter becomes its first casualty."
                {...field("oneLiner")}
              />
            </FieldGroup>

            <FieldGroup label="Protagonist Logline" hint='Formula: "A [descriptor] must [goal] before [deadline/stakes], or else [consequence]."'>
              <Input
                data-testid="input-protagonist-logline"
                placeholder="A war-weary empath must expose a conspiracy within the king's council before the peace summit, or see her homeland fall to civil war."
                {...field("protagonistLogline")}
              />
            </FieldGroup>

            <FieldGroup label="Elevator Pitch (Hook Paragraph)" hint="150–200 words. This becomes the core of your query letter. Start with the inciting incident. Include protagonist, conflict, and stakes." required>
              <Textarea
                data-testid="textarea-elevator-pitch"
                rows={6}
                placeholder="When orphaned cartographer Lyse discovers an ancient map that contradicts everything her empire believes about its own origins, she's forced to choose between burning it and saving her life — or following its path straight into the heart of a buried truth that could topple the throne.&#10;&#10;Racing across a continent with the king's most feared inquisitor on her heels and a ragged band of exiles at her side, Lyse learns the map is not merely paper. It's a key. And the lock it opens has been waiting five hundred years.&#10;&#10;But unlocking the past means confronting a living god who didn't die — who just stopped being human."
                {...field("elevatorPitch")}
              />
            </FieldGroup>

            <FieldGroup label="Inciting Incident" hint="The event that kicks the story into motion. The moment everything changes.">
              <Textarea data-testid="textarea-inciting-incident" rows={3} placeholder="Describe the moment that fundamentally disrupts your protagonist's normal world…" {...field("incitingIncident")} />
            </FieldGroup>

            <FieldGroup label="Central Conflict" hint="The core struggle — internal, external, or both — that drives the story.">
              <Textarea data-testid="textarea-central-conflict" rows={3} placeholder="What is the engine of your story? What must be resolved by the end?" {...field("centralConflict")} />
            </FieldGroup>

            <FieldGroup label="Stakes" hint='What happens if the protagonist fails? Be specific and emotionally charged. Agents love: "not just physical death, but also [emotional/relational/moral] consequence."' required>
              <Textarea data-testid="textarea-stakes" rows={3} placeholder="If she fails to expose the conspiracy, not only will the war resume — but she will have become the very monster she dedicated her life to hunting." {...field("stakes")} />
            </FieldGroup>

            <FieldGroup label="Emotional Core" hint='The "why should we care" factor. What emotional experience does the reader have?' required>
              <Input
                data-testid="input-emotional-core"
                placeholder="A story about what we owe the truth — and what it costs when we've built our identity on a lie."
                {...field("emotionalCore")}
              />
            </FieldGroup>

            <FieldGroup label="Unique Hook" hint="What makes this story unlike anything else on the shelf? Your differentiator.">
              <Textarea
                data-testid="textarea-unique-hook"
                rows={3}
                placeholder="Unlike most political fantasies, this one frames the entire conspiracy through the lens of a protagonist who can literally feel the emotions of everyone around her — including the man trying to kill her."
                {...field("uniqueHook")}
              />
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* ── Comparable Titles ── */}
        <section>
          <SectionHeader
            title="Comparable Titles (Comps)"
            description="Books published within the last 3–5 years that sit alongside yours on the shelf. Position, don't just compare."
          />
          <div className="space-y-6">
            {([1, 2, 3] as const).map(n => (
              <div key={n} className="border rounded-lg p-4 space-y-4 bg-card">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Comp Title {n}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FieldGroup label="Title & Author" className="col-span-2">
                    <Input
                      data-testid={`input-comp-title-${n}`}
                      placeholder="Babel by R.F. Kuang"
                      value={(data as any)?.[`compTitle${n}`] ?? ""}
                      onChange={e => setField(`compTitle${n}` as keyof StoryIdentity, e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Pub Year">
                    <Input
                      data-testid={`input-comp-year-${n}`}
                      type="number"
                      placeholder="2022"
                      value={(data as any)?.[`compTitle${n}Year`]?.toString() ?? ""}
                      onChange={e => setField(`compTitle${n}Year` as keyof StoryIdentity, e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Why this comp?" hint="What specifically aligns — tone, theme, structure, audience?" className="col-span-3">
                    <Input
                      data-testid={`input-comp-reason-${n}`}
                      placeholder="Similar dark academic atmosphere, morally complex protagonist, and exploration of colonialism through a fantasy lens"
                      value={(data as any)?.[`compTitle${n}Reason`] ?? ""}
                      onChange={e => setField(`compTitle${n}Reason` as keyof StoryIdentity, e.target.value)}
                    />
                  </FieldGroup>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}
