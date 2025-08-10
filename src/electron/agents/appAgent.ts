import { generateObject } from "ai";
import commandGenerator from "../systemPrompts/localAgent.js";
import LocalAgentOutputSchema from "../zodSchema/commandGenerator.js";
import ILocalAgent from "../types/commandGenerator.js";
import { openai } from "@ai-sdk/openai";
import appAgentSystemPrompt from "../systemPrompts/appAgent.js";

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

  object.commands.forEach((command) => {
    command.agent = "AppAgent";
  });

  return object.commands;
};

export default appAgent;
