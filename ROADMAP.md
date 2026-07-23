# Sammy Agent: Architecture & Roadmap

## 1. Vision

Sammy is not a chatbot. Sammy is an **Agent Operating System (Agent OS)**. 

The goal of Sammy is to provide a production-grade AI Agent Platform—conceptually aligned with frameworks like OpenAI Agents, Manus, Claude Code, and LangGraph—that serves as the foundational runtime and orchestration layer for intelligent agent systems. 

The platform is designed from the ground up to support multi-agent orchestration, dynamic task decomposition, Model Context Protocol (MCP) tool execution, long-term memory, directed workflows, human-in-the-loop approvals, and multi-tenant SaaS capabilities at scale.

## 2. Mission

The mission of Sammy is to separate the *intelligence* of AI agents from the *infrastructure* required to run them safely. By formalizing execution boundaries, state management, and tool access, Sammy allows developers to focus on building specialized, goal-driven agents without having to reinvent the underlying orchestration, observability, and scaling primitives.

## 3. Design Philosophy

Every architectural decision in Sammy is governed by the following philosophies:

- **Planning before execution:** Action without intent leads to unpredictable behavior. Agents must formulate a plan before invoking tools or sub-agents.
- **Goals instead of conversations:** Agents are delegated discrete goals bounded by context, rather than being handed open-ended chat histories.
- **Stateless runtime with contextual execution:** The runtime execution environment remains entirely stateless. State, memory, and permissions are injected dynamically via the Execution Context.
- **Failures are data, not exceptions:** Execution errors are returned as structured results. This allows the planning layer to reason about failures and decide whether to retry, fallback, or escalate.
- **Extensible by design:** The platform relies on registries (Capabilities, Tools, Memory). New capabilities are introduced by registering them, not by altering core orchestration logic.
- **Observability first:** If it cannot be traced, it cannot be trusted. Every state change, tool call, and delegation must be tied to a distributed trace ID.
- **Event-driven:** System boundaries communicate via a robust event bus, ensuring that monitoring, logging, and asynchronous workflows can be deeply decoupled from the execution path.

---

## 4. Current State

The core infrastructure and baseline execution models are fully functional and production-ready.

**Core Platform:**
- Modular NestJS architecture
- PostgreSQL + Prisma for persistence
- Authentication, RBAC, and multi-tenant Workspaces
- Event Bus for decoupled messaging

**LLM Abstraction:**
- Provider-agnostic abstraction layer (currently supporting OpenAI)
- Factory pattern for model resolution and prompt building

**Execution Runtime:**
- Core Agent loop and Agent Orchestrator
- Tool execution engine
- Execution graph persistence
- **Nested Agent Delegation:** Full support for `parentRunId`, `traceId`, `delegationDepth`, and goal-based delegation boundaries.

**Model Context Protocol (MCP):**
- MCP Manager, Registry, and Discovery layer
- Health monitoring and capability resolution for external tools
- OAuth connection management

**Frontend:**
- Next.js application with Dashboard
- Execution timeline visualization, connections, and observability UI

---

## 5. Execution Lifecycle

Every execution within Sammy follows a strict canonical lifecycle. This ensures predictability and traceability regardless of the complexity of the agent or workflow.

```text
User Goal
    ↓
Intent Analysis
    ↓
Planning
    ↓
Task Graph
    ↓
Capability Resolution
    ↓
Execution
    ↓
Reflection
    ↓
Memory Update
    ↓
Completion
```

---

## 6. Architecture Principles

1. **Planning and execution are strictly separated.** The Planner formulates intent; the Runtime blindly executes it.
2. **Context is bounded.** Agents only receive the exact memory, tools, and budget required to accomplish their specific goal.
3. **Failures are data.** Execution engines return structured result objects. The Planner owns the logic for retries and fallbacks.
4. **Everything is observable.** There are no "hidden" actions. Every decision and execution step shares a common Trace ID.
5. **Goals are delegated.** Sub-agents act as specialized workers fulfilling discrete objectives, not conversational peers.

---

## 7. Core Architectural Boundaries

Clear separation of concerns is critical for scaling the platform.

| Component | Responsibility |
| :--- | :--- |
| **Planner** | Decides *what* should happen by decomposing goals into task graphs. |
| **Capability Resolver** | Decides *who* can perform a task by querying the Agent Registry. |
| **Runtime** | Manages the execution lifecycle, bounds contexts, and handles state. |
| **Agent Orchestrator** | Executes delegated work by spawning sub-runs and invoking the agent loop. |
| **Memory** | Supplies relevant semantic/episodic context and persists new learnings. |
| **Workflow Engine** | Defines and executes static topological graphs (DAGs, branching, retries). |
| **Scheduler** | Determines *when* execution occurs based on cron or event triggers. |
| **MCP Layer** | Bridges the gap between the platform and external systems/tools. |
| **Observability** | Explains *why* an execution behaved as it did via metrics and tracing. |
| **Approval System** | Enforces human-in-the-loop policies for high-risk actions. |

