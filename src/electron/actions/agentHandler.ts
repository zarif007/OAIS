import appAgent from "../agents/appAgent.js";
import localAgent from "../agents/localAgent.js";
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

export function buildPrompt(
  dependentCommands: CommandOutput[],
  command: string
): string {
  let prompt = `You are an intelligent agent that executes commands. You have access to the results of previously executed commands that are dependencies for your current task.

## CONTEXT - Previously Executed Commands:
The following commands have been executed and their outputs are available for your reference. Use this information to inform your execution of the current command:

`;

  if (dependentCommands.length === 0) {
    prompt += "No previous commands executed.\n\n";
  } else {
    dependentCommands.forEach((dep, index) => {
      Object.keys(dep).forEach((key) => {
        prompt += `### Command ${index + 1} (ID: ${key}):
**Executed:** ${dep[key].command}
**Output:** ${dep[key].output}

`;
      });
    });
  }

  prompt += `## CURRENT TASK:
Execute the following command, taking into account the context and outputs from the previous commands above:

**Command to Execute:** ${command}

## INSTRUCTIONS:
1. Analyze the previous command outputs to understand the current state and context
2. Execute the current command while considering any relevant information from the previous outputs
3. If the current command depends on data from previous commands, reference and use that data appropriately
4. Provide clear, actionable output that can be used by subsequent commands if needed
5. If there are any conflicts or issues with the previous command outputs, address them in your response

Please execute the current command now:`;

  return prompt;
}

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
        buildPrompt(dependentCommands, subtask.command)
      );
    } else if (subtask.agentType === "AppAgent") {
      commands = await appAgent(
        buildPrompt(dependentCommands, subtask.command)
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
