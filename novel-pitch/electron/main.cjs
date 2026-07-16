const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow = null;
const PORT = 57321; // fixed internal port unlikely to conflict

function startExpressServer() {
  return new Promise((resolve, reject) => {
    try {
      // Tell the server where to store the SQLite database
      // (user's AppData/Roaming/Manuscript on Windows, ~/Library/... on mac, ~/.config/... on Linux)
      process.env.ELECTRON_USER_DATA_PATH = app.getPath("userData");
      process.env.PORT = String(PORT);
      process.env.NODE_ENV = "production";

      // Load the compiled Express bundle (CJS)
      const serverPath = path.join(__dirname, "..", "dist", "index.cjs");
      require(serverPath);

      // Give Express a moment to bind the port
      setTimeout(resolve, 1500);
    } catch (err) {
      console.error("Backend startup error:", err);
      reject(err);
    }
  });
}

async function createWindow() {
  await startExpressServer();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Manuscript — Literary Agent Pitch Builder",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
    show: false,
    backgroundColor: "#f5f0e8",
  });

  // Remove the default menu bar (keeps it clean)
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open any external http(s) links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://localhost")) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── PDF Export ──────────────────────────────────────────────────────────────
//
// The renderer calls window.electronAPI.savePDF(fileName) which sends an IPC
// message here. We use webContents.printToPDF() which renders the *full* page
// (not just the visible viewport), then show a native Save dialog and write
// the file to disk.

ipcMain.handle("save-pdf", async (_event, defaultFileName) => {
  if (!mainWindow) return { success: false, error: "No window" };

  try {
    // Show a native Save File dialog so the user picks where to save
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Save Pitch as PDF",
      defaultPath: defaultFileName || "manuscript-pitch.pdf",
      filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) return { success: false, error: "cancelled" };

    // printToPDF renders the entire page — all scrollable content, all sections
    const pdfData = await mainWindow.webContents.printToPDF({
      printBackground: true,           // include background colours
      pageSize: "Letter",              // standard US letter; change to "A4" if preferred
      margins: {
        top: 0.5,                      // inches
        bottom: 0.5,
        left: 0.6,
        right: 0.6,
      },
      // Scale the page so the app's content fits nicely
      scaleFactor: 90,
    });

    fs.writeFileSync(filePath, pdfData);
    return { success: true, filePath };

  } catch (err) {
    console.error("printToPDF error:", err);
    return { success: false, error: String(err) };
  }
});

// ── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Security hardening: prevent navigation to external URLs
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== "localhost") event.preventDefault();
    } catch {
      event.preventDefault();
    }
  });
});
