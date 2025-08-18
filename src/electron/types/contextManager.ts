interface IContextManager {
  [taskId: string]: {
    [commandId: string]: {
      command: string;
      output: string;
    };
  };
}

export default IContextManager;
