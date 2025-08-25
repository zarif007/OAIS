import { exec } from "child_process";
import * as util from "util";
import errorHandlingAgent from "../agents/errorHandlingAgent.js";

const execPromise = util.promisify(exec);

interface CommandResult {
  command: string;
  stdout: string;
  stderr: string;
}

async function commandsExecutor(commands: string[]): Promise<CommandResult[]> {
  const results: CommandResult[] = [];

  for (const command of commands) {
    console.log(`Executing: ${command}`);
    try {
      const { stdout, stderr } = await execPromise(command);
      results.push({
        command,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
      console.log(stdout);
    } catch (error: any) {
      console.error(`Error executing "${command}": ${error.message}`);
      // const { commands: cmds } = await errorHandlingAgent(
      //   command,
      //   error.message
      // );

      // console.error(`Error handling agent suggested to execute: ${cmds}`);
      // const res = await commandsExecutor(cmds);
      // results.push(...res);
    }
  }

  return results;
}

export default commandsExecutor;
