import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { TaskRouterOutput } from "../types/taskRouter.js";
import { TaskRouterSchema } from "../zodSchema/taskRouter.js";
import taskOrchestratorSystemPrompt from "../systemPrompts/taskOrchestrator.js";
import { ITaskOrchestratorOutput } from "../types/taskOrchestrator.js";
import { TaskOrchestratorResponseSchema } from "../zodSchema/taskOrchestrator.js";

const taskOrchestrator = async (prompt: string) => {
  const model = openai("gpt-4o-mini");

  const { object } = await generateObject<ITaskOrchestratorOutput>({
    model,
    prompt,
    schema: TaskOrchestratorResponseSchema,
    system: taskOrchestratorSystemPrompt,
    output: "object",
  });

  return object.subtasks;
};

export default taskOrchestrator;
