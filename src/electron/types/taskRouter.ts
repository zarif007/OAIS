import { agentList } from "../constants/agents.js";

export type TaskRouterOutput = {
  agent: (typeof agentList)[number];
};
