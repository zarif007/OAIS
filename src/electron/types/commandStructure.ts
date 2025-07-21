export type ArgObject = {
  src?: string;
  dest?: string;
  new_name?: string;
  keywords?: string[];
  positional?: string[];
  keyValue?: Record<string, string>;
  flags?: string[];

  [key: string]: any;
};

export type ShellCommand = {
  command: string;
  subCommand?: string;
  args?: ArgObject[];
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
  agent_type: "file" | "app";
  rawCommand?: string;
};

export type CommandStructure = {
  commands: ShellCommand[];
};
