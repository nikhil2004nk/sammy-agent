# 5. Connection and Credential Abstraction

Date: 2026-07-20

## Status
Accepted

## Context
When interacting with MCP servers or external APIs, the platform needs a way to supply authentication context. Initially, the platform was conceived to hold Google OAuth logic natively. This approach tightly coupled the orchestrator to provider-specific details and scaled poorly for multi-tenancy or new integrations (e.g., GitHub, Slack).

## Decision
We abstract credentials behind a `Connection` model. 
- **ConnectionContext**: Requests specify *who* needs access (Tenant, User, Server).
- **ConnectionFactory**: Uses registered `ConnectionProvider` implementations to fulfill the request.
- **ResolvedConnection**: The output is an agnostic transport configuration (headers, env vars, URIs) passed blindly to the MCP adapter.
- The platform does **not** know about "refresh tokens" or "access tokens" explicitly—it simply acts as an infrastructure layer to pass resolved connection metadata into the execution pipeline.

## Consequences
- **Positive:** Credentials are cleanly separated from tool execution logic.
- **Positive:** Scalable to generic OAuth, API Key, and JWT-based providers.
- **Positive:** The Manager remains responsible only for discovery, lifecycle, and health—not user authentication.
- **Negative:** Adds complexity to the execution pipeline, requiring connections to be resolved synchronously per-request.
