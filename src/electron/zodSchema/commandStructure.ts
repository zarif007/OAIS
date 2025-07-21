import { z } from "zod";

export const ArgObjectSchema = z
  .object({
    src: z.string().optional(),
    dest: z.string().optional(),
    new_name: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    positional: z.array(z.string()).optional(),
    keyValue: z.record(z.string(), z.string()).optional(),
    flags: z.array(z.string()).optional(),
  })
  .catchall(z.any());

export const ShellCommandSchema = z.object({
  command: z
    .string()
    .describe("The main command, e.g., 'git', 'mv', 'echo', 'open'."),
  subCommand: z
    .string()
    .optional()
    .describe("Optional subcommand, e.g., 'commit' for 'git commit'."),
  args: z
    .array(ArgObjectSchema)
    .optional()
    .describe("Array of argument objects for the command."),

  options: z
    .array(z.string())
    .optional()
    .describe("Short options like -r, -f."),
  longOptions: z
    .array(z.string())
    .optional()
    .describe("Long options like --force, --recursive."),

  raw: z
    .string()
    .optional()
    .describe("Raw string to inject directly into command."),
  rawPosition: z
    .enum(["before", "after", "replace"])
    .optional()
    .describe("Where to place raw string in the command."),

  env: z
    .record(z.string(), z.string())
    .optional()
    .describe("Environment variables to use with the command."),
  cwd: z
    .string()
    .optional()
    .describe("The working directory where the command is run."),
  timeout: z
    .number()
    .optional()
    .describe("Max time to allow command to run in milliseconds."),

  stdin: z.string().optional().describe("Text to be piped into the command."),
  redirect: z
    .union([
      z.object({
        stdout: z.string().optional().describe("File to redirect stdout to."),
        stderr: z.string().optional().describe("File to redirect stderr to."),
        stdoutAppend: z
          .boolean()
          .optional()
          .describe("Append instead of overwrite stdout."),
        stderrAppend: z
          .boolean()
          .optional()
          .describe("Append instead of overwrite stderr."),
      }),
      z.string().describe("Shortcut string path for stdout redirection."),
    ])
    .optional()
    .describe("Handles output redirection."),

  chainWith: z
    .enum(["&&", "||", ";", "|", "&"])
    .optional()
    .describe("Command chaining operator."),

  sudo: z
    .boolean()
    .optional()
    .describe("Whether to prefix command with 'sudo'."),
  background: z
    .boolean()
    .optional()
    .describe("Whether to run command in the background."),
  subshell: z
    .boolean()
    .optional()
    .describe("Whether to wrap command in parentheses."),
  nohup: z
    .boolean()
    .optional()
    .describe("Use 'nohup' to ignore hangup signals."),

  comment: z.string().optional().describe("Comment about the command."),
  label: z.string().optional().describe("Label for the command."),
  agent_type: z
    .enum(["file", "app"])
    .describe("Type of agent executing the command."),

  rawCommand: z
    .string()
    .optional()
    .describe("Entire pre-formatted command string."),
});

export const CommandStructureSchema = z.object({
  commands: z.array(ShellCommandSchema),
});
