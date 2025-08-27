type CommandOutput = {
  [commandId: string]: {
    command: string;
    output: string;
  };
};

export function agentPromptBuilder(
  dependentCommands: CommandOutput[],
  command: string
): string {
  let prompt = `You are an intelligent agent that executes commands. You have access to the results of previously executed commands that are dependencies for your current task.

## CONTEXT - Previously Executed Commands:
The following commands have been executed and their outputs are available for your reference. Use this information to inform your execution of the current command:

`;

  if (dependentCommands.length === 0) {
    prompt += "No previous commands executed.\n\n";
  } else {
    dependentCommands.forEach((dep, index) => {
      Object.keys(dep).forEach((key) => {
        prompt += `### Command ${index + 1} (ID: ${key}):
**Executed:** ${dep[key].command}
**Output:** ${dep[key].output}

`;
      });
    });
  }

  prompt += `## CURRENT TASK:
Execute the following command, taking into account the context and outputs from the previous commands above:

**Command to Execute:** ${command}

## INSTRUCTIONS:
1. Analyze the previous command outputs to understand the current state and context
2. Execute the current command while considering any relevant information from the previous outputs
3. If the current command depends on data from previous commands, reference and use that data appropriately
4. Provide clear, actionable output that can be used by subsequent commands if needed
5. If there are any conflicts or issues with the previous command outputs, address them in your response

Please execute the current command now:`;

  return prompt;
}

export default agentPromptBuilder;
