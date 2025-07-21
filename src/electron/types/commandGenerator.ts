export interface Command {
  command: string;
  agent_type: "file" | "app";
  isItDangerous: boolean;
  description: string;
}

interface CommandGeneratorOutput {
  commands: Command[];
}

export default CommandGeneratorOutput;
