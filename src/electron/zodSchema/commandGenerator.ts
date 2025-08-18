import { z } from "zod";

export const CommandSchema = z.object({
  commandId: z
    .string()
    .min(1, "Unique identifier for the command. Must not be empty."),
  command: z
    .string()
    .min(
      1,
      "The actual shell command to be executed. Example: 'rm -rf /folder'. Must not be empty."
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
  agent: z
    .string()
    .optional()
    .describe("The agent responsible for executing the command."),
  dependsOn: z.array(z.string()),
  output: z.string(),
});

export const LocalAgentOutputSchema = z.object({
  commands: z.array(CommandSchema),
});

export default LocalAgentOutputSchema;
