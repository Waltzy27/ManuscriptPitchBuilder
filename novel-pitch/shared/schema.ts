import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ───────────────────────────────────────────────
// Projects — top-level container for a novel pitch
// ───────────────────────────────────────────────
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ───────────────────────────────────────────────
// Story Identity — genre, structure, tone, scale
// ───────────────────────────────────────────────
export const storyIdentity = sqliteTable("story_identity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  // Genre & classification
  primaryGenre: text("primary_genre"),       // e.g. "Fantasy", "Thriller", "Literary Fiction"
  subgenres: text("subgenres"),              // JSON array of strings
  ageCategory: text("age_category"),         // "Adult" | "Young Adult" | "Middle Grade" | "Children's"
  targetAudience: text("target_audience"),   // brief descriptor

  // Narrative scope and structure
  storyScale: text("story_scale"),           // "Epic/Grand" | "Intimate/Small" | "Mixed"
  narrativeDriver: text("narrative_driver"), // "Character-Driven" | "Plot-Driven" | "World-Driven" | "Concept-Driven" | "Mixed"
  structureType: text("structure_type"),     // "Three-Act" | "Five-Act" | "Non-Linear" | "Episodic" | "Frame Narrative" | "Dual Timeline" | "Other"
  pov: text("pov"),                          // "First Person" | "Third Person Limited" | "Third Person Omniscient" | "Second Person" | "Multiple POV"
  tense: text("tense"),                      // "Past" | "Present" | "Mixed"

  // Tone and feel
  primaryTone: text("primary_tone"),         // e.g. "Dark & Gritty" | "Hopeful" | "Comedic" | "Melancholic"
  secondaryTones: text("secondary_tones"),   // JSON array
  pacing: text("pacing"),                    // "Slow Burn" | "Moderate" | "Fast-Paced" | "Variable"
  proseStyle: text("prose_style"),           // "Sparse/Minimalist" | "Rich/Lyrical" | "Conversational" | "Literary" | "Commercial"

  // Themes
  primaryTheme: text("primary_theme"),
  secondaryThemes: text("secondary_themes"), // JSON array
  themeImportance: integer("theme_importance").default(3), // 1-5 scale

  // Length & format
  wordCount: integer("word_count"),
  estimatedPages: integer("estimated_pages"),
  chapterCount: integer("chapter_count"),
  avgChapterLength: text("avg_chapter_length"), // "Short (<1500w)" | "Medium (1500-4000w)" | "Long (4000w+)"
  seriesOrStandalone: text("series_or_standalone"), // "Standalone" | "Series (Book 1)" | "Duology" | "Trilogy" | "Open-Ended Series"
  seriesName: text("series_name"),

  // Pitch core elements
  oneLiner: text("one_liner"),               // single sentence pitch
  elevatorPitch: text("elevator_pitch"),     // 2-3 sentence hook
  protagonistLogline: text("protagonist_logline"), // "A [descriptor] must [goal] before [deadline] or else [stakes]"
  incitingIncident: text("inciting_incident"),
  centralConflict: text("central_conflict"),
  stakes: text("stakes"),
  emotionalCore: text("emotional_core"),    // the "why should we care" factor
  uniqueHook: text("unique_hook"),          // what makes it unlike anything else

  // Comp titles
  compTitle1: text("comp_title_1"),
  compTitle1Year: integer("comp_title_1_year"),
  compTitle1Reason: text("comp_title_1_reason"),
  compTitle2: text("comp_title_2"),
  compTitle2Year: integer("comp_title_2_year"),
  compTitle2Reason: text("comp_title_2_reason"),
  compTitle3: text("comp_title_3"),
  compTitle3Year: integer("comp_title_3_year"),
  compTitle3Reason: text("comp_title_3_reason"),
});

export const insertStoryIdentitySchema = createInsertSchema(storyIdentity).omit({ id: true });
export type InsertStoryIdentity = z.infer<typeof insertStoryIdentitySchema>;
export type StoryIdentity = typeof storyIdentity.$inferSelect;

