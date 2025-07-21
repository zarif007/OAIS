import { z } from "zod";

export const CommandSchema = z.object({
  command: z
    .string()
    .min(
      1,
      "The actual shell command to be executed. Example: 'rm -rf /folder'. Must not be empty."
    ),

  agent_type: z.enum(["file", "app"], {
    errorMap: () => ({
      message:
        "Agent type must be either 'file' (e.g., for file system operations) or 'app' (e.g., for opening applications).",
    }),
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
});

const CommandGeneratorOutputSchema = z.object({
  commands: z.array(CommandSchema),
});

export default CommandGeneratorOutputSchema;
