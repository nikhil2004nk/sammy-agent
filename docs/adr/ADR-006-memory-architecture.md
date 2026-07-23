# ADR-006: Memory as an Architectural Subsystem

## Context
As Sammy evolves into a true Agent OS, the original implementation of "Memory" (a simple wrapper around a vector database for semantic search) proved insufficient. We needed to distinguish between transient scratchpad data, episodic execution history, semantic facts, and procedural instructions, while ensuring that the Planner and Runtime remain decoupled from the underlying storage mechanisms. 

Furthermore, we recognized a critical domain distinction: **Agent Memory** (internal state, experiences, facts learned) must be structurally separated from **Knowledge** (external documents, RAG).

## Decision
We have elevated Memory to a first-class architectural subsystem governed by the following principles:

1. **Memory vs. Knowledge Separation:**
   - Memory is agent-centric, representing what the agent has done and learned.
   - Knowledge is workspace-centric, representing external reference material. RAG will be handled in a separate `KnowledgeModule`.

2. **The MemoryManager Orchestrator:**
   - We introduced the `MemoryManager` to sit between the public `MemoryService` (used by the Planner) and the concrete Memory Providers.
   - The `MemoryManager` enforces a deterministic retrieval pipeline (Merge → Deduplicate → Rank → Budget) and write pipeline (Evaluate → Route).

3. **Interface-Driven Providers:**
   - Providers (Episodic, Semantic) are hidden behind the `IMemoryProvider` interface.
   - The Planner and MemoryManager do not know the underlying database implementation.

4. **Infrastructural Boundaries (Embeddings & Vector Store):**
   - Vector storage and embedding generation are treated as infrastructural details.
   - We introduced `IEmbeddingProvider` and `IVectorStore`. The Semantic Provider merely orchestrates these two services, ensuring we can easily swap OpenAI for local embeddings, or pgvector for Pinecone, without rewriting agent logic.

5. **Memory Strategies:**
   - The Planner uses a `PLANNING` strategy to request broad, deep context.
   - The legacy runtime loop uses a `FAST` strategy for immediate episodic recall.

6. **Event-Driven Lifecycle:**
   - Memory operations emit events (`memory.created`, `memory.expired`, etc.) via the `EventBusService`, allowing the rest of the OS (like the Reflection Engine) to react to memory state changes dynamically.

7. **Policy System:**
   - Actions like TTL expiration, deduplication, and compression are handled by pluggable `IMemoryPolicy` implementations, keeping the core pipeline clean.

## Consequences
- **Positive:** The Planner is fully decoupled from vector databases and embeddings. We can seamlessly swap embedding models or vector stores. The multi-tiered pipeline enables complex behaviors like forgetting (TTL) and ranking.
- **Negative:** Increased architectural complexity. There are more interfaces and pipelines to traverse to retrieve a simple memory string.
