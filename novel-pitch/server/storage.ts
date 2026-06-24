/**
 * Storage layer using sql.js (pure WebAssembly SQLite — no native binaries).
 * This runs identically on Linux, Windows, and macOS without compilation.
 *
 * The database is persisted to disk by serialising the in-memory sql.js DB
 * after every write and flushing it back on startup.
 */

import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import path from "path";
import fs from "fs";

import {
  type Project, type InsertProject,
  type StoryIdentity, type InsertStoryIdentity,
  type StoryMechanics, type InsertStoryMechanics,
  type Character, type InsertCharacter,
  type Location, type InsertLocation,
  type AuthorBio, type InsertAuthorBio,
  type SectionWeights, type InsertSectionWeights,
} from "@shared/schema";

// ─── DB Path ────────────────────────────────────────────────────────────────

function getDbPath(): string {
  const userDataPath = process.env.ELECTRON_USER_DATA_PATH;
  if (userDataPath) {
    fs.mkdirSync(userDataPath, { recursive: true });
    return path.join(userDataPath, "novel_pitch.db");
  }
  return path.join(process.cwd(), "novel_pitch.db");
}

// ─── Init ────────────────────────────────────────────────────────────────────

let _db: SqlJsDatabase | null = null;
let _dbPath: string = "";

function getDb(): SqlJsDatabase {
  if (!_db) throw new Error("Database not initialized. Call initDb() first.");
  return _db;
}

/** Persist the in-memory database to disk. Called after every write. */
function save() {
  const data = getDb().export();
  fs.writeFileSync(_dbPath, Buffer.from(data));
}

const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS story_identity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    primary_genre TEXT, subgenres TEXT, age_category TEXT, target_audience TEXT,
    story_scale TEXT, narrative_driver TEXT, structure_type TEXT, pov TEXT, tense TEXT,
    primary_tone TEXT, secondary_tones TEXT, pacing TEXT, prose_style TEXT,
    primary_theme TEXT, secondary_themes TEXT, theme_importance INTEGER DEFAULT 3,
    word_count INTEGER, estimated_pages INTEGER, chapter_count INTEGER,
    avg_chapter_length TEXT, series_or_standalone TEXT, series_name TEXT,
    one_liner TEXT, elevator_pitch TEXT, protagonist_logline TEXT,
    inciting_incident TEXT, central_conflict TEXT, stakes TEXT,
    emotional_core TEXT, unique_hook TEXT,
    comp_title_1 TEXT, comp_title_1_year INTEGER, comp_title_1_reason TEXT,
    comp_title_2 TEXT, comp_title_2_year INTEGER, comp_title_2_reason TEXT,
    comp_title_3 TEXT, comp_title_3_year INTEGER, comp_title_3_reason TEXT
  );

  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    role TEXT NOT NULL, name TEXT NOT NULL, age TEXT, occupation TEXT,
    physical_description TEXT, personality_traits TEXT, backstory TEXT,
    motivation TEXT, internal_conflict TEXT, external_goal TEXT,
    character_arc_start TEXT, character_arc_end TEXT, arc_type TEXT,
    relationship_to_protagonist TEXT, unique_voice_notes TEXT,
    pitch_importance INTEGER DEFAULT 3, sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL, location_type TEXT, physical_description TEXT,
    atmosphere TEXT, cultural_notes TEXT, historical_significance TEXT,
    role_in_story TEXT, unique_features TEXT, real_world_inspiration TEXT,
    pitch_importance INTEGER DEFAULT 3, sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS story_mechanics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    magic_system_active INTEGER DEFAULT 0, political_system_active INTEGER DEFAULT 0,
    science_tech_active INTEGER DEFAULT 0, religion_mythology_active INTEGER DEFAULT 0,
    economics_active INTEGER DEFAULT 0, social_structure_active INTEGER DEFAULT 0,
    history_lore_active INTEGER DEFAULT 0, language_active INTEGER DEFAULT 0,
    magic_system_name TEXT, magic_system_type TEXT, magic_rules TEXT, magic_costs TEXT, magic_origin TEXT, magic_pitch_importance INTEGER DEFAULT 3,
    political_system_name TEXT, political_structure TEXT, political_conflict TEXT, factions TEXT, political_pitch_importance INTEGER DEFAULT 3,
    tech_level TEXT, key_technologies TEXT, science_concepts TEXT, tech_pitch_importance INTEGER DEFAULT 3,
    religion_name TEXT, deities TEXT, mythology_notes TEXT, religion_role_in_story TEXT, religion_pitch_importance INTEGER DEFAULT 3,
    economic_system TEXT, key_resources TEXT, economic_conflict TEXT, economics_pitch_importance INTEGER DEFAULT 3,
    social_hierarchy TEXT, major_groups TEXT, discrimination_or_injustice TEXT, social_pitch_importance INTEGER DEFAULT 3,
    historical_context TEXT, key_historical_events TEXT, lore_notes TEXT, history_pitch_importance INTEGER DEFAULT 3,
    constructed_languages TEXT, language_notes TEXT, language_pitch_importance INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS author_bio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    author_name TEXT, location TEXT, writing_background TEXT,
    previous_publications TEXT, relevant_credentials TEXT,
    personal_connection TEXT, platform_notes TEXT, agent_research_notes TEXT
  );

  CREATE TABLE IF NOT EXISTS section_weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    story_identity_importance INTEGER DEFAULT 5, story_identity_active INTEGER DEFAULT 1,
    characters_importance INTEGER DEFAULT 5, characters_active INTEGER DEFAULT 1,
    world_importance INTEGER DEFAULT 3, world_active INTEGER DEFAULT 1,
    magic_importance INTEGER DEFAULT 3, magic_active INTEGER DEFAULT 0,
    politics_importance INTEGER DEFAULT 3, politics_active INTEGER DEFAULT 0,
    science_importance INTEGER DEFAULT 3, science_active INTEGER DEFAULT 0,
    religion_importance INTEGER DEFAULT 3, religion_active INTEGER DEFAULT 0,
    economics_importance INTEGER DEFAULT 3, economics_active INTEGER DEFAULT 0,
    social_structure_importance INTEGER DEFAULT 3, social_structure_active INTEGER DEFAULT 0,
    history_lore_importance INTEGER DEFAULT 3, history_lore_active INTEGER DEFAULT 0,
    author_bio_importance INTEGER DEFAULT 4, author_bio_active INTEGER DEFAULT 1,
    comps_importance INTEGER DEFAULT 4, comps_active INTEGER DEFAULT 1
  );
