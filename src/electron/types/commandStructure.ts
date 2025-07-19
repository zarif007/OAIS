export type ShellCommand = {
  command: string;
  subCommand?: string;
  args?: string[];
  options?: string[];
  longOptions?: string[];
  raw?: string;
  rawPosition?: "before" | "after" | "replace";
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
  stdin?: string;
  redirect?:
    | {
        stdout?: string;
        stderr?: string;
        stdoutAppend?: boolean;
        stderrAppend?: boolean;
      }
    | string;
  chainWith?: "&&" | "||" | ";" | "|" | "&";
  sudo?: boolean;
  background?: boolean;
  subshell?: boolean;
  nohup?: boolean;
  comment?: string;
  label?: string;
  agent_type: "file_agent" | "app_agent";
  rawCommand?: string;
};

type CommandStructure = {
  commands: ShellCommand[];
};

export default CommandStructure;
