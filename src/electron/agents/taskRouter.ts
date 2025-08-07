import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { TaskRouterOutput } from "../types/taskRouter.js";
import { TaskRouterSchema } from "../zodSchema/taskRouter.js";
import taskRouterSystemPrompt from "../systemPrompts/taskRoute.js";

const taskRouterAgent = async (prompt: string) => {
  const model = openai("gpt-4o-mini");

  const { object } = await generateObject<TaskRouterOutput>({
    model,
    prompt,
    schema: TaskRouterSchema,
    system: taskRouterSystemPrompt,
    output: "object",
  });
  return object.agent;
};

export default taskRouterAgent;
