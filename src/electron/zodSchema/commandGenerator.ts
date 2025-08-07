import { z } from "zod";

export const CommandSchema = z.object({
  command: z
    .string()
    .min(
      1,
      "The actual shell command to be executed. Example: 'rm -rf /folder'. Must not be empty."
    ),

  isExc: z.boolean({
    required_error:
      "Is it executable? Specify whether this command can be run directly in a shell.",
  }),

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
});

export const LocalAgentOutputSchema = z.object({
  commands: z.array(CommandSchema),
});

export default LocalAgentOutputSchema;