---

## 8. Execution Context (The "Agent OS" Environment)

The `ExecutionContext` is the vehicle that bounds an agent's reality. As the platform matures, this context will expand to encompass strict budgets, permissions, and subsets of memory.

```typescript
interface ExecutionContext {
  // Identification
  runId: string;
  traceId: string;
  parentRunId?: string;
  
  // Environment
  workspaceId: string;
  userId: string;
  
  // Intent
  goal: string;
  taskId?: string;
  planId?: string;
  
  // Contextual Data
  memory: {
    semanticMemory: any[];
    episodicMemory: any[];
    retrievedContext: any[];
  };
  
  // Capabilities
  tools: {
    availableTools: string[];
    permissions: string[];
  };
  
  // Constraints
  budget: {
    delegationDepth: number;
    tokenBudget: number;
    costBudget: number;
    timeout: number;
  };
  
  // Execution Control
  retryPolicy: RetryPolicy;
  cancellationToken: CancellationToken;
}
```

---

## 9. Execution Constraints

To guarantee stability in a multi-tenant environment, the platform enforces hard limits on all executions. Without these guardrails, recursive agent loops could exhaust system resources or generate massive LLM costs.

- **Maximum delegation depth:** Prevents infinite loops of agents calling agents.
- **Token budget:** Hard limit on combined input/output tokens per run.
- **Cost budget:** Execution halts if projected LLM API costs exceed a threshold.
- **Timeout:** Maximum wall-clock time allowed for an agent to reach a terminal state.
- **Max tool calls:** Prevents hallucinating agents from spamming external APIs.
- **Retry limits:** Maximum attempts for failed tool calls or sub-agent delegations.

---

## 10. Planner Responsibilities

The Planner is the "Brain" of the operation. It must be isolated from the physical execution of tasks.
- Understands user intent and disambiguates goals.
- Builds logical execution plans and task graphs.
- Selects the appropriate agents or workflows via the Capability Resolver.
- Chooses which tools are authorized for a given plan.
- Decides how to handle execution failures (e.g., replan, retry, escalate).
- Evaluates whether the original goal was successfully completed.

## 11. Runtime Responsibilities

The Runtime is the "Engine". It is entirely devoid of reasoning capabilities.
- Spawns isolated execution environments based on the Execution Context.
- Tracks execution state and persists graph nodes to the database.
- Manages physical tool invocations and network requests via MCP.
- Emits lifecycle events to the Event Bus.
- Enforces execution constraints, budgets, and timeouts.
- Handles run cancellations and gracefully halts execution.

---

## 12. Agent Contract

To ensure that agents remain interchangeable and extensible, every agent on the platform must conform to a standardized lifecycle contract.

```text
Goal Assigned
    ↓
Plan (Determine approach based on tools & memory)
    ↓
Execute (Invoke tools or delegate sub-goals)
    ↓
Reflect (Assess if the execution satisfied the goal)
    ↓
Return Structured Result
```

---

## 13. Structured Results

In traditional software, exceptions are thrown when operations fail. In an Agent OS, **failures are data**.

If a tool or sub-agent throws an unhandled exception, it crashes the host process. If it returns a structured result (e.g., `DelegationResult`, `ToolExecutionResult`), the Planner can read the failure context and adapt dynamically.

**Example `DelegationResult`:**
```typescript
{
  success: boolean;
  agentId: string;
  runId: string;
  status: 'COMPLETED' | 'FAILED' | 'REQUIRES_APPROVAL';
  output: string;
  toolCalls: number;
  cost: number;
  duration: number;
  errors: string[];
}
```
This paradigm gives the Planner control over resilience, enabling fallback strategies without risking system stability.

---

## 14. Event-Driven Architecture

Sammy utilizes a central Event Bus. Major state transitions emit discrete events, allowing auxiliary systems (metrics, billing, websockets for UI updates) to react without tightly coupling to the execution runtime.

- `RunStarted` / `RunCompleted`
- `DelegationStarted` / `DelegationCompleted`
- `ToolExecuted`
- `MemoryWritten`
- `ApprovalRequested` / `ApprovalResolved`
- `WorkflowStarted` / `WorkflowCompleted`

---

## 15. Observability

