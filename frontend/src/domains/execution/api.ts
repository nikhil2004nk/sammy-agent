'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { 
  Run, 
  ExecutionStatus, 
  ExecutionNodeType,
  ExecutionEvent,
  NodeCreatedPayload,
  NodeUpdatedPayload,
  MessageDeltaPayload,
  MessageCompletedPayload,
  RunUpdatedPayload,
  RunCompletedPayload,
  RunFailedPayload
} from './types';
import { conversationKeys } from '../conversation/api';
import type { Message } from '@/services/api/conversation/types';

// ---- Backend DTO shapes ----

interface BackendNode {
  id: string;
  runId: string;
  parentId?: string;
  type: string;
  status: string;
  title: string;
  payload?: unknown;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  agentName?: string;
}

interface BackendRun {
  id: string;
  conversationId: string;
  status: string;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
  terminationReason?: string;
  nodes?: BackendNode[];
  version?: number;
}

// ---- Adapters ----

function normalizeStatus(s: string): ExecutionStatus {
  if (!s) return 'Running';
  const map: Record<string, ExecutionStatus> = {
    queued: 'Queued',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    requires_action: 'Running', // treat as still-active
  };
  return map[s.toLowerCase()] ?? 'Running';
}

function normalizeNodeType(t: string): ExecutionNodeType {
  const known: ExecutionNodeType[] = ['reasoning', 'tool', 'planner', 'approval', 'workflow', 'reflection', 'agent', 'event'];
  return known.includes(t as ExecutionNodeType) ? (t as ExecutionNodeType) : 'event';
}

function adaptRun(b: BackendRun): Run {
  const nodes = (b.nodes ?? []).map((n) => ({
    id: n.id,
    runId: n.runId,
    parentId: n.parentId,
    type: normalizeNodeType(n.type),
    status: normalizeStatus(n.status),
    name: n.title,
    agentName: n.agentName,
    content: n.type === 'reasoning' ? (typeof n.payload === 'string' ? n.payload : JSON.stringify(n.payload ?? '')) : undefined,
    arguments: n.type === 'tool' ? n.payload : undefined,
    startedAt: new Date(n.startedAt).toISOString(),
    finishedAt: n.finishedAt ? new Date(n.finishedAt).toISOString() : undefined,
    durationMs: n.duration,
  }));

  const toolCount = nodes.filter((n) => n.type === 'tool').length;

  return {
    id: b.id,
    conversationId: b.conversationId,
    status: normalizeStatus(b.status),
    startedAt: new Date(b.startedAt).toISOString(),
    finishedAt: b.finishedAt ? new Date(b.finishedAt).toISOString() : undefined,
    durationMs: b.duration,
    totalTools: toolCount,
    nodes,
  };
}

// ---- Polling interval helper ----

function pollingInterval(status: ExecutionStatus | undefined): number | false {
  if (!status) return false;
  if (status === 'Queued') return 500;
  if (status === 'Running') return 1000;
  return false; // Completed, Failed, Cancelled → stop
}

// ---- Hooks ----

export function useRuns(conversationId: string | null) {
  return useQuery<Run[]>({
    queryKey: ['runs', conversationId],
    queryFn: async () => {
      const data: BackendRun[] = await apiClient(`/conversations/${conversationId}/executions`);
      return data.map(adaptRun);
    },
    enabled: !!conversationId,
    staleTime: 5_000,
  });
}

export function useRun(runId: string | null) {
  return useQuery<Run>({
    queryKey: ['run', runId],
    queryFn: async () => {
      const data: BackendRun = await apiClient(`/executions/${runId}`);
      return adaptRun(data);
    },
    enabled: !!runId,
    staleTime: 5_000,
  });
}

