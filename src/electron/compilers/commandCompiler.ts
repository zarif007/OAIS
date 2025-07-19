import { ShellCommand } from "../types/commandStructure.js";

function compileFileAgentCommand(cmd: ShellCommand): string {
  let result: string[] = [];

  if (cmd.sudo) {
    result.push("sudo");
  }

  if (cmd.nohup) {
    result.push("nohup");
  }

  if (cmd.subshell) {
    result.push("(");
  }

  if (cmd.env) {
    const envVars = Object.entries(cmd.env)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");
    if (envVars) {
      result.push(envVars);
    }
  }

  result.push(cmd.command);

  if (cmd.subCommand) {
    result.push(cmd.subCommand);
  }

  if (cmd.options) {
    result.push(...cmd.options);
  }

  if (cmd.longOptions) {
    result.push(...cmd.longOptions);
  }

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
    result.push(...cmd.args);
  }

  if (cmd.stdin) {
    result.unshift(`${cmd.stdin} |`);
  }

  if (typeof cmd.redirect === "string") {
    result.push(`> ${cmd.redirect}`);
  } else if (cmd.redirect && typeof cmd.redirect === "object") {
    if (cmd.redirect.stdout) {
      const operator = cmd.redirect.stdoutAppend ? ">>" : ">";
      result.push(`${operator} ${cmd.redirect.stdout}`);
    }
    if (cmd.redirect.stderr) {
      const operator = cmd.redirect.stderrAppend ? "2>>" : "2>";
      result.push(`${operator} ${cmd.redirect.stderr}`);
    }
  }

  if (cmd.background) {
    result.push("&");
  }

  if (cmd.subshell) {
    result.push(")");
  }

  let compiled = result.join(" ");
  // if (cmd.chainWith) {
  //   compiled += ` ${cmd.chainWith}`;
  // }

  return compiled.trim();
}

function compileAppAgentCommand(cmd: ShellCommand): string {
  let result: string[] = [];

  if (cmd.sudo) {
    result.push("sudo");
  }

  if (cmd.nohup) {
    result.push("nohup");
  }

  if (cmd.subshell) {
    result.push("(");
  }

  if (cmd.env) {
    const envVars = Object.entries(cmd.env)
      .map(([key, value]) => `export ${key}=${value}`)
      .join("; ");
    if (envVars) {
      result.push(envVars);
    }
  }

  result.push(cmd.command);

  if (cmd.subCommand) {
    result.push(cmd.subCommand);
  }

  if (cmd.options) {
    result.push(
      ...cmd.options.map((opt) => (opt.startsWith("-") ? opt : `--${opt}`))
    );
  }

  if (cmd.longOptions) {
    result.push(...cmd.longOptions);
  }

  if (cmd.raw && cmd.rawPosition) {
    if (cmd.rawPosition === "replace") {
      result = [cmd.raw];
    } else if (cmd.rawPosition === "before") {
      result.unshift(cmd.raw);
    } else if (cmd.rawPosition === "after") {
      result.push(cmd.raw);
    }
  }

  // Add arguments
  if (cmd.args) {
    result.push(...cmd.args);
  }

  // Handle stdin (app_agent might handle piping differently)
  if (cmd.stdin) {
    result.unshift(`${cmd.stdin} |`);
  }

  // Handle redirect (app_agent might log differently)
  if (typeof cmd.redirect === "string") {
    result.push(`> ${cmd.redirect}`);
  } else if (cmd.redirect && typeof cmd.redirect === "object") {
    if (cmd.redirect.stdout) {
      const operator = cmd.redirect.stdoutAppend ? ">>" : ">";
      result.push(`${operator} ${cmd.redirect.stdout}`);
    }
    if (cmd.redirect.stderr) {
      const operator = cmd.redirect.stderrAppend ? "2>>" : "2>";
      result.push(`${operator} ${cmd.redirect.stderr}`);
    }
  }

  // Handle background
  if (cmd.background) {
    result.push("&");
  }

  // Close subshell
  if (cmd.subshell) {
    result.push(")");
  }

  // Handle chaining
  let compiled = result.join(" ");
  if (cmd.chainWith) {
    compiled += ` ${cmd.chainWith}`;
  }

  return compiled.trim();
}

// Main commandCompiler function
function commandCompiler(commands: ShellCommand[]): string[] {
  const compiledCommands: string[] = [];

  for (const cmd of commands) {
    if (cmd.agent_type === "file_agent") {
      compiledCommands.push(compileFileAgentCommand(cmd));
    } else if (cmd.agent_type === "app_agent") {
      compiledCommands.push(compileAppAgentCommand(cmd));
    } else {
      throw new Error(`Unknown agent_type: ${cmd.agent_type}`);
    }
  }

  return compiledCommands;
}

export default commandCompiler;
