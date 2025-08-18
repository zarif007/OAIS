import { generateObject } from "ai";
import LocalAgentOutputSchema from "../zodSchema/commandGenerator.js";
import ILocalAgent from "../types/commandGenerator.js";
import { openai } from "@ai-sdk/openai";
import appAgentSystemPrompt from "../systemPrompts/appAgent.js";
import resolvedAppName from "../utils/resolvedAppName.js";

const appAgent = async (prompt: string) => {
  const model = openai("gpt-4o-mini");

  let system = appAgentSystemPrompt;

  const { object } = await generateObject<ILocalAgent>({
    model,
    prompt,
    schema: LocalAgentOutputSchema,
    system,
    output: "object",
  });

  for (const command of object.commands) {
    command.agent = "AppAgent";
    command.command = await resolvedAppName(command);
  }

  return object.commands;
};

export default appAgent;
