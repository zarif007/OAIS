export type Subtask = {
  taskId: string;
  command: string;
  agentType: "LocalAgent" | "AppAgent";
  dependsOn: string[];
};

export interface ITaskOrchestratorOutput {
  subtasks: Subtask[];
}
