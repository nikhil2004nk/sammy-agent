# 1. The Execution Context and Runtime Separation

Date: 2026-07-20

## Status
Accepted

## Context
As an AI Agent platform, Sammy needs to handle requests gracefully. Early iterations embedded the reasoning loop (ReAct) directly into the Execution Service. As we plan to support background jobs, distributed workers, scheduling, and multi-agent coordination, intertwining lifecycle management with reasoning logic creates a monolithic bottleneck.

## Decision
We abstract the execution lifecycle from the autonomous reasoning loop. 
- **ExecutionService**: Owns the request boundaries. It generates the `ExecutionContext` (containing trace IDs, tenant IDs, conversation IDs, etc.), emits standardized telemetry, and handles top-level error boundaries.
- **AgentLoopService**: Owns the actual autonomous behavior, decoupled entirely from the entry-point HTTP requests or background job triggers.

## Consequences
- **Positive:** We can trigger the agent loop from REST endpoints, cron schedulers, or message queues uniformly.
- **Positive:** Telemetry and error handling are standardized.
- **Negative:** Adds a slight layer of indirection for simple requests.