Observability is a non-negotiable requirement. For users to trust autonomous agents, the platform must guarantee that every action can be audited. The following must always be traceable against a single `Trace ID`:

- **Trace ID & Parent-Child Run relationships:** To visualize the execution tree.
- **Planner Decisions:** The reasoning behind *why* an agent or tool was selected.
- **Tool calls:** Inputs provided to the tool and the raw outputs received.
- **Memory operations:** What context was retrieved or written during the run.
- **Financials:** Token usage and calculated cost per node.
- **Performance:** Latency of LLM calls, tool execution, and total run duration.
- **Interventions:** Retries triggered by the runtime and human approvals requested.

---

## 16. Development Phases

The evolution of Sammy is broken down into architecture-driven phases.

### Phase 3: Intelligent Planning
* **Vision:** Transform the system from reactive loops to proactive, goal-driven planning.
* **Goals:** Introduce Task decomposition, dynamic agent selection, and reflection.
* **Deliverables:** A dedicated Planner Service; modification of Orchestrator to return `DelegationResult`.
* **Success Criteria:** The system can receive a complex goal, break it into three distinct sub-tasks, and execute them sequentially without manual intervention.

### Phase 4: Memory
* **Vision:** Give agents context across sessions to personalize execution.
* **Goals:** Implement Semantic and Episodic memory layers.
* **Deliverables:** Vector database integration; memory retrieval injected directly into the `ExecutionContext`.
* **Success Criteria:** Agents can recall user preferences from a previous session and alter their plan accordingly.

### Phase 5: Multi-Agent Collaboration
* **Vision:** Enable specialized, independent agents to solve problems collectively.
* **Goals:** Build the Capability Resolver and Agent Registry.
* **Deliverables:** Pluggable registry; support for parallel execution (`Promise.all()`) of independent sub-runs.
* **Success Criteria:** The Planner can dynamically select a "Research Agent" and a "Code Agent" to operate in tandem based on the goal.

### Phase 6: Workflow Engine
* **Vision:** Allow static, guaranteed topologies for critical business processes.
* **Goals:** First-class Directed Acyclic Graph (DAG) support.
* **Deliverables:** Workflow runner capable of branching, loops, and retry topologies.
* **Success Criteria:** Users can define a strict 5-step workflow that orchestrates agents without relying on the LLM Planner for routing.

### Phase 7: Human Approval
* **Vision:** Ensure high-risk actions remain under human control.
* **Goals:** Centralize policy enforcement.
* **Deliverables:** Planner integration capable of pausing execution and emitting an `ApprovalRequested` event.
* **Success Criteria:** An agent attempting to modify a production database halts execution and resumes successfully only after explicit UI approval.

### Phase 8: Scheduling
* **Vision:** Support autonomous, asynchronous operations.
* **Goals:** Enable agents to operate on chron triggers.
* **Deliverables:** Cron-based scheduler interacting with the Workflow Engine.
* **Success Criteria:** An agent can be scheduled to run a daily system audit, outputting the result to memory.

### Phase 9: Production Platform
* **Vision:** Create an enterprise-ready Agent Marketplace and observability suite.
* **Goals:** Advanced UI, billing, and packaging.
* **Deliverables:** Extensible Agent Marketplace; complete end-to-end execution tree visualization.
* **Success Criteria:** A third-party developer can register a new Agent capability without modifying Sammy's source code.

---

## 17. Long-Term Vision

The ultimate architecture represents a clean separation of concerns, ensuring Sammy can scale to support complex, multi-agent enterprise deployments.

```text
                    User
                      │
                      ▼
             Conversation Runtime
                      │
                      ▼
                   Planner
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
Capability Resolver   │     Workflow Engine
         │            │            │
         └────────────┼────────────┘
                      ▼
              Agent Orchestrator
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Research       Coding       Reviewer
     Agent         Agent         Agent
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                 MCP Runtime
                      │
                      ▼
               External Systems
```

---

## 18. Future Research

The following concepts represent the bleeding edge of AI orchestration. They are intentionally deferred from the immediate roadmap to ensure the core execution platform remains stable and predictable.

- **Hierarchical Planning:** Planners that spawn sub-planners for massive task trees.
- **Swarm Intelligence:** Hundreds of micro-agents operating without strict centralization.
- **Federated Memory:** Cross-workspace anonymized knowledge sharing.
- **Distributed Execution:** Running sub-agents on entirely different physical servers or serverless functions.
- **Reinforcement Learning:** Agents updating their own prompts based on structured success/failure metrics.
- **Self-Improving Agents:** Agents generating tests and iterating on their own source logic.
- **Agent Negotiation:** Sub-agents debating over constraints (e.g., budget vs. quality) before executing a task.