// ───────────────────────────────────────────────
// Characters
// ───────────────────────────────────────────────
export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  role: text("role").notNull(),     // "Protagonist" | "Antagonist" | "Deuteragonist" | "Supporting" | "Mentor" | "Love Interest" | "Other"
  name: text("name").notNull(),
  age: text("age"),
  occupation: text("occupation"),
  physicalDescription: text("physical_description"),
  personalityTraits: text("personality_traits"),  // JSON array
  backstory: text("backstory"),
  motivation: text("motivation"),
  internalConflict: text("internal_conflict"),     // the flaw / wound / belief
  externalGoal: text("external_goal"),
  characterArcStart: text("character_arc_start"),  // who they are at the start
  characterArcEnd: text("character_arc_end"),      // who they become
  arcType: text("arc_type"),                       // "Positive Change" | "Negative Change" | "Flat Arc" | "Tragic Arc"
  relationshipToProtagonist: text("relationship_to_protagonist"),
  uniqueVoiceNotes: text("unique_voice_notes"),
  pitchImportance: integer("pitch_importance").default(3), // 1-5
  sortOrder: integer("sort_order").default(0),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// ───────────────────────────────────────────────
// Locations / World Regions
// ───────────────────────────────────────────────
export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  name: text("name").notNull(),
  locationType: text("location_type"),  // "City" | "Region" | "Nation" | "World" | "Dimension/Realm" | "Building/Structure" | "Landscape" | "Other"
  physicalDescription: text("physical_description"),
  atmosphere: text("atmosphere"),       // the feel of the place
  culturalNotes: text("cultural_notes"),
  historicalSignificance: text("historical_significance"),
  roleInStory: text("role_in_story"),   // why this place matters
  uniqueFeatures: text("unique_features"), // JSON array
  realWorldInspiration: text("real_world_inspiration"),
  pitchImportance: integer("pitch_importance").default(3),
  sortOrder: integer("sort_order").default(0),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// ───────────────────────────────────────────────
// Story Mechanics — genre-specific systems
// ───────────────────────────────────────────────
export const storyMechanics = sqliteTable("story_mechanics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  // Relevant module flags (true = active in this project)
  magicSystemActive: integer("magic_system_active", { mode: "boolean" }).default(false),
  politicalSystemActive: integer("political_system_active", { mode: "boolean" }).default(false),
  scienceTechActive: integer("science_tech_active", { mode: "boolean" }).default(false),
  religionMythologyActive: integer("religion_mythology_active", { mode: "boolean" }).default(false),
  economicsActive: integer("economics_active", { mode: "boolean" }).default(false),
  socialStructureActive: integer("social_structure_active", { mode: "boolean" }).default(false),
  historyLoreActive: integer("history_lore_active", { mode: "boolean" }).default(false),
  languageActive: integer("language_active", { mode: "boolean" }).default(false),

  // Magic system
  magicSystemName: text("magic_system_name"),
  magicSystemType: text("magic_system_type"),   // "Hard (strict rules)" | "Soft (mysterious)" | "Mixed"
  magicRules: text("magic_rules"),              // how it works
  magicCosts: text("magic_costs"),              // limitations, costs, drawbacks
  magicOrigin: text("magic_origin"),
  magicPitchImportance: integer("magic_pitch_importance").default(3),

  // Political system
  politicalSystemName: text("political_system_name"),
  politicalStructure: text("political_structure"), // "Monarchy" | "Republic" | "Theocracy" | "Oligarchy" | "Anarchy" | "Democracy" | "Dystopian" | "Other"
  politicalConflict: text("political_conflict"),
  factions: text("factions"),                   // JSON array of {name, goal, alignment}
  politicalPitchImportance: integer("political_pitch_importance").default(3),

  // Science & Technology
  techLevel: text("tech_level"),                // "Pre-Industrial" | "Industrial" | "Modern" | "Near-Future" | "Far-Future" | "Post-Apocalyptic" | "Mixed"
  keyTechnologies: text("key_technologies"),    // JSON array
  scienceConcepts: text("science_concepts"),    // key scientific ideas in play
  techPitchImportance: integer("tech_pitch_importance").default(3),

  // Religion & Mythology
  religionName: text("religion_name"),
  deities: text("deities"),                     // JSON array
  mythologyNotes: text("mythology_notes"),
  religionRoleInStory: text("religion_role_in_story"),
  religionPitchImportance: integer("religion_pitch_importance").default(3),

  // Economics
  economicSystem: text("economic_system"),
  keyResources: text("key_resources"),
  economicConflict: text("economic_conflict"),
  economicsPitchImportance: integer("economics_pitch_importance").default(3),

  // Social Structure
  socialHierarchy: text("social_hierarchy"),
  majorGroups: text("major_groups"),            // JSON array
  discriminationOrInjustice: text("discrimination_or_injustice"),
  socialPitchImportance: integer("social_pitch_importance").default(3),

  // History & Lore
  historicalContext: text("historical_context"),
  keyHistoricalEvents: text("key_historical_events"), // JSON array
  loreNotes: text("lore_notes"),
  historyPitchImportance: integer("history_pitch_importance").default(3),

  // Language / Linguistics
  constructedLanguages: text("constructed_languages"), // JSON array
  languageNotes: text("language_notes"),
  languagePitchImportance: integer("language_pitch_importance").default(3),
});

