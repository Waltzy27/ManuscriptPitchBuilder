import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { PageHeader } from "../components/field-group";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import type { Project, StoryIdentity, Character, Location, StoryMechanics, AuthorBio, SectionWeights } from "@shared/schema";
import { CopyIcon, DownloadIcon, PrinterIcon, BookOpenIcon, AlertCircleIcon } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { formatWordCount, importanceLabel } from "../lib/utils";

function useProjectData(id: string) {
  const qOpts = { enabled: !!id };
  const af = async (url: string) => (await apiRequest("GET", url)).json();

  const project = useQuery<Project>({ queryKey: ["/api/projects", id], queryFn: () => af(`/api/projects/${id}`), ...qOpts });
  const si = useQuery<StoryIdentity>({ queryKey: ["/api/projects", id, "story-identity"], queryFn: () => af(`/api/projects/${id}/story-identity`), ...qOpts });
  const chars = useQuery<Character[]>({ queryKey: ["/api/projects", id, "characters"], queryFn: () => af(`/api/projects/${id}/characters`), ...qOpts });
  const locs = useQuery<Location[]>({ queryKey: ["/api/projects", id, "locations"], queryFn: () => af(`/api/projects/${id}/locations`), ...qOpts });
  const mech = useQuery<StoryMechanics>({ queryKey: ["/api/projects", id, "story-mechanics"], queryFn: () => af(`/api/projects/${id}/story-mechanics`), ...qOpts });
  const bio = useQuery<AuthorBio>({ queryKey: ["/api/projects", id, "author-bio"], queryFn: () => af(`/api/projects/${id}/author-bio`), ...qOpts });
  const weights = useQuery<SectionWeights>({ queryKey: ["/api/projects", id, "section-weights"], queryFn: () => af(`/api/projects/${id}/section-weights`), ...qOpts });

  return { project: project.data, si: si.data, chars: chars.data ?? [], locs: locs.data ?? [], mech: mech.data, bio: bio.data, weights: weights.data, isLoading: project.isLoading || si.isLoading };
}

function ImpBadge({ n }: { n: number }) {
  if (!n) return null;
  const colors = ["", "text-blue-500", "text-emerald-500", "text-amber-500", "text-orange-500", "text-red-500"];
  const dots = "●".repeat(n) + "○".repeat(5 - n);
  return <span className={`text-xs font-mono ${colors[n]}`} title={importanceLabel(n)}>{dots}</span>;
}

