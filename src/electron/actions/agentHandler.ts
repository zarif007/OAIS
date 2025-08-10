import appAgent from "../agents/appAgent.js";
import localAgent from "../agents/localAgent.js";
import taskRouterAgent from "../agents/taskRouter.js";

import { Command } from "../types/commandGenerator.js";

const agentHandler = async (
  selectedAgent: string,
  prompt: string
): Promise<Command[]> => {
  const results = [];
  switch (selectedAgent) {
    case "LocalAgent":
      results.push(...(await localAgent(prompt)));
      break;
    case "AppAgent":
      results.push(...(await appAgent(prompt)));
      break;
    default:
      throw new Error(`Unknown agent: ${selectedAgent}`);
  }

  const nestedResults = await Promise.all(
    results.map(async (result): Promise<Command | Command[]> => {
      if (result.isExc) {
        return result;
      } else {
        const selectedAgent = await taskRouterAgent(result.command);
        if (result.agent === selectedAgent) {
          // Multipurpose agent to handle infinite recursion
          return result;
        }
        return await agentHandler(selectedAgent, result.command);
      }
    })
  );

  return nestedResults.flat();
};

export default agentHandler;