export const insertStoryMechanicsSchema = createInsertSchema(storyMechanics).omit({ id: true });
export type InsertStoryMechanics = z.infer<typeof insertStoryMechanicsSchema>;
export type StoryMechanics = typeof storyMechanics.$inferSelect;

// ───────────────────────────────────────────────
// Author Bio — for the query letter section
// ───────────────────────────────────────────────
export const authorBio = sqliteTable("author_bio", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  authorName: text("author_name"),
  location: text("location"),
  writingBackground: text("writing_background"),
  previousPublications: text("previous_publications"), // JSON array of {title, publisher, year}
  relevantCredentials: text("relevant_credentials"),   // degrees, awards, expertise
  personalConnection: text("personal_connection"),     // why they wrote this book
  platformNotes: text("platform_notes"),               // social media, newsletter, etc.
  agentResearchNotes: text("agent_research_notes"),    // personalization notes per agent
});

export const insertAuthorBioSchema = createInsertSchema(authorBio).omit({ id: true });
export type InsertAuthorBio = z.infer<typeof insertAuthorBioSchema>;
export type AuthorBio = typeof authorBio.$inferSelect;

// ───────────────────────────────────────────────
// Section Weights — importance factors per section
// ───────────────────────────────────────────────
export const sectionWeights = sqliteTable("section_weights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),

  // Each section gets an importance (1-5) and an active flag
  storyIdentityImportance: integer("story_identity_importance").default(5),
  storyIdentityActive: integer("story_identity_active", { mode: "boolean" }).default(true),
  charactersImportance: integer("characters_importance").default(5),
  charactersActive: integer("characters_active", { mode: "boolean" }).default(true),
  worldImportance: integer("world_importance").default(3),
  worldActive: integer("world_active", { mode: "boolean" }).default(true),
  magicImportance: integer("magic_importance").default(3),
  magicActive: integer("magic_active", { mode: "boolean" }).default(false),
  politicsImportance: integer("politics_importance").default(3),
  politicsActive: integer("politics_active", { mode: "boolean" }).default(false),
  scienceImportance: integer("science_importance").default(3),
  scienceActive: integer("science_active", { mode: "boolean" }).default(false),
  religionImportance: integer("religion_importance").default(3),
  religionActive: integer("religion_active", { mode: "boolean" }).default(false),
  economicsImportance: integer("economics_importance").default(3),
  economicsActive: integer("economics_active", { mode: "boolean" }).default(false),
  socialStructureImportance: integer("social_structure_importance").default(3),
  socialStructureActive: integer("social_structure_active", { mode: "boolean" }).default(false),
  historyLoreImportance: integer("history_lore_importance").default(3),
  historyLoreActive: integer("history_lore_active", { mode: "boolean" }).default(false),
  authorBioImportance: integer("author_bio_importance").default(4),
  authorBioActive: integer("author_bio_active", { mode: "boolean" }).default(true),
  compsImportance: integer("comps_importance").default(4),
  compsActive: integer("comps_active", { mode: "boolean" }).default(true),
});

export const insertSectionWeightsSchema = createInsertSchema(sectionWeights).omit({ id: true });
export type InsertSectionWeights = z.infer<typeof insertSectionWeightsSchema>;
export type SectionWeights = typeof sectionWeights.$inferSelect;
