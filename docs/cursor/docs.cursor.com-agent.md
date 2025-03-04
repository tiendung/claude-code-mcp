# Agent

> AI assistant that uses tools and reasoning to perform coding tasks with minimal supervision

You can delegate tasks to Cursor Agent and let it work alongside you. Agent performs its work in [Composer](/composer) and is built on top of it. Make sure to read about [Composer](/composer) to best work with Agent.

## Tools

Agent has access to multiple tools, including

* Reading & Writing code
* Searching codebase
* Call [MCP](/context/model-context-protocol) servers
* Run terminal commands
* Automatic web search for up-to-date information

The reasoning capabilities of Agent enables some very powerful workflows where it can perform many consecutive actions without much supervision. When needed, Agent will automatically search the web to find relevant information, documentation, or examples to help with your task.

<Frame>
  <video src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/agent/agent-mcp-postgres.mp4" autoPlay loop muted playsInline />
</Frame>

<Tip>
  Agent can make up to 25 tool calls before stopping. When the limit is reached, you can press "Continue"
  to let Agent make more tool calls (every "Continue" call is counted as one [request](/account/usage)).
</Tip>

### Terminal

When Agent runs terminal commands, it uses VS Code's terminal profiles to determine which shell to use. It iterates through the available profiles, starting with the default one, and selects the first profile that supports command detection. This means the shell used by Agent might differ from your default system shell if another compatible terminal profile is found first.

To change which terminal profile is used:

1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Search for "Terminal: Select Default Profile"
3. Select your preferred terminal profile

## Yolo mode

With Yolo mode enabled, Agent can execute terminal commands by itself. This especially useful when running test suites. Instruct Agent with a task and how to verify changes (running a test), and it will continue until the task is completed.

### Guardrails

You can define guardrails and allow/deny lists for certain commands you don't want Agent to run automatically. This is done from Cursor Settings

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/agent/yolo-settings.png" style={{ padding: 32, background: "#181818" }} />
</Frame>

## Rules

You can direct the Agent with [rules](/context/rules-for-ai). They can auto attached to any Agent request based on glob patterns, or the Agent can grab one based on the rule description.

Read more about how you can [work with rules](/context/rules-for-ai)

## Use Agent

Start by opening a new Composer and enable Agent mode. From there, you can give it instructions on what work to perform.

<Frame>
  <video src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/agent/agent-toggle.mp4" autoPlay loop muted playsInline />
</Frame>

## Models

You can use `claude-3.5-sonnet`, `gpt-4o` and `o3-mini` with Agent today. We'll be adding more models soon!

## FAQ

### What's the difference between Agent and Composer?

You can toggle between Normal and Agent mode in Composer. The main difference is that Agent will think harder, use reasoning and tools to solve problems thrown at it. Normal mode (Edit) is for single-turn edits, while Ask mode helps you understand and explore your code.
