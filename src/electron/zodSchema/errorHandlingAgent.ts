import { z } from "zod";

const errorHandlingAgentSchema = z.object({
  commands: z.array(z.string()).describe("List of commands to execute."),
  isExc: z.boolean().optional().describe("If this command is executable."),
});

export default errorHandlingAgentSchema;
