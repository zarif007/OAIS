export interface Command {
  command: string;
  agent_type: string;
  isItDangerous: boolean;
  description: string;
  placeholder?: string;
  context_link?: {
    dependsOnCommandNo: number;
    from: "src" | "dest";
    to: "src" | "dest";
  };
  expected_output?: string;
}

export interface CommandGeneratorOutput {
  commands: Command[];
}

export default CommandGeneratorOutput;