export function useLiveRun(conversationId: string | null): Run | null {
  const queryClient = useQueryClient();

  // Step 1: fetch the list of runs (to detect new runs and get the latest run ID)
  const { data: runs } = useQuery<Run[]>({
    queryKey: ['runs', conversationId],
    queryFn: async () => {
      const data: BackendRun[] = await apiClient(`/conversations/${conversationId}/executions`);
      return data.map(adaptRun);
    },
    enabled: !!conversationId,
  });

  const latestRun = runs?.[0] ?? null;

  // Step 2: fetch the full run detail (with nodes) initially
  const { data: detailedRun } = useQuery<Run>({
    queryKey: ['run', latestRun?.id],
    queryFn: async () => {
      const data: BackendRun = await apiClient(`/executions/${latestRun!.id}`);
      return adaptRun(data);
    },
    enabled: !!latestRun?.id,
    staleTime: Infinity, // Rely on SSE for updates
  });

  // Step 3: Open EventSource to listen for updates
  useEffect(() => {
    if (!latestRun?.id) return;

    // We only connect if the run isn't terminal, 
    // or if you want to be safe, just connect and let the server close it or just listen.
    if (detailedRun && (detailedRun.status === 'Completed' || detailedRun.status === 'Failed' || detailedRun.status === 'Cancelled')) {
      return;
    }

    // Connect to SSE stream
    const workspaceId = useAuthStore.getState().activeWorkspaceId;
    const eventSource = new EventSource(`http://localhost:3001/executions/${latestRun.id}/stream?workspaceId=${workspaceId}`, { withCredentials: true });

    eventSource.onopen = () => {
      // On reconnect, we fetch the run to reconcile any missed events
      queryClient.invalidateQueries({ queryKey: ['run', latestRun.id] });
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed: ExecutionEvent = JSON.parse(event.data);
        
        queryClient.setQueryData<Run>(['run', latestRun.id], (oldData) => {
          if (!oldData) return oldData;

          switch (parsed.type) {
            case 'run.updated': {
              const p = parsed.payload as RunUpdatedPayload;
              return { ...oldData, status: p.status, totalTools: p.toolCount ?? oldData.totalTools };
            }
            case 'run.completed': {
              const p = parsed.payload as RunCompletedPayload;
              return { ...oldData, status: 'Completed', durationMs: p.durationMs ?? oldData.durationMs };
            }
            case 'run.failed': {
              const p = parsed.payload as RunFailedPayload;
              return { ...oldData, status: 'Failed', durationMs: p.durationMs ?? oldData.durationMs };
            }
            case 'node.created': {
              const p = parsed.payload as NodeCreatedPayload;
              const newNode = {
                id: p.id,
                runId: oldData.id,
                parentId: p.parentId,
                type: p.type,
                status: p.status,
                name: p.title,
                agentName: p.agentName,
                content: p.type === 'reasoning' ? (typeof p.payload === 'string' ? p.payload : JSON.stringify(p.payload ?? '')) : undefined,
                arguments: p.type === 'tool' ? p.payload : undefined,
                startedAt: new Date(p.startedAt).toISOString(),
              };
              return { ...oldData, nodes: [...oldData.nodes, newNode] };
            }
            case 'node.updated': {
              const p = parsed.payload as NodeUpdatedPayload;
              return {
                ...oldData,
                nodes: oldData.nodes.map(n => 
                  n.id === p.id ? { 
                    ...n, 
                    status: p.status, 
                    finishedAt: p.finishedAt ? new Date(p.finishedAt).toISOString() : n.finishedAt,
                    durationMs: p.duration ?? n.durationMs
                  } : n
                )
              };
            }
            case 'message.delta': {
              const p = parsed.payload as MessageDeltaPayload;
              
              // 1. Update the chat messages directly
              queryClient.setQueryData<Message[]>(conversationKeys.messages(latestRun.conversationId), (oldMessages) => {
                if (!oldMessages) return oldMessages;
                return oldMessages.map((msg, idx, arr) => {
                  // Find the last assistant message (which should be the optimistic one)
                  const isTarget = msg.role === 'assistant' && idx === arr.findLastIndex(x => x.role === 'assistant');
                  if (isTarget) {
                    // Remove 'Thinking...' placeholder if it's the first delta
                    const currentContent = msg.content === 'Thinking...' ? '' : (msg.content || '');
                    return { ...msg, content: currentContent + p.delta };
                  }
                  return msg;
                });
              });

              // 2. Update the run nodes
              return {
                ...oldData,
                nodes: oldData.nodes.map((n, idx, arr) => {
                  const isTarget = p.nodeId ? n.id === p.nodeId : (n.type === 'reasoning' && idx === arr.findLastIndex(x => x.type === 'reasoning'));
                  if (isTarget) {
                    return { ...n, content: (n.content || '') + p.delta };
                  }
                  return n;
                })
              };
            }
            case 'message.completed': {
              const p = parsed.payload as MessageCompletedPayload;
              
              // 1. Update the chat messages directly
              queryClient.setQueryData<Message[]>(conversationKeys.messages(latestRun.conversationId), (oldMessages) => {
                if (!oldMessages) return oldMessages;
                return oldMessages.map((msg, idx, arr) => {
                  const isTarget = msg.role === 'assistant' && idx === arr.findLastIndex(x => x.role === 'assistant');
                  if (isTarget) {
                    return { ...msg, status: 'completed', parts: [{ type: 'text', content: p.content }] };
                  }
                  return msg;
                });
              });

              // 2. Update the run nodes
              return {
                ...oldData,
                nodes: oldData.nodes.map((n, idx, arr) => {
                  const isTarget = p.nodeId ? n.id === p.nodeId : (n.type === 'reasoning' && idx === arr.findLastIndex(x => x.type === 'reasoning'));
                  if (isTarget) {
                    return { ...n, content: p.content };
                  }
                  return n;
                })
              };
            }
            default:
              return oldData;
          }
        });
      } catch (e) {
        console.error('Failed to parse SSE event', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error', error);
      // EventSource automatically attempts reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [latestRun?.id, detailedRun?.status, queryClient]);

  return detailedRun ?? latestRun;
}
