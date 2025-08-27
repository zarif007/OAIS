import appAgent from "../agents/appAgent.js";
import localAgent from "../agents/localAgent.js";
import agentPromptBuilder from "../systemPrompts/agentPromptBuilder.js";
import { Command } from "../types/commandGenerator.js";
import IContextManager from "../types/contextManager.js";
import { Subtask } from "../types/taskOrchestrator.js";

type CommandOutput = {
  [commandId: string]: {
    command: string;
    output: string;
  };
};

let allCommands: Command[] = [];

const generateCommands = async (
  contextManager: IContextManager,
  subtask: Subtask,
  subtasks: Subtask[],
  processing: Set<string> = new Set()
): Promise<void> => {
  if (contextManager[subtask.taskId] || processing.has(subtask.taskId)) return;

  processing.add(subtask.taskId);

  try {
    const dependentCommands: CommandOutput[] = [];

    for (const dep of subtask.dependsOn) {
      const depTask = subtasks.find((task) => task.taskId === dep);
      if (!depTask) {
        throw new Error(`Dependent task ${dep} not found`);
      }

      if (!contextManager[dep]) {
        await generateCommands(contextManager, depTask, subtasks, processing);
      }
      dependentCommands.push(contextManager[dep]);
    }

    let commands: Command[] = [];

    if (subtask.agentType === "LocalAgent") {
      commands = await localAgent(
        agentPromptBuilder(dependentCommands, subtask.command)
      );
    } else if (subtask.agentType === "AppAgent") {
      commands = await appAgent(
        agentPromptBuilder(dependentCommands, subtask.command)
      );
    } else {
      throw new Error(`Unknown agent type: ${subtask.agentType}`);
    }

    allCommands.push(...commands);

    contextManager[subtask.taskId] = {};

    commands.forEach((command) => {
      contextManager[subtask.taskId][command.commandId] = {
        command: command.command,
        output: command.output,
      };
    });
  } finally {
    processing.delete(subtask.taskId);
  }
};

const agentHandler = async (
  contextManager: IContextManager,
  subtasks: Subtask[]
): Promise<Command[]> => {
  allCommands = [];
  for (const subtask of subtasks) {
    await generateCommands(contextManager, subtask, subtasks);
  }
  return allCommands;
};

export default agentHandler;
