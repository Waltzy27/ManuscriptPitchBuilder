import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useDraftSave } from "../hooks/use-draft-save";
import { SaveControls } from "../components/save-status";
import { PageHeader, FieldGroup, SectionHeader } from "../components/field-group";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import type { AuthorBio } from "@shared/schema";

export default function AuthorBioPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qKey = ["/api/projects", id, "author-bio"];
  const url = `/api/projects/${id}/author-bio`;

  const { data: serverData, isLoading } = useQuery<AuthorBio>({
    queryKey: qKey,
    queryFn: async () => (await apiRequest("GET", url)).json(),
    enabled: !!id,
  });

  const { draft: data, setField, save, isDirty, status } = useDraftSave<AuthorBio>(
    serverData,
    url,
    [qKey],
  );

  const f = (key: keyof AuthorBio) => ({
    value: (data as any)?.[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(key, e.target.value),
  });

  if (isLoading) return (
    <div className="p-8 space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
  );

  return (
    <div>
      <PageHeader
        title="Author Bio"
        badge="Step 5"
        description="The professional and personal details that complete your query letter."
      >
        <SaveControls status={status} isDirty={isDirty} onSave={save} />
      </PageHeader>

      <div className="px-8 py-6 space-y-10 max-w-3xl">
        {/* Basic Info */}
        <section>
          <SectionHeader title="Author Information" description="Personal and professional details." />
          <div className="grid grid-cols-2 gap-5">
            <FieldGroup label="Full Name" required>
              <Input data-testid="input-author-name" placeholder="Your name as it should appear in the query" {...f("authorName")} />
            </FieldGroup>
            <FieldGroup label="Location">
              <Input data-testid="input-author-location" placeholder="Tampa, FL / Chicago, IL" {...f("location")} />
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* Writing Background */}
        <section>
          <SectionHeader title="Writing Background" description="Your history as a writer — experience, process, community." />
          <div className="space-y-5">
            <FieldGroup label="Writing Background" hint="Degrees, workshops, writing communities, years writing, etc. If this is your debut, it's fine to say so — focus on your commitment to craft.">
              <Textarea
                data-testid="textarea-writing-background"
                rows={4}
                placeholder="I hold a B.A. in Creative Writing from the University of Florida and have been writing speculative fiction for fifteen years. I participated in the Clarion West Writers Workshop in 2019 and have been a member of a critique group that has produced three published novelists."
                {...f("writingBackground")}
              />
            </FieldGroup>

            <FieldGroup label="Previous Publications" hint="Published short stories, essays, poems — journal names, anthologies, dates. Comma-separated or list format.">
              <Textarea
                data-testid="textarea-previous-publications"
                rows={3}
                placeholder="'The Glass Shore' in Beneath Ceaseless Skies (2022) / 'Cartography of Ghosts' in The Magazine of Fantasy & Science Fiction (2023)"
                {...f("previousPublications")}
              />
            </FieldGroup>

            <FieldGroup label="Relevant Credentials & Awards" hint="Writing awards, residencies, fellowships, or relevant professional credentials. Leave blank if not applicable.">
              <Textarea
                data-testid="textarea-relevant-credentials"
                rows={3}
                placeholder="Winner of the Writers of the Future Contest (Q1 2023) / Finalist, Nebula Award for Best Short Story 2023 / Bread Loaf Scholarship recipient"
                {...f("relevantCredentials")}
              />
            </FieldGroup>
          </div>
        </section>

        <Separator />

        {/* Personal Connection */}
        <section>
          <SectionHeader
            title="Personal Connection to the Work"
            description="Why you wrote this book — the emotional truth behind it. Agents often respond to this."
          />
          <FieldGroup
            label="Why This Story?"
            hint="This is optional but powerful. A genuine, specific connection between your life and the work can humanize your query. Keep it to 1–3 sentences in the final letter."
          >
            <Textarea
              data-testid="textarea-personal-connection"
              rows={5}
              placeholder="I began writing this novel after my mother was diagnosed with early-onset Alzheimer's. The book's central question — who are we when our memories are taken — came directly from watching her reconstruct a self from fragments, and from my own fear of becoming someone my children wouldn't recognize."
              {...f("personalConnection")}
            />
          </FieldGroup>
        </section>

        <Separator />

        {/* Platform */}
        <section>
          <SectionHeader
            title="Platform & Reach"
            description="Optional, but relevant for commercial fiction. Agents and publishers care about built-in audiences."
          />
          <FieldGroup
            label="Platform Notes"
            hint="Newsletter subscribers, social media following, blog audience, podcast, YouTube, podcast appearances, speaking engagements, etc."
          >
            <Textarea
              data-testid="textarea-platform-notes"
              rows={4}
              placeholder="I write a weekly newsletter on fantasy world-building with 8,000 subscribers. I have 14,000 Instagram followers and 22,000 TikTok followers in the BookTok community, where I create content about speculative fiction."
              {...f("platformNotes")}
            />
          </FieldGroup>
        </section>

        <Separator />

        {/* Agent Research */}
        <section>
          <SectionHeader
            title="Agent Research & Personalization"
            description="Private notes for tailoring your query to specific agents. These don't appear in the public pitch preview."
          />
          <FieldGroup
            label="Agent Research Notes"
            hint="Specific agents you're targeting, their wishlist items, books they've repped that align with yours, conference interactions, etc."
          >
            <Textarea
              data-testid="textarea-agent-research"
              rows={6}
              placeholder="Lauren Bieker (FinePrint): Actively seeking dark fantasy with diverse casts. Repped [Book X] which has similar political intrigue tone. Mentioned on MSWL that she wants 'fantasies where the magic system has personal cost.'&#10;&#10;Thao Le (Sandra Dijkstra): Loves character-driven fantasy. Repped [Author Y]. Her recent interview mentioned she wants more books about female friendship in fantasy."
              {...f("agentResearchNotes")}
            />
          </FieldGroup>
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
