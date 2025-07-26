export interface Command {
  command: string;
  agent_type: "file" | "app";
  isItDangerous: boolean;
  description: string;
  placeholder?: string;
  context_link?: {
    dependsOnCommandNo: number;
    from: "src" | "dest";
    to: "src" | "dest";
  };
}

export interface CommandGeneratorOutput {
  commands: Command[];
}

export default CommandGeneratorOutput;
