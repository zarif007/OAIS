export interface Command {
  commandId: string;
  command: string;
  isItDangerous: boolean;
  description: string;
  placeholder?: string;
  agent?: string;
  dependsOn: string[];
  output: string;
}

export interface ILocalAgent {
  commands: Command[];
}

export default ILocalAgent;