function PitchSection({ title, importance, children }: { title: string; importance?: number; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <h3 className="font-serif font-semibold text-base">{title}</h3>
        {importance && <ImpBadge n={importance} />}
      </div>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground shrink-0 w-36 text-xs pt-0.5">{label}</span>
      <span className="text-foreground flex-1">{String(value)}</span>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function CompletionBadge({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span>{filled}/{total} fields</span>
    </div>
  );
}

export default function PitchPreviewPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const { project, si, chars, locs, mech, bio, weights, isLoading } = useProjectData(id);

  // Compute completion
  const siFields = ["primaryGenre", "ageCategory", "storyScale", "narrativeDriver", "pov", "pacing",
    "primaryTheme", "wordCount", "oneLiner", "elevatorPitch", "stakes", "emotionalCore"];
  const siFilled = siFields.filter(k => !!(si as any)?.[k]).length;

  const buildPitchText = (): string => {
    const lines: string[] = [];
    const add = (s: string) => { if (s.trim()) lines.push(s); };

    add(`QUERY LETTER PITCH — ${project?.title || "Untitled"}`);
    add("═".repeat(60));
    add("");

    if (si?.oneLiner) {
      add("ONE-LINE PITCH");
      add(si.oneLiner);
      add("");
    }

    if (si?.elevatorPitch) {
      add("HOOK / QUERY LETTER PARAGRAPH");
      add(si.elevatorPitch);
      add("");
    }

    if (si?.stakes) {
      add("STAKES");
      add(si.stakes);
      add("");
    }

    if (si?.emotionalCore) {
      add("EMOTIONAL CORE");
      add(si.emotionalCore);
      add("");
    }

    // Story details
    const storyDetails: string[] = [];
    if (si?.primaryGenre) storyDetails.push(`Genre: ${si.primaryGenre}${si.subgenres ? ` / ${si.subgenres}` : ""}`);
    if (si?.ageCategory) storyDetails.push(`Category: ${si.ageCategory}`);
    if (si?.wordCount) storyDetails.push(`Word Count: ${si.wordCount.toLocaleString()}`);
    if (si?.seriesOrStandalone) storyDetails.push(`Format: ${si.seriesOrStandalone}${si.seriesName ? ` — ${si.seriesName}` : ""}`);
    if (si?.narrativeDriver) storyDetails.push(`Driven By: ${si.narrativeDriver}`);
    if (si?.pacing) storyDetails.push(`Pacing: ${si.pacing}`);
    if (storyDetails.length) {
      add("STORY DETAILS");
      storyDetails.forEach(add);
      add("");
    }

    // Primary character
    const protagonist = chars.find(c => c.role === "Protagonist");
    if (protagonist && weights?.charactersActive !== false) {
      add("PROTAGONIST");
      if (protagonist.name) add(`Name: ${protagonist.name}`);
      if (protagonist.occupation) add(`Role: ${protagonist.occupation}`);
      if (protagonist.motivation) { add(""); add("Motivation:"); add(protagonist.motivation); }
      if (protagonist.characterArcStart) { add(""); add("Arc Start:"); add(protagonist.characterArcStart); }
      if (protagonist.characterArcEnd) { add(""); add("Arc End:"); add(protagonist.characterArcEnd); }
      add("");
    }

    // Antagonist
    const antagonist = chars.find(c => c.role === "Antagonist");
    if (antagonist && weights?.charactersActive !== false) {
      add("ANTAGONIST");
      if (antagonist.name) add(`Name: ${antagonist.name}`);
      if (antagonist.motivation) { add("Motivation:"); add(antagonist.motivation); }
      add("");
    }

    // Comps
    if (weights?.compsActive !== false) {
      const comps = [
        si?.compTitle1 && `${si.compTitle1}${si.compTitle1Year ? ` (${si.compTitle1Year})` : ""}`,
        si?.compTitle2 && `${si.compTitle2}${si.compTitle2Year ? ` (${si.compTitle2Year})` : ""}`,
        si?.compTitle3 && `${si.compTitle3}${si.compTitle3Year ? ` (${si.compTitle3Year})` : ""}`,
      ].filter(Boolean);
      if (comps.length) {
        add("COMPARABLE TITLES");
        comps.forEach(c => add(`• ${c}`));
        add("");
      }
    }

    // Author bio
    if (bio?.authorName && weights?.authorBioActive !== false) {
      add("AUTHOR BIO");
      if (bio.authorName) add(`Author: ${bio.authorName}${bio.location ? `, ${bio.location}` : ""}`);
      if (bio.writingBackground) { add(""); add(bio.writingBackground); }
      if (bio.previousPublications) { add(""); add(`Publications: ${bio.previousPublications}`); }
      add("");
    }

    return lines.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildPitchText());
    toast({ title: "Copied to clipboard", description: "The full pitch text has been copied." });
  };

  const handleDownload = () => {
    const text = buildPitchText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title || "pitch"}-query.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return (
    <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
  );

  const noData = !si?.oneLiner && !si?.elevatorPitch && !si?.primaryGenre;

  return (
    <div>
      <PageHeader
        title="Pitch Preview"
        badge="Step 7"
        description="Your assembled pitch, weighted by section importance. Use this to draft your query letter."
      >
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy} data-testid="button-copy-pitch">
          <CopyIcon size={13} /> Copy Text
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload} data-testid="button-download-pitch">
          <DownloadIcon size={13} /> Download
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()} data-testid="button-print-pitch">
          <PrinterIcon size={13} /> Print
        </Button>
      </PageHeader>

      <div className="px-8 py-6 max-w-4xl space-y-6">
        {noData && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircleIcon size={16} className="shrink-0" />
            Start filling in the Story Identity section to see your pitch take shape here.
          </div>
        )}

        {/* Completion overview */}
        <div className="border rounded-xl p-5 bg-card space-y-4">
          <h3 className="font-semibold text-sm">Pitch Completion</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Story Identity</p>
              <CompletionBadge filled={siFilled} total={siFields.length} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Characters</p>
              <CompletionBadge filled={chars.length > 0 ? Math.min(chars.length, 3) : 0} total={3} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Author Bio</p>
              <CompletionBadge
                filled={[bio?.authorName, bio?.writingBackground].filter(Boolean).length}
                total={2}
              />
            </div>
          </div>
        </div>

        {/* ── QUERY LETTER SECTION ── */}
        <div className="border-2 border-primary/20 rounded-xl overflow-hidden bg-card print:border-0">
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/15 flex items-center gap-3">
            <BookOpenIcon size={18} className="text-primary" />
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">{project?.title || "Untitled Novel"}</h2>
              {project?.subtitle && <p className="text-xs text-muted-foreground">{project.subtitle}</p>}
            </div>
          </div>

          <div className="p-6 space-y-7">
            {/* One-liner */}
            {si?.oneLiner && (
              <PitchSection title="One-Line Pitch" importance={5}>
                <p className="text-base font-medium italic leading-relaxed text-foreground border-l-4 border-primary pl-4 py-1">
                  "{si.oneLiner}"
                </p>
              </PitchSection>
            )}

            {/* Hook paragraph */}
            {si?.elevatorPitch && (
              <PitchSection title="Hook / Query Letter Paragraph" importance={5}>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{si.elevatorPitch}</p>
                </div>
              </PitchSection>
            )}

            {/* Stakes + Emotional Core */}
            {(si?.stakes || si?.emotionalCore || si?.uniqueHook) && (
              <PitchSection title="Stakes, Core & Hook">
                <FieldBlock label="Stakes" value={si?.stakes} />
                <FieldBlock label="Emotional Core" value={si?.emotionalCore} />
                <FieldBlock label="Unique Hook / Differentiator" value={si?.uniqueHook} />
              </PitchSection>
            )}

            {/* Story Details */}
            {si?.primaryGenre && (
              <PitchSection title="Story Details">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Genre" value={si.primaryGenre + (si.subgenres ? ` / ${si.subgenres}` : "")} />
                  <Field label="Age Category" value={si.ageCategory} />
                  <Field label="Word Count" value={si.wordCount ? `${si.wordCount.toLocaleString()} words` : null} />
                  <Field label="Format" value={si.seriesOrStandalone + (si.seriesName ? ` — ${si.seriesName}` : "")} />
                  <Field label="Narrative Driver" value={si.narrativeDriver} />
                  <Field label="Story Scale" value={si.storyScale} />
                  <Field label="POV" value={si.pov} />
                  <Field label="Tense" value={si.tense} />
                  <Field label="Pacing" value={si.pacing} />
                  <Field label="Prose Style" value={si.proseStyle} />
                  <Field label="Tone" value={si.primaryTone + (si.secondaryTones ? `, ${si.secondaryTones}` : "")} />
                  <Field label="Structure" value={si.structureType} />
                  <Field label="Chapters" value={si.chapterCount ? `${si.chapterCount} chapters (${si.avgChapterLength})` : null} />
                </div>
                {si.targetAudience && (
                  <div className="mt-3 pt-3 border-t">
                    <Field label="Target Audience" value={si.targetAudience} />
                  </div>
                )}
              </PitchSection>
            )}

            {/* Themes */}
            {si?.primaryTheme && (si?.themeImportance || 0) >= 2 && (
              <PitchSection title="Themes" importance={si.themeImportance as number}>
                <Field label="Primary Theme" value={si.primaryTheme} />
                <Field label="Secondary Themes" value={si.secondaryThemes} />
              </PitchSection>
            )}

            {/* Characters */}
            {weights?.charactersActive !== false && chars.length > 0 && (
              <PitchSection title="Characters" importance={weights?.charactersImportance as number}>
                {chars
                  .filter(c => (c.pitchImportance as number) >= 2)
                  .sort((a, b) => (b.pitchImportance as number) - (a.pitchImportance as number))
                  .map(c => (
                    <div key={c.id} className="border rounded-lg p-4 space-y-2 bg-background/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold font-serif">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.role}</span>
                          <ImpBadge n={c.pitchImportance as number} />
                        </div>
                      </div>
                      {c.occupation && <p className="text-xs text-muted-foreground">{c.occupation}{c.age ? `, ${c.age}` : ""}</p>}
                      {c.motivation && (weights?.charactersImportance as number) >= 3 && (
                        <FieldBlock label="Motivation" value={c.motivation} />
                      )}
                      {c.internalConflict && (weights?.charactersImportance as number) >= 4 && (
                        <FieldBlock label="Internal Conflict / Flaw" value={c.internalConflict} />
                      )}
                      {(c.characterArcStart || c.characterArcEnd) && (weights?.charactersImportance as number) >= 3 && (
                        <div className="grid grid-cols-2 gap-3">
                          {c.characterArcStart && <FieldBlock label="Arc: Start" value={c.characterArcStart} />}
                          {c.characterArcEnd && <FieldBlock label="Arc: End" value={c.characterArcEnd} />}
                        </div>
                      )}
                    </div>
                  ))}
              </PitchSection>
            )}

            {/* World */}
            {weights?.worldActive !== false && locs.length > 0 && (
              <PitchSection title="World & Key Locations" importance={weights?.worldImportance as number}>
                {locs
                  .filter(l => (l.pitchImportance as number) >= 2)
                  .sort((a, b) => (b.pitchImportance as number) - (a.pitchImportance as number))
                  .map(l => (
                    <div key={l.id} className="border rounded-lg p-4 space-y-2 bg-background/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold font-serif">{l.name}</span>
                        <div className="flex items-center gap-2">
                          {l.locationType && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{l.locationType}</span>}
                          <ImpBadge n={l.pitchImportance as number} />
                        </div>
                      </div>
                      {(weights?.worldImportance as number) >= 3 && l.atmosphere && (
                        <p className="text-sm text-muted-foreground italic">{l.atmosphere}</p>
                      )}
                      {(weights?.worldImportance as number) >= 3 && l.roleInStory && (
                        <FieldBlock label="Role in Story" value={l.roleInStory} />
                      )}
                      {(weights?.worldImportance as number) >= 4 && l.physicalDescription && (
                        <FieldBlock label="Description" value={l.physicalDescription} />
                      )}
                    </div>
                  ))}
              </PitchSection>
            )}

            {/* Story Mechanics — show only active systems */}
            {mech && (() => {
              const activeSystems: React.ReactNode[] = [];

              if (mech.magicSystemActive && weights?.magicActive !== false && (weights?.magicImportance as number) >= 2) {
                activeSystems.push(
                  <div key="magic" className="border rounded-lg p-4 space-y-2 bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-serif">Magic System{mech.magicSystemName ? `: ${mech.magicSystemName}` : ""}</span>
                      <ImpBadge n={mech.magicPitchImportance as number} />
                    </div>
                    {mech.magicSystemType && <Field label="Type" value={mech.magicSystemType} />}
                    {(mech.magicPitchImportance as number) >= 3 && <FieldBlock label="How It Works" value={mech.magicRules} />}
                    {(mech.magicPitchImportance as number) >= 4 && <FieldBlock label="Costs & Limits" value={mech.magicCosts} />}
                  </div>
                );
              }

              if (mech.politicalSystemActive && weights?.politicsActive !== false && (weights?.politicsImportance as number) >= 2) {
                activeSystems.push(
                  <div key="politics" className="border rounded-lg p-4 space-y-2 bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-serif">Political System{mech.politicalSystemName ? `: ${mech.politicalSystemName}` : ""}</span>
                      <ImpBadge n={mech.politicalPitchImportance as number} />
                    </div>
                    {mech.politicalStructure && <Field label="Structure" value={mech.politicalStructure} />}
                    {(mech.politicalPitchImportance as number) >= 3 && <FieldBlock label="Core Conflict" value={mech.politicalConflict} />}
                  </div>
                );
              }

              if (mech.scienceTechActive && weights?.scienceActive !== false && (weights?.scienceImportance as number) >= 2) {
                activeSystems.push(
                  <div key="science" className="border rounded-lg p-4 space-y-2 bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-serif">Science & Technology</span>
                      <ImpBadge n={mech.techPitchImportance as number} />
                    </div>
                    {mech.techLevel && <Field label="Tech Level" value={mech.techLevel} />}
                    {(mech.techPitchImportance as number) >= 3 && <FieldBlock label="Key Technologies" value={mech.keyTechnologies} />}
                    {(mech.techPitchImportance as number) >= 4 && <FieldBlock label="Scientific Concepts" value={mech.scienceConcepts} />}
                  </div>
                );
              }

              if (mech.religionMythologyActive && weights?.religionActive !== false && (weights?.religionImportance as number) >= 2) {
                activeSystems.push(
                  <div key="religion" className="border rounded-lg p-4 space-y-2 bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold font-serif">Religion{mech.religionName ? `: ${mech.religionName}` : ""}</span>
                      <ImpBadge n={mech.religionPitchImportance as number} />
                    </div>
                    {(mech.religionPitchImportance as number) >= 3 && <FieldBlock label="Role in Story" value={mech.religionRoleInStory} />}
                  </div>
                );
              }

              if (activeSystems.length === 0) return null;
              return (
                <PitchSection title="Story Systems & Mechanics">
                  <div className="space-y-3">{activeSystems}</div>
                </PitchSection>
              );
            })()}

            {/* Comps */}
            {weights?.compsActive !== false && (si?.compTitle1 || si?.compTitle2 || si?.compTitle3) && (
              <PitchSection title="Comparable Titles" importance={weights?.compsImportance as number}>
                <div className="space-y-3">
                  {[
                    { title: si?.compTitle1, year: si?.compTitle1Year, reason: si?.compTitle1Reason },
                    { title: si?.compTitle2, year: si?.compTitle2Year, reason: si?.compTitle2Reason },
                    { title: si?.compTitle3, year: si?.compTitle3Year, reason: si?.compTitle3Reason },
                  ].filter(c => c.title).map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                      <div>
                        <p className="font-medium text-sm">{c.title}{c.year ? ` (${c.year})` : ""}</p>
                        {c.reason && <p className="text-xs text-muted-foreground mt-0.5">{c.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </PitchSection>
            )}

            {/* Author Bio */}
            {weights?.authorBioActive !== false && bio?.authorName && (
              <PitchSection title="Author Bio" importance={weights?.authorBioImportance as number}>
                <Field label="Author" value={bio.authorName + (bio.location ? `, ${bio.location}` : "")} />
                {bio.writingBackground && <FieldBlock label="Background" value={bio.writingBackground} />}
                {bio.previousPublications && <FieldBlock label="Publications" value={bio.previousPublications} />}
                {bio.relevantCredentials && <FieldBlock label="Credentials" value={bio.relevantCredentials} />}
                {(weights?.authorBioImportance as number) >= 4 && bio.personalConnection && (
                  <FieldBlock label="Personal Connection" value={bio.personalConnection} />
                )}
                {(weights?.authorBioImportance as number) >= 3 && bio.platformNotes && (
                  <FieldBlock label="Platform" value={bio.platformNotes} />
                )}
              </PitchSection>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="border rounded-xl p-5 bg-muted/20 space-y-3">
          <h3 className="font-semibold text-sm">Using This Pitch</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
            {[
              "Your query letter hook should be the Elevator Pitch paragraph — aim for 150–200 words.",
              "Lead with the hook, not metadata. Genre/word count can appear after.",
              "Include exactly 2–3 comps. Explain what specifically aligns, not just titles.",
              "Keep your Author Bio to 2–3 sentences unless you have major credentials.",
              "The stakes sentence should close your synopsis section — make it impossible to miss.",
              "Match the tone of your pitch to the tone of your book.",
              "Never include every plot twist — the goal is to get them to request pages.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary shrink-0">→</span>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
