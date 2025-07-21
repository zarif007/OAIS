import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import commandCompiler from "../compilers/commandCompiler.js";
import { CommandStructure } from "../types/commandStructure.js";
import commandParserSystemPrompt from "../systemPrompts/commandParser.js";
import { CommandStructureSchema } from "../zodSchema/commandStructure.js";
import { Command } from "../types/commandGenerator.js";

const parseCommands = async (commands: Command[]) => {
  const model = groq("llama-3.3-70b-versatile");
  const rawCommands = commands.map((command) => command.command);
  const promptInput =
    `Here are the shell commands I want you to parse:\n\n` +
    rawCommands.map((cmd, i) => `${i + 1}. ${cmd}`).join("\n");

  const { object } = await generateObject<CommandStructure>({
    model,
    prompt: promptInput,
    schema: CommandStructureSchema,
    system: commandParserSystemPrompt,
    output: "object",
  });
  return object.commands;
};

export default parseCommands;
