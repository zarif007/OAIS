import { generateObject } from "ai";
import LocalAgentOutputSchema from "../zodSchema/commandGenerator.js";
import ILocalAgent from "../types/commandGenerator.js";
import { openai } from "@ai-sdk/openai";
import appAgentSystemPrompt from "../systemPrompts/appAgent.js";
import errorHandlingAgentSystemPrompt from "../systemPrompts/errorHandlingAgent.js";
import errorHandlingAgentSchema from "../zodSchema/errorHandlingAgent.js";
import IErrorHandlingAgent from "../types/errorHandlingAgent.js";

const errorHandlingAgent = async (command: string, error: string) => {
  const model = openai("gpt-4o-mini");

  const prompt = `
    The Executed Command: "${command}" 
    The Error Message: "${error}"
  `;

  const { object } = await generateObject<IErrorHandlingAgent>({
    model,
    prompt,
    schema: errorHandlingAgentSchema,
    system: errorHandlingAgentSystemPrompt,
    output: "object",
  });

  return object;
};

export default errorHandlingAgent;
