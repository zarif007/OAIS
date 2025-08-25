import * as dotenv from "dotenv";
import * as path from "path";
import { app, BrowserWindow, ipcMain, screen, IpcMainEvent } from "electron";
import { Command } from "./types/commandGenerator.js";
import taskRouterAgent from "./agents/taskRouter.js";
import agentHandler from "./actions/agentHandler.js";
import taskOrchestrator from "./agents/taskOrchestrator.js";
import IContextManager from "./types/contextManager.js";
import commandsExecutor from "./actions/commandsExecutor.js";

let lastCommands: Command[] = [];

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
      const contextManager: IContextManager = {};
      const subtasks = await taskOrchestrator(promptText);
      const commands = await agentHandler(contextManager, subtasks);
      console.log(subtasks, commands);
      lastCommands = commands;
      const isDangerous = commands.filter(
        (command) => command.isItDangerous === true
      );
      if (isDangerous.length > 0) {
        const newHeight = 160;
        const currentBounds = mainWindow.getBounds();
        mainWindow.setBounds({
          ...currentBounds,
          height: newHeight,
          y: screenHeight - newHeight - 10,
        });
        mainWindow.webContents.send("dangerous-command", isDangerous);
        return;
      }
      executeTasks(commands, mainWindow);
    } catch (err) {
      console.error("Error generating commands:", err);
      mainWindow.webContents.send("command-error", err);
    }
  });

  ipcMain.on("dangerous-command-proceed", async () => {
    try {
      const normalHeight = 100;
      const currentBounds = mainWindow.getBounds();
      mainWindow.setBounds({
        ...currentBounds,
        height: normalHeight,
        y: screenHeight - normalHeight - 10,
      });

      executeTasks(lastCommands, mainWindow);
    } catch (err) {
      console.error("Error executing dangerous commands:", err);
      mainWindow.webContents.send("command-error", err);
    }
  });

  ipcMain.on("dangerous-command-cancel", () => {
    console.log("Dangerous command cancelled");
    const normalHeight = 100;
    const currentBounds = mainWindow.getBounds();
    mainWindow.setBounds({
      ...currentBounds,
      height: normalHeight,
      y: screenHeight - normalHeight - 10,
    });
  });
});

const executeTasks = async (commands: Command[], mainWindow: BrowserWindow) => {
  try {
    // console.log("executeTasks called with commands:", commands);
    // const parsedCommands = await parseCommands(commands);
    // const compiledCommands = commandCompiler(parsedCommands);
    await commandsExecutor(commands.map((cmd) => cmd.command));
    mainWindow.webContents.send("commands-executed", lastCommands);
  } catch (err) {
    console.error("Error executing tasks:", err);
  }
};
