# ADR 002: Planner & Runtime Separation

## Status
Accepted

## Context
In early prototypes of AI agents, the LLM is placed in a `while(true)` loop where it simultaneously plans its next step, executes a tool, parses the result, and loops. This creates a "God Object" anti-pattern where the LLM prompt becomes bloated with planning instructions, tool schemas, state management, and retry logic all at once.

## Decision
We will strictly separate the **Planner** from the **Runtime**.
- The **Planner** receives an `Intent`, queries memory, and outputs a declarative `ExecutionPlan` consisting of a Directed Acyclic Graph (DAG) of `Task` nodes. The Planner does not execute tools.
- The **Runtime** receives an `ExecutionPlan` and simply evaluates the DAG, delegating the tasks to the appropriate specialized agents via the `AgentLoop`. 

## Consequences
- **Pros:** Prompts become highly focused. A planning prompt only thinks about strategy. An execution prompt only thinks about doing a specific task.
- **Pros:** Plans can be presented to a human for approval *before* any action is taken.
- **Cons:** Requires a robust orchestrator to traverse the DAG.
