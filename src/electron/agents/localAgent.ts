import { generateObject } from "ai";
import commandGenerator from "../systemPrompts/localAgent.js";
import LocalAgentOutputSchema from "../zodSchema/commandGenerator.js";
import ILocalAgent from "../types/commandGenerator.js";
import { getTopmostFolder } from "../utils/folderDetails.js";
import { openai } from "@ai-sdk/openai";

const localAgent = async (prompt: string) => {
  const model = openai("gpt-4o-mini");
  const topFolder = await getTopmostFolder();

  let system = commandGenerator(topFolder ?? "~");

  const { object } = await generateObject<ILocalAgent>({
    model,
    prompt,
    schema: LocalAgentOutputSchema,
    system,
    output: "object",
  });
  return object.commands;
};

export default localAgent;
