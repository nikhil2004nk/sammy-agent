# 3. Decoupling the Agent Loop, Step, and Execution

Date: 2026-07-20

## Status
Accepted

## Context
An autonomous agent operates in a continuous loop: Think -> Decide -> Act -> Observe. In early iterations, this logic was confined within a single `while` loop that directly built prompts, queried the LLM, and executed tools. As we introduce Memory, Planning, Workflow Engines, and Multi-Agent Routing, a single loop becomes a monolithic God-class.

## Decision
We decouple the autonomous orchestration into three distinct layers:
1. **AgentLoopService**: Orchestrates the top-level loop, bounded by `maxReasoningSteps`. Evaluates explicit termination reasons (`Completed`, `MaxStepsReached`, `ToolFailure`).
2. **AgentStepService**: Evaluates the state and performs *exactly one* reasoning step. It outputs a rich `AgentAction` union type (`tool_call`, `respond`, `finish`, `human_approval`, `cancel`).
3. **ActionExecutorService**: Intercepts the `AgentAction` and translates it into physical execution (e.g., routing `tool_call` actions to the `ToolExecutorService` and normalizing the output).

## Consequences
- **Positive:** We can trivially insert Memory before the PromptBuilder, Planners before the Step Service, and Workflow logic inside the Action Executor.
- **Positive:** Testing a single reasoning step does not require orchestrating a mocked while loop.
- **Negative:** Increased class count and structural complexity.
