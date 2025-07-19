import * as dotenv from "dotenv";
import * as path from "path";
import { app, BrowserWindow, ipcMain, screen, IpcMainEvent } from "electron";
import generateCommands from "./actions/commandGenerator.js";
import commandsExecutor from "./actions/commandsExecutor.js";

app.on("ready", () => {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = 700;
  const windowHeight = 100;

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.round((screenWidth - windowWidth) / 2),
    y: screenHeight - windowHeight - 10,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
    backgroundColor: "#00000000",
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(app.getAppPath() + "/dist-react/index.html"));

  mainWindow.on("closed", () => {
    app.quit();
  });

  ipcMain.on("prompt", async (event: IpcMainEvent, promptText: string) => {
    dotenv.config();
    try {
      const commands = await generateCommands(promptText);
      console.log(commands);
      await commandsExecutor(commands);
      mainWindow.webContents.send("commands-executed", commands);
    } catch (err) {
      console.error("Error generating commands:", err);
    }
  });
});
