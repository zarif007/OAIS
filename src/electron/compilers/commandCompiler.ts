import { ShellCommand } from "../types/commandStructure.js";

function formatArgObject(arg: Record<string, any>): string[] {
  const parts: string[] = [];
  if (arg.positional) {
    parts.push(...arg.positional);
  }
  if (arg.keyValue) {
    for (const [k, v] of Object.entries(arg.keyValue)) {
      parts.push(`${k}=${v}`);
    }
  }
  if (arg.flags) {
    parts.push(
      ...arg.flags.map((f: string) => (f.startsWith("-") ? f : `-${f}`))
    );
  }
  return parts;
}

function compileFileAgentCommand(cmd: ShellCommand): string {
  let result: string[] = [];

  if (cmd.sudo) result.push("sudo");
  if (cmd.nohup) result.push("nohup");
  if (cmd.subshell) result.push("(");

  if (cmd.env) {
    const envVars = Object.entries(cmd.env)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");
    if (envVars) result.push(envVars);
  }

  result.push(cmd.command);

  if (cmd.subCommand) result.push(cmd.subCommand);
  if (cmd.options) result.push(...cmd.options);
  if (cmd.longOptions) result.push(...cmd.longOptions);

  if (cmd.raw && cmd.rawPosition) {
    if (cmd.rawPosition === "replace") {
      result = [cmd.raw];
    } else if (cmd.rawPosition === "before") {
      result.unshift(cmd.raw);
    } else if (cmd.rawPosition === "after") {
      result.push(cmd.raw);
    }
  }

  if (cmd.args) {
    for (const arg of cmd.args) {
      const formatted = formatArgObject(arg);
      result.push(...formatted);
    }
  }

  if (cmd.stdin) result.unshift(`${cmd.stdin} |`);

  if (typeof cmd.redirect === "string") {
    result.push(`> ${cmd.redirect}`);
  } else if (cmd.redirect && typeof cmd.redirect === "object") {
    if (cmd.redirect.stdout) {
      const op = cmd.redirect.stdoutAppend ? ">>" : ">";
      result.push(`${op} ${cmd.redirect.stdout}`);
    }
    if (cmd.redirect.stderr) {
      const op = cmd.redirect.stderrAppend ? "2>>" : "2>";
      result.push(`${op} ${cmd.redirect.stderr}`);
    }
  }

  if (cmd.background) result.push("&");
  if (cmd.subshell) result.push(")");

  return result.join(" ").trim();
}

function compileAppAgentCommand(cmd: ShellCommand): string {
  let result: string[] = [];

  if (cmd.sudo) result.push("sudo");
  if (cmd.nohup) result.push("nohup");
  if (cmd.subshell) result.push("(");

  if (cmd.env) {
    const envVars = Object.entries(cmd.env)
      .map(([key, value]) => `export ${key}=${value}`)
      .join("; ");
    if (envVars) result.push(envVars);
  }

  result.push(cmd.command);

  if (cmd.subCommand) result.push(cmd.subCommand);
  if (cmd.options)
    result.push(
      ...cmd.options.map((opt) => (opt.startsWith("-") ? opt : `--${opt}`))
    );
  if (cmd.longOptions) result.push(...cmd.longOptions);

  if (cmd.raw && cmd.rawPosition) {
    if (cmd.rawPosition === "replace") {
      result = [cmd.raw];
    } else if (cmd.rawPosition === "before") {
      result.unshift(cmd.raw);
    } else if (cmd.rawPosition === "after") {
      result.push(cmd.raw);
    }
  }

  if (cmd.args) {
    for (const arg of cmd.args) {
      const formatted = formatArgObject(arg);
      result.push(...formatted);
    }
  }

  if (cmd.stdin) result.unshift(`${cmd.stdin} |`);

  if (typeof cmd.redirect === "string") {
    result.push(`> ${cmd.redirect}`);
  } else if (cmd.redirect && typeof cmd.redirect === "object") {
    if (cmd.redirect.stdout) {
      const op = cmd.redirect.stdoutAppend ? ">>" : ">";
      result.push(`${op} ${cmd.redirect.stdout}`);
    }
    if (cmd.redirect.stderr) {
      const op = cmd.redirect.stderrAppend ? "2>>" : "2>";
      result.push(`${op} ${cmd.redirect.stderr}`);
    }
  }

  if (cmd.background) result.push("&");
  if (cmd.subshell) result.push(")");

  let compiled = result.join(" ").trim();
  // if (cmd.chainWith) compiled += ` ${cmd.chainWith}`;
  return compiled;
}

function commandCompiler(commands: ShellCommand[]): string[] {
  const compiledCommands: string[] = [];

  for (const cmd of commands) {
    if (cmd.agent_type === "file") {
      compiledCommands.push(compileFileAgentCommand(cmd));
    } else if (cmd.agent_type === "app") {
      compiledCommands.push(compileAppAgentCommand(cmd));
    } else {
      throw new Error(`Unknown agent_type: ${cmd.agent_type}`);
    }
  }

  return compiledCommands;
}

export default commandCompiler;
