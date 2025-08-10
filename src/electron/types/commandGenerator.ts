export interface Command {
  command: string;
  isExc: boolean;
  isItDangerous: boolean;
  description: string;
  placeholder?: string;
  agent?: string;
}

export interface ILocalAgent {
  commands: Command[];
}

export default ILocalAgent;
