import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import commandGenerator from "../systemPrompts/commandGenerator.js";
import CommandGeneratorOutputSchema from "../zodSchema/commandGenerator.js";
import CommandGeneratorOutput from "../types/commandGenerator.js";

const generateCommands = async (prompt: string) => {
  const model = groq("llama-3.3-70b-versatile");
  const { object } = await generateObject<CommandGeneratorOutput>({
    model,
    prompt,
    schema: CommandGeneratorOutputSchema,
    system: commandGenerator,
    output: "object",
  });
  return object.commands;
};

export default generateCommands;
