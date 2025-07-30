import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import commandGenerator from "../systemPrompts/commandGenerator.js";
import CommandGeneratorOutputSchema from "../zodSchema/commandGenerator.js";
import CommandGeneratorOutput from "../types/commandGenerator.js";
import { getTopmostFolder } from "../utils/folderDetails.js";
import { openai } from "@ai-sdk/openai";

const generateCommands = async (prompt: string) => {
  const model = openai("gpt-4o-mini");
  const topFolder = await getTopmostFolder();

  let system = commandGenerator;
  if (topFolder) {
    system += `\n<additional_note>\n
      If no path is explicitly mentioned, use this as path: "${topFolder}"
      as example 
      "Create a file name Hello" should use "${topFolder}" as the default path. so the path will be "${topFolder}"/Hello"
      \n</additional_note>`;
  }

  const { object } = await generateObject<CommandGeneratorOutput>({
    model,
    prompt,
    schema: CommandGeneratorOutputSchema,
    system,
    output: "object",
  });
  return object.commands;
};

export default generateCommands;
