import { app, BrowserWindow } from "electron";
import path from "path";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 620, // Just wide enough for input
    height: 120, // Increased height for close button
    frame: false, // Remove window frame
    transparent: true, // Make window transparent
    alwaysOnTop: true, // Keep window on top
    resizable: false, // Disable resizing
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));

  mainWindow.on("closed", () => {
    app.quit();
  });
});
