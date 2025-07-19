import { z } from "zod";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { commandGenerator } from "../systemPrompts/commandGenerator.js";
import CommandStructure from "../types/commandStructure.js";
import commandCompiler from "../compilers/commandCompiler.js";

export const ShellCommandSchema = z.object({
  command: z.string(),
  subCommand: z.string().optional(),
  args: z.array(z.string()).optional(),

  options: z.array(z.string()).optional(),
  longOptions: z.array(z.string()).optional(),

  raw: z.string().optional(),
  rawPosition: z.enum(["before", "after", "replace"]).optional(),

  env: z.record(z.string(), z.string()).optional(),
  cwd: z.string().optional(),
  timeout: z.number().optional(),

  stdin: z.string().optional(),
  redirect: z
    .union([
      z.object({
        stdout: z.string().optional(),
        stderr: z.string().optional(),
        stdoutAppend: z.boolean().optional(),
        stderrAppend: z.boolean().optional(),
      }),
      z.string(),
    ])
    .optional(),

  chainWith: z.enum(["&&", "||", ";", "|", "&"]).optional(),

  sudo: z.boolean().optional(),
  background: z.boolean().optional(),
  subshell: z.boolean().optional(),
  nohup: z.boolean().optional(),

  comment: z.string().optional(),
  label: z.string().optional(),
  agent_type: z.enum(["file_agent", "app_agent"]),

  rawCommand: z.string().optional(),
});

export const CommandStructureSchema = z.object({
  commands: z.array(ShellCommandSchema),
});

const generateCommands = async (prompt: string) => {
  const model = groq("llama-3.3-70b-versatile");
  const { object } = await generateObject<CommandStructure>({
    model,
    prompt,
    schema: CommandStructureSchema,
    system: commandGenerator,
    output: "object",
  });
  const commands = commandCompiler(object.commands);
  return commands;
};

export default generateCommands;
