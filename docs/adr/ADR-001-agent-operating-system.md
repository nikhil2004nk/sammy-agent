# ADR 001: Agent Operating System Architecture

## Status
Accepted

## Context
Sammy started as a conversational agent interface. However, the requirements for the system have expanded to include autonomous task execution, multi-agent collaboration, dynamic tool discovery (MCP), and long-term memory. A simple ReAct (Reasoning and Acting) loop tied directly to user chat input is insufficient to manage this complexity.

## Decision
We will architect Sammy as an **Agent Operating System**. 
Sammy will not just act as a chatbot but as a runtime that can orchestrate a graph of specialized, autonomous agents. The architecture will strictly decouple:
1. **Intelligence (Planner):** Figuring out what needs to be done.
2. **Execution (Runtime):** Actually doing the work.
3. **Capabilities (Registry):** Knowing who is authorized to do what.

## Consequences
- Increased initial architectural complexity.
- Requires strict dependency boundaries and clean architecture.
- Dramatically increases the ceiling of what the system can achieve (e.g., parallel background execution, autonomous retries, multi-agent handoffs).
