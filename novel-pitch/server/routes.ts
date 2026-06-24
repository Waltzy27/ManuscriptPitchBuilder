import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export function registerRoutes(httpServer: Server, app: Express) {
  // ── Projects ─────────────────────────────────────────
  app.get("/api/projects", (_req, res) => {
    res.json(storage.getProjects());
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const schema = z.object({ title: z.string().min(1), subtitle: z.string().optional() });
    const data = schema.safeParse(req.body);
    if (!data.success) return res.status(400).json({ error: data.error });
    const project = storage.createProject(data.data);
    // Create default records for all sub-tables
    storage.upsertStoryIdentity(project.id, {});
    storage.upsertStoryMechanics(project.id, {});
    storage.upsertAuthorBio(project.id, {});
    storage.upsertSectionWeights(project.id, {});
    res.json(project);
  });

  app.patch("/api/projects/:id", (req, res) => {
    const schema = z.object({ title: z.string().min(1).optional(), subtitle: z.string().optional() });
    const data = schema.safeParse(req.body);
    if (!data.success) return res.status(400).json({ error: data.error });
    const project = storage.updateProject(Number(req.params.id), data.data);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  });

  app.delete("/api/projects/:id", (req, res) => {
    storage.deleteProject(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── Story Identity ────────────────────────────────────
  app.get("/api/projects/:id/story-identity", (req, res) => {
    const data = storage.getStoryIdentity(Number(req.params.id));
    res.json(data || {});
  });

  app.patch("/api/projects/:id/story-identity", (req, res) => {
    const data = storage.upsertStoryIdentity(Number(req.params.id), req.body);
    res.json(data);
  });

  // ── Characters ────────────────────────────────────────
  app.get("/api/projects/:id/characters", (req, res) => {
    res.json(storage.getCharacters(Number(req.params.id)));
  });

  app.post("/api/projects/:id/characters", (req, res) => {
    const schema = z.object({ name: z.string().min(1), role: z.string() });
    const check = schema.safeParse(req.body);
    if (!check.success) return res.status(400).json({ error: check.error });
    const char = storage.createCharacter({ ...req.body, projectId: Number(req.params.id) });
    res.json(char);
  });

  app.patch("/api/projects/:id/characters/:charId", (req, res) => {
    const char = storage.updateCharacter(Number(req.params.charId), req.body);
    if (!char) return res.status(404).json({ error: "Not found" });
    res.json(char);
  });

  app.delete("/api/projects/:id/characters/:charId", (req, res) => {
    storage.deleteCharacter(Number(req.params.charId));
    res.json({ ok: true });
  });

  // ── Locations ─────────────────────────────────────────
  app.get("/api/projects/:id/locations", (req, res) => {
    res.json(storage.getLocations(Number(req.params.id)));
  });

  app.post("/api/projects/:id/locations", (req, res) => {
    const schema = z.object({ name: z.string().min(1) });
    const check = schema.safeParse(req.body);
    if (!check.success) return res.status(400).json({ error: check.error });
    const loc = storage.createLocation({ ...req.body, projectId: Number(req.params.id) });
    res.json(loc);
  });

  app.patch("/api/projects/:id/locations/:locId", (req, res) => {
    const loc = storage.updateLocation(Number(req.params.locId), req.body);
    if (!loc) return res.status(404).json({ error: "Not found" });
    res.json(loc);
  });

  app.delete("/api/projects/:id/locations/:locId", (req, res) => {
    storage.deleteLocation(Number(req.params.locId));
    res.json({ ok: true });
  });

  // ── Story Mechanics ───────────────────────────────────
  app.get("/api/projects/:id/story-mechanics", (req, res) => {
    res.json(storage.getStoryMechanics(Number(req.params.id)) || {});
  });

  app.patch("/api/projects/:id/story-mechanics", (req, res) => {
    const data = storage.upsertStoryMechanics(Number(req.params.id), req.body);
    res.json(data);
  });

  // ── Author Bio ────────────────────────────────────────
  app.get("/api/projects/:id/author-bio", (req, res) => {
    res.json(storage.getAuthorBio(Number(req.params.id)) || {});
  });

  app.patch("/api/projects/:id/author-bio", (req, res) => {
    const data = storage.upsertAuthorBio(Number(req.params.id), req.body);
    res.json(data);
  });

  // ── Section Weights ───────────────────────────────────
  app.get("/api/projects/:id/section-weights", (req, res) => {
    res.json(storage.getSectionWeights(Number(req.params.id)) || {});
  });

  app.patch("/api/projects/:id/section-weights", (req, res) => {
    const data = storage.upsertSectionWeights(Number(req.params.id), req.body);
    res.json(data);
  });
}
