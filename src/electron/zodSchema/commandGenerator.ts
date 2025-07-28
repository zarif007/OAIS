import { z } from "zod";

export const CommandSchema = z.object({
  command: z
    .string()
    .min(
      1,
      "The actual shell command to be executed. Example: 'rm -rf /folder'. Must not be empty."
    ),

  agent_type: z
    .string()
    .describe(
      "The type of agent that will execute this command. Example: 'file', 'app', 'media', etc."
    ),

  isItDangerous: z.boolean({
    required_error:
      "Specify whether the command is potentially destructive or irreversible.",
  }),

  description: z
    .string()
    .min(
      1,
      "A short, plain-language explanation of what this command does. Example: 'Deletes the /folder directory and all its contents'."
    ),

  placeholder: z
    .string()
    .optional()
    .describe("Command with placeholders. Example: 'mv <location> <location>'"),

  context_link: z
    .object({
      dependsOnCommandNo: z
        .number()
        .describe("The index (1-based) of the command this one depends on."),
      from: z.enum(["src", "dest"]),
      to: z.enum(["src", "dest"]),
    })
    .optional(),

  expected_output: z
    .string()
    .optional()
    .describe("What kind of output this command produces"),
});

export const CommandGeneratorOutputSchema = z.object({
  commands: z.array(CommandSchema),
});

export default CommandGeneratorOutputSchema;
