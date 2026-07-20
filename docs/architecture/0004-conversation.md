# 4. Centralizing State in the Conversation Module

Date: 2026-07-20

## Status
Accepted

## Context
As the agent executes, it accumulates a history of User requests, Assistant responses, Tool intents, and Tool results. Relying on simple arrays scattered across services is brittle and prevents advanced features like checkpoints, replays, and long-term persistence.

## Decision
We introduce a dedicated `ConversationModule` acting as the authoritative source of truth for execution state.
- **Message Mutability**: Messages are immutable. State transitions occur strictly through `ConversationService.appendMessage`.
- **Canonical Types**: We enforce `UserMessage`, `AssistantMessage`, `ToolMessage`, and `SystemMessage` universally, decoupling our internal model from provider-specific schemas (like OpenAI or Anthropic message formats).
- **Run Abstraction**: We introduce the `Run` concept to map a single execution pass against a conversation, enabling status tracking (`running`, `completed`, `requires_action`) and tracing.

## Consequences
- **Positive**: Makes integrating PostgreSQL persistence in the future trivial.
- **Positive**: Prepares the architecture for event-sourcing and audit logging.
- **Positive**: `PromptBuilder` becomes a pure function mapping canonical messages to LLM-specific payloads.
- **Negative**: Adds slight overhead to accessing message state.
