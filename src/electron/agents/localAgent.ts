import { generateObject } from "ai";
import localAgentSystemPrompt from "../systemPrompts/localAgent.js";
import LocalAgentOutputSchema from "../zodSchema/commandGenerator.js";
import ILocalAgent from "../types/commandGenerator.js";
import { getTopmostFolder } from "../utils/folderDetails.js";
import { openai } from "@ai-sdk/openai";
import resolvedPathName from "../utils/resolvedPathName.js";

const localAgent = async (prompt: string) => {
  const model = openai("gpt-4o-mini");
  const topFolder = await getTopmostFolder();

  let system = localAgentSystemPrompt("~");

  const { object } = await generateObject<ILocalAgent>({
    model,
    prompt,
    schema: LocalAgentOutputSchema,
    system,
    output: "object",
  });

  for (const command of object.commands) {
    command.agent = "LocalAgent";
    command.command = await resolvedPathName(command);
  }

  return object.commands;
};

export default localAgent;
