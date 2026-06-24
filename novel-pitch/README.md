# Manuscript — Literary Agent Pitch Builder

A desktop app for novelists to structure, organize, and generate a polished pitch for literary agents. Manuscript guides you through every detail of your story — genre, characters, world-building, mechanics, and author bio — then assembles a weighted pitch document based on what matters most for your book.

---

## Downloads

| Platform | File | Notes |
|----------|------|-------|
| Windows | `Manuscript Setup 1.0.0.exe` | Installs with a setup wizard, creates Start Menu shortcut |
| Windows | `Manuscript-Portable-1.0.0.exe` | No installation — run from anywhere |
| Linux | `Manuscript-1.0.0.AppImage` | Runs on any modern Linux distro, no installation needed |

---

## Installation

### Windows (Installer)
1. Run `Manuscript Setup 1.0.0.exe`
2. Follow the setup wizard — you can choose your install directory
3. Launch from the Start Menu or desktop shortcut

### Windows (Portable)
1. Download `Manuscript-Portable-1.0.0.exe`
2. Double-click to run — no installation needed
3. Your data is saved to `%APPDATA%\Manuscript\`

### Linux (AppImage)
1. Download `Manuscript-1.0.0.AppImage`
2. Make it executable:
   ```bash
   chmod +x Manuscript-1.0.0.AppImage
   ```
3. Run it:
   ```bash
   ./Manuscript-1.0.0.AppImage
   ```
   Or double-click it in your file manager (you may need to enable "Allow executing file as program" in file properties first).

> Your data is saved to `~/.config/Manuscript/` on Linux.

---

## What's Inside

Manuscript is organized into seven sections. Each section can be toggled on or off, and assigned an importance level (1–5) that controls how much weight it carries in the final pitch.

| Section | What you fill in |
|---------|-----------------|
| **Story Identity** | Genre, subgenres, age category, POV, tense, tone, pacing, word count, chapter info, series details, one-liner, elevator pitch, comp titles, central conflict, stakes, and emotional core |
| **Characters** | Unlimited characters with role tags, arc details, backstory, motivation, voice notes, and per-character pitch importance |
| **World & Locations** | Key settings with atmosphere, cultural and historical notes, and their role in the story |
| **Story Mechanics** | Toggle modules for magic systems, political systems, science & technology, religion & mythology, economics, social structure, history & lore, and linguistics |
| **Author Bio** | Writing background, publications, credentials, personal connection to the story, platform, and agent research notes |
| **Section Weights** | Toggle any section on/off and set its importance — this directly shapes what the pitch emphasizes |
| **Pitch Preview** | The fully assembled pitch, weighted by your importance settings, with Copy / Download / Print options |

---

## Data & Privacy

All your data is stored **locally on your machine** — nothing is sent to any server or cloud service. The database is a single SQLite file:

- **Windows:** `C:\Users\<you>\AppData\Roaming\Manuscript\novel_pitch.db`
- **Linux:** `~/.config/Manuscript/novel_pitch.db`

You can back it up or move it by copying that file.

---

## Technical Notes

- Built with Electron, React, Express, and sql.js (WebAssembly SQLite)
- No internet connection required
- Runs on Windows 10/11 (x64) and Linux x64
