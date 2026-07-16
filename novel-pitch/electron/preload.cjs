/**
 * Preload script — runs in a privileged context with access to Node/Electron APIs,
 * but exposes only a narrow, safe interface to the renderer (React app).
 *
 * contextBridge.exposeInMainWorld puts functions on window.electronAPI so the
 * renderer can call them without nodeIntegration being enabled.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Ask the main process to save the current page as a PDF.
   * Returns { success: true, filePath } or { success: false, error: string }
   */
  savePDF: (defaultFileName) =>
    ipcRenderer.invoke("save-pdf", defaultFileName),
});
