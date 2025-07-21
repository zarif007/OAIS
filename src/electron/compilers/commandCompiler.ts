import { ShellCommand } from "../types/commandStructure.js";

function formatArgObject(arg: Record<string, any>): string[] {
  const parts: string[] = [];

  if (arg.positional) {
    parts.push(
      ...arg.positional.map((v: string) => (v.includes(" ") ? `"${v}"` : v))
    );
  }

  if (arg.keyValue) {
    for (const [k, v] of Object.entries(arg.keyValue)) {
      const vStr = String(v);
      parts.push(`${k}=${vStr.includes(" ") ? `"${vStr}"` : vStr}`);
    }
  }

  if (arg.flags) {
    parts.push(
      ...arg.flags.map((f: string) => (f.startsWith("-") ? f : `-${f}`))
    );
  }

  if (arg.src) {
    parts.push(arg.src.includes(" ") ? `"${arg.src}"` : arg.src);
  }

  if (arg.dest) {
    parts.push(arg.dest.includes(" ") ? `"${arg.dest}"` : arg.dest);
  }

  if (arg.new_name) {
    parts.push(arg.new_name.includes(" ") ? `"${arg.new_name}"` : arg.new_name);
  }

  if (arg.keywords) {
    parts.push(
      ...arg.keywords.map((k: string) => (k.includes(" ") ? `"${k}"` : k))
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
      result.push(...formatArgObject(arg));
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
      result.push(...formatArgObject(arg));
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
