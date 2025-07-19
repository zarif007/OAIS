import { exec } from "child_process";
import * as util from "util";

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
    } catch (error: any) {
      console.error(`Error executing "${command}": ${error.message}`);
      results.push({
        command,
        stdout: "",
        stderr: error.message,
      });
    }
  }

  return results;
}

export default commandsExecutor;
