# ADR 005: Execution Context Propagation

## Status
Accepted

## Context
As executions become deeply nested (Planner -> Orchestrator -> Sub-Agent A -> Tool Call -> Sub-Agent B), we need a way to track the entire lineage of work for observability, cost attribution, memory storage, and debugging.

## Decision
We will pass an immutable `ExecutionContext` object down through every layer of the architecture.
Key properties include:
- `traceId`: The global identifier for the entire user request. Shared across all sub-agents.
- `runId`: The unique identifier for the current specific execution loop.
- `parentRunId`: The identifier of the agent that spawned the current run, creating a traversable execution tree.
- `delegationDepth`: To prevent infinite recursive delegation loops.

## Consequences
- Enables distributed tracing and timeline visualization in the UI.
- Enables accurate rollups of token usage and costs per trace.
- Requires strict discipline to ensure the context is passed to every service method.
