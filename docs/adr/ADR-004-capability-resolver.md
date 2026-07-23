# ADR 004: Dynamic Capability Resolution

## Status
Accepted

## Context
In a multi-agent system, a central Planner orchestrates work. If the Planner hardcodes agent IDs (e.g., `executeTask('agent-sql-reader')`), the system becomes tightly coupled. If the SQL agent is renamed, removed, or replaced by a better agent, the Planner breaks.

## Decision
We will implement an `ICapabilityResolver` interface.
- The Planner will declare what *capabilities* are needed to fulfill a task (e.g., `requiredCapabilities: ['database-read', 'data-analysis']`).
- The `CapabilityResolverService` will query the `AgentRegistryService` to find the most appropriate Agent Identity that possesses those capabilities at runtime.

## Consequences
- **Pros:** Perfect decoupling. The Planner doesn't need to know the specific identities of the workforce. Agents can be hot-swapped or upgraded without changing planning logic.
- **Cons:** Requires a robust registry and matching algorithm to ensure capabilities are accurately fulfilled.