`;

export async function initDb(): Promise<void> {
  _dbPath = getDbPath();

  // Resolve the wasm file relative to this module's location so it works
  // both in development (node_modules/sql.js/dist/) and in the Electron
  // production bundle (dist/sql-wasm.wasm copied alongside dist/index.cjs).
  const wasmPaths = [
    path.join(__dirname, "sql-wasm.wasm"),                              // prod bundle: dist/
    path.join(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm"),  // dev: server/
    path.join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"), // dev: cwd
  ];
  const wasmPath = wasmPaths.find(p => fs.existsSync(p)) ??
    path.join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm");

  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (fs.existsSync(_dbPath)) {
    const fileData = fs.readFileSync(_dbPath);
    _db = new SQL.Database(fileData);
  } else {
    _db = new SQL.Database();
  }

  _db.run(CREATE_TABLES);
  save();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Run a SELECT and return all rows as plain objects. */
function all<T>(sql: string, params: (string | number | null | boolean)[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const results: T[] = [];
  // sql.js uses bind() then step() pattern
  stmt.bind(params.map(p => (p === true ? 1 : p === false ? 0 : p)));
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

/** Run a SELECT and return the first row, or undefined. */
function get<T>(sql: string, params: (string | number | null | boolean)[] = []): T | undefined {
  const rows = all<T>(sql, params);
  return rows[0];
}

/** Run an INSERT/UPDATE/DELETE. Returns the last inserted row id for INSERTs. */
function run(sql: string, params: (string | number | null | boolean)[] = []): number {
  const db = getDb();
  db.run(sql, params.map(p => (p === true ? 1 : p === false ? 0 : p)));
  return (db as any).getRowsModified ? (db as any).getRowsModified() : 0;
}

/** Insert a row and return its id. */
function insertAndGetId(sql: string, params: (string | number | null | boolean)[] = []): number {
  const db = getDb();
  db.run(sql, params.map(p => (p === true ? 1 : p === false ? 0 : p)));
  const row = get<{ id: number }>("SELECT last_insert_rowid() as id");
  return row!.id;
}

// Converts snake_case DB column names to camelCase for the app types
function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    // Convert _letter AND _digit sequences: comp_title_1 → compTitle1
    const camel = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    let val = obj[key];
    // sql.js returns 0/1 for boolean columns; only convert fields ending in _active
    if (key.endsWith('_active')) {
      val = val === 1 || val === true;
    }
    result[camel] = val;
  }
  return result;
}

function camelRow<T>(obj: Record<string, unknown>): T {
  return toCamel(obj) as unknown as T;
}

function camelRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map(r => camelRow<T>(r));
}

// ─── Build parameterised SET clause from a partial object ────────────────────

/** Convert camelCase keys to snake_case, including digit boundaries. */
function toSnake(s: string): string {
  // Insert underscore before uppercase letters and before digit runs
  // compTitle1 → comp_title_1, scienceTechActive → science_tech_active
  return s
    .replace(/([A-Z])/g, c => `_${c.toLowerCase()}`)
    .replace(/([a-z])([0-9])/g, (_, a, d) => `${a}_${d}`);
}

/** Build "col1 = ?, col2 = ?" and matching params array from a partial record. */
function buildSet(data: Record<string, unknown>): { clause: string; params: (string | number | null | boolean)[] } {
  const keys = Object.keys(data);
  const clause = keys.map(k => `${toSnake(k)} = ?`).join(", ");
  const params = keys.map(k => {
    const v = data[k];
    if (v === null || v === undefined) return null;
    return v as string | number | boolean;
  });
  return { clause, params };
}

// ─── IStorage interface ───────────────────────────────────────────────────────

export interface IStorage {
  // Projects
  getProjects(): Project[];
  getProject(id: number): Project | undefined;
  createProject(data: InsertProject): Project;
  updateProject(id: number, data: Partial<InsertProject>): Project | undefined;
  deleteProject(id: number): void;

  // Story Identity
  getStoryIdentity(projectId: number): StoryIdentity | undefined;
  upsertStoryIdentity(projectId: number, data: Partial<InsertStoryIdentity>): StoryIdentity;

  // Characters
  getCharacters(projectId: number): Character[];
  getCharacter(id: number): Character | undefined;
  createCharacter(data: InsertCharacter): Character;
  updateCharacter(id: number, data: Partial<InsertCharacter>): Character | undefined;
  deleteCharacter(id: number): void;

  // Locations
  getLocations(projectId: number): Location[];
  getLocation(id: number): Location | undefined;
  createLocation(data: InsertLocation): Location;
  updateLocation(id: number, data: Partial<InsertLocation>): Location | undefined;
  deleteLocation(id: number): void;

  // Story Mechanics
  getStoryMechanics(projectId: number): StoryMechanics | undefined;
  upsertStoryMechanics(projectId: number, data: Partial<InsertStoryMechanics>): StoryMechanics;

  // Author Bio
  getAuthorBio(projectId: number): AuthorBio | undefined;
  upsertAuthorBio(projectId: number, data: Partial<InsertAuthorBio>): AuthorBio;

  // Section Weights
  getSectionWeights(projectId: number): SectionWeights | undefined;
  upsertSectionWeights(projectId: number, data: Partial<InsertSectionWeights>): SectionWeights;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class Storage implements IStorage {

  // ── Projects ──────────────────────────────────────────────────────────────

  getProjects(): Project[] {
    return camelRows<Project>(all("SELECT * FROM projects ORDER BY updated_at DESC"));
  }

  getProject(id: number): Project | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM projects WHERE id = ?", [id]);
    return row ? camelRow<Project>(row) : undefined;
  }

  createProject(data: InsertProject): Project {
    const now = new Date().toISOString();
    const id = insertAndGetId(
      "INSERT INTO projects (title, subtitle, created_at, updated_at) VALUES (?, ?, ?, ?)",
      [data.title, data.subtitle ?? null, now, now]
    );
    save();
    return this.getProject(id)!;
  }

  updateProject(id: number, data: Partial<InsertProject>): Project | undefined {
    const { clause, params } = buildSet({ ...data, updatedAt: new Date().toISOString() });
    run(`UPDATE projects SET ${clause} WHERE id = ?`, [...params, id]);
    save();
    return this.getProject(id);
  }

  deleteProject(id: number): void {
    run("DELETE FROM projects WHERE id = ?", [id]);
    run("DELETE FROM story_identity WHERE project_id = ?", [id]);
    run("DELETE FROM characters WHERE project_id = ?", [id]);
    run("DELETE FROM locations WHERE project_id = ?", [id]);
    run("DELETE FROM story_mechanics WHERE project_id = ?", [id]);
    run("DELETE FROM author_bio WHERE project_id = ?", [id]);
    run("DELETE FROM section_weights WHERE project_id = ?", [id]);
    save();
  }

  // ── Story Identity ─────────────────────────────────────────────────────────

  getStoryIdentity(projectId: number): StoryIdentity | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM story_identity WHERE project_id = ?", [projectId]);
    return row ? camelRow<StoryIdentity>(row) : undefined;
  }

  upsertStoryIdentity(projectId: number, data: Partial<InsertStoryIdentity>): StoryIdentity {
    const existing = this.getStoryIdentity(projectId);
    if (existing) {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      if (clause) run(`UPDATE story_identity SET ${clause} WHERE project_id = ?`, [...params, projectId]);
    } else {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      const cols = clause ? `, ${Object.keys(data as object).map(toSnake).join(", ")}` : "";
      const placeholders = clause ? `, ${params.map(() => "?").join(", ")}` : "";
      insertAndGetId(
        `INSERT INTO story_identity (project_id${cols}) VALUES (?${placeholders})`,
        [projectId, ...params]
      );
    }
    save();
    return this.getStoryIdentity(projectId)!;
  }

  // ── Characters ────────────────────────────────────────────────────────────

  getCharacters(projectId: number): Character[] {
    return camelRows<Character>(all("SELECT * FROM characters WHERE project_id = ? ORDER BY sort_order ASC, id ASC", [projectId]));
  }

  getCharacter(id: number): Character | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM characters WHERE id = ?", [id]);
    return row ? camelRow<Character>(row) : undefined;
  }

  createCharacter(data: InsertCharacter): Character {
    const id = insertAndGetId(
      `INSERT INTO characters (project_id, role, name, age, occupation,
        physical_description, personality_traits, backstory, motivation,
        internal_conflict, external_goal, character_arc_start, character_arc_end,
        arc_type, relationship_to_protagonist, unique_voice_notes,
        pitch_importance, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.projectId, data.role, data.name,
        data.age ?? null, data.occupation ?? null,
        data.physicalDescription ?? null, data.personalityTraits ?? null,
        data.backstory ?? null, data.motivation ?? null,
        data.internalConflict ?? null, data.externalGoal ?? null,
        data.characterArcStart ?? null, data.characterArcEnd ?? null,
        data.arcType ?? null, data.relationshipToProtagonist ?? null,
        data.uniqueVoiceNotes ?? null,
        data.pitchImportance ?? 3, data.sortOrder ?? 0,
      ]
    );
    save();
    return this.getCharacter(id)!;
  }

  updateCharacter(id: number, data: Partial<InsertCharacter>): Character | undefined {
    const { clause, params } = buildSet(data as Record<string, unknown>);
    if (clause) run(`UPDATE characters SET ${clause} WHERE id = ?`, [...params, id]);
    save();
    return this.getCharacter(id);
  }

  deleteCharacter(id: number): void {
    run("DELETE FROM characters WHERE id = ?", [id]);
    save();
  }

  // ── Locations ─────────────────────────────────────────────────────────────

  getLocations(projectId: number): Location[] {
    return camelRows<Location>(all("SELECT * FROM locations WHERE project_id = ? ORDER BY sort_order ASC, id ASC", [projectId]));
  }

  getLocation(id: number): Location | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM locations WHERE id = ?", [id]);
    return row ? camelRow<Location>(row) : undefined;
  }

  createLocation(data: InsertLocation): Location {
    const id = insertAndGetId(
      `INSERT INTO locations (project_id, name, location_type, physical_description,
        atmosphere, cultural_notes, historical_significance, role_in_story,
        unique_features, real_world_inspiration, pitch_importance, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.projectId, data.name,
        data.locationType ?? null, data.physicalDescription ?? null,
        data.atmosphere ?? null, data.culturalNotes ?? null,
        data.historicalSignificance ?? null, data.roleInStory ?? null,
        data.uniqueFeatures ?? null, data.realWorldInspiration ?? null,
        data.pitchImportance ?? 3, data.sortOrder ?? 0,
      ]
    );
    save();
    return this.getLocation(id)!;
  }

  updateLocation(id: number, data: Partial<InsertLocation>): Location | undefined {
    const { clause, params } = buildSet(data as Record<string, unknown>);
    if (clause) run(`UPDATE locations SET ${clause} WHERE id = ?`, [...params, id]);
    save();
    return this.getLocation(id);
  }

  deleteLocation(id: number): void {
    run("DELETE FROM locations WHERE id = ?", [id]);
    save();
  }

  // ── Story Mechanics ────────────────────────────────────────────────────────

  getStoryMechanics(projectId: number): StoryMechanics | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM story_mechanics WHERE project_id = ?", [projectId]);
    return row ? camelRow<StoryMechanics>(row) : undefined;
  }

  upsertStoryMechanics(projectId: number, data: Partial<InsertStoryMechanics>): StoryMechanics {
    const existing = this.getStoryMechanics(projectId);
    if (existing) {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      if (clause) run(`UPDATE story_mechanics SET ${clause} WHERE project_id = ?`, [...params, projectId]);
    } else {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      const cols = clause ? `, ${Object.keys(data as object).map(toSnake).join(", ")}` : "";
      const placeholders = clause ? `, ${params.map(() => "?").join(", ")}` : "";
      insertAndGetId(
        `INSERT INTO story_mechanics (project_id${cols}) VALUES (?${placeholders})`,
        [projectId, ...params]
      );
    }
    save();
    return this.getStoryMechanics(projectId)!;
  }

  // ── Author Bio ─────────────────────────────────────────────────────────────

  getAuthorBio(projectId: number): AuthorBio | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM author_bio WHERE project_id = ?", [projectId]);
    return row ? camelRow<AuthorBio>(row) : undefined;
  }

  upsertAuthorBio(projectId: number, data: Partial<InsertAuthorBio>): AuthorBio {
    const existing = this.getAuthorBio(projectId);
    if (existing) {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      if (clause) run(`UPDATE author_bio SET ${clause} WHERE project_id = ?`, [...params, projectId]);
    } else {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      const cols = clause ? `, ${Object.keys(data as object).map(toSnake).join(", ")}` : "";
      const placeholders = clause ? `, ${params.map(() => "?").join(", ")}` : "";
      insertAndGetId(
        `INSERT INTO author_bio (project_id${cols}) VALUES (?${placeholders})`,
        [projectId, ...params]
      );
    }
    save();
    return this.getAuthorBio(projectId)!;
  }

  // ── Section Weights ────────────────────────────────────────────────────────

  getSectionWeights(projectId: number): SectionWeights | undefined {
    const row = get<Record<string, unknown>>("SELECT * FROM section_weights WHERE project_id = ?", [projectId]);
    return row ? camelRow<SectionWeights>(row) : undefined;
  }

  upsertSectionWeights(projectId: number, data: Partial<InsertSectionWeights>): SectionWeights {
    const existing = this.getSectionWeights(projectId);
    if (existing) {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      if (clause) run(`UPDATE section_weights SET ${clause} WHERE project_id = ?`, [...params, projectId]);
    } else {
      const { clause, params } = buildSet(data as Record<string, unknown>);
      const cols = clause ? `, ${Object.keys(data as object).map(toSnake).join(", ")}` : "";
      const placeholders = clause ? `, ${params.map(() => "?").join(", ")}` : "";
      insertAndGetId(
        `INSERT INTO section_weights (project_id${cols}) VALUES (?${placeholders})`,
        [projectId, ...params]
      );
    }
    save();
    return this.getSectionWeights(projectId)!;
  }
}

export const storage = new Storage();
