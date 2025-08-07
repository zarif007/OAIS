import { z } from "zod";

import { agentList } from "../constants/agents.js";

export const TaskRouterSchema = z.object({
  agent: z.enum(agentList),
});
