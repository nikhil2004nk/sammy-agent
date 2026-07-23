# ADR-007: Evolution from Agent Registry to Agent Platform

## Context
In Phase 3, we built a simple, seeded `RegistryModule` that stored agent tool capabilities in-memory. However, as the ecosystem scales to support multiple specialized agents running in parallel, a static registry is no longer sufficient. 
Agents must be treated as independent entities with their own lifecycles, health checks, permissions, and cost profiles. To support multi-tenant workspaces and complex orchestrations, we need a robust database-backed platform to manage them.

## Decision
We are evolving the simple "Registry" into a full-fledged **Agent Platform** with the following structural pillars:

1. **Rich Database Schema (Agent & Capability):**
   - We are introducing `Agent` and `Capability` as distinct, versioned entities in PostgreSQL (via Prisma).
   - They are connected via a many-to-many `AgentCapability` join table.
   - The schema supports rich metadata, constraints (unique keys per workspace), and execution modes.

2. **Decoupled Lifecycle & Health:**
   - A clear distinction between an Agent's logical `status` (`ACTIVE`, `INACTIVE`, `DISABLED`, `DEPRECATED`) and its operational `healthStatus` (`HEALTHY`, `UNHEALTHY`, `MAINTENANCE`).
   - A dedicated `AgentLifecycleService` handles health checks, heartbeats, and availability independently of the core registry service.

3. **Intent-Based Platform API:**
   - The platform API shifts from simple CRUD (e.g., `updateAgent()`) to semantic intent operations: `register()`, `activate()`, `deprecate()`, etc., ensuring state transitions are controlled and logged.

4. **Selection Strategies:**
   - Instead of the `CapabilityResolver` hardcoding the logic to pick an agent, we use the `IAgentSelectionStrategy` abstraction. 
   - We can dynamically inject strategies like `CostAware` or `LatencyAware` depending on the current user's preferences or SLAs.

5. **Delegation Contracts:**
   - When one agent delegates to another, it now passes a strict `DelegationContract` defining the goal, budget, constraints, and timeout, ensuring deterministic handoffs and accountability.

6. **Agent Identity & Policies:**
   - Agents explicitly declare their `AgentIdentity` and `AgentPolicies` (e.g., `canUseInternet`, `requiresApproval`), moving permissions away from the runtime executor and directly onto the agent definition.

7. **No Hot-Reload (For Now):**
   - To manage complexity and ensure consistency, we will not support live hot-reloading of agent definitions in this phase. The interfaces are built to accommodate it eventually.

## Consequences
- **Positive:** The system is now fully prepared for multi-tenancy, dynamic agent discovery, marketplace features, and policy-driven routing.
- **Negative:** Increased initial complexity in schema design and service decoupling.
