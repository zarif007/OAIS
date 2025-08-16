import { z } from "zod";

export const TaskSchema = z.object({
  taskId: z.string(),
  command: z.string(),
  agentType: z.enum(["LocalAgent", "AppAgent"]),
  dependsOn: z.array(z.string()),
});

export const TaskOrchestratorResponseSchema = z.object({
  subtasks: z.array(TaskSchema),
});
