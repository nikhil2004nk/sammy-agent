# ADR 003: Failures as Data (DelegationResult)

## Status
Accepted

## Context
When an agent executes a task or delegates to a sub-agent, failures are common. Tools might timeout, LLMs might hallucinate arguments, or max execution depths might be reached. If these are handled as standard JavaScript/TypeScript exceptions (`throw new Error()`), the execution thread crashes, aborting the entire plan and requiring human intervention to restart.

## Decision
We will treat failures as data. 
The Orchestrator's delegation methods will catch all execution exceptions and return a deterministic `DelegationResult` struct containing:
- `success: boolean`
- `status: 'COMPLETED' | 'FAILED' | 'REQUIRES_APPROVAL'`
- `output?: string`
- `errors?: string[]`

## Consequences
- The Runtime thread never crashes due to a tool or sub-agent failure.
- The Planner can inspect the `DelegationResult` and programmatically decide to retry the node, execute a fallback node, or abort gracefully.
