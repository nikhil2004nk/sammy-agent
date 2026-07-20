'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { Run, ExecutionStatus, ExecutionNodeType } from './types';

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
  createdAt: number;
  endedAt?: number;
  terminationReason?: string;
  nodes?: BackendNode[];
  version: number;
}

// ---- Adapters ----

function normalizeStatus(s: string): ExecutionStatus {
  const map: Record<string, ExecutionStatus> = {
    queued: 'Queued',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    requires_action: 'Running', // treat as still-active
  };
  return map[s] ?? 'Running';
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
    startedAt: new Date(b.createdAt).toISOString(),
    finishedAt: b.endedAt ? new Date(b.endedAt).toISOString() : undefined,
    durationMs: b.endedAt ? b.endedAt - b.createdAt : undefined,
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
      const data: BackendRun[] = await apiClient(`/conversations/${conversationId}/runs`);
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
      const data: BackendRun = await apiClient(`/runs/${runId}`);
      return adaptRun(data);
    },
    enabled: !!runId,
    staleTime: 5_000,
  });
}

/**
 * useLiveRun — fetches the latest run for a conversation and adaptively polls it.
 * Polling rate adapts based on run status:
 *   Queued  → 500ms
 *   Running → 1000ms
 *   Terminal (Completed/Failed/Cancelled) → stops polling
 */
export function useLiveRun(conversationId: string | null): Run | null {
  // Step 1: fetch the list of runs (light poll to detect new runs)
  const { data: runs } = useQuery<Run[]>({
    queryKey: ['runs', conversationId],
    queryFn: async () => {
      const data: BackendRun[] = await apiClient(`/conversations/${conversationId}/runs`);
      return data.map(adaptRun);
    },
    enabled: !!conversationId,
    refetchInterval: 2000, // check for new runs every 2s
  });

  const latestRun = runs?.[0] ?? null;

  // Step 2: fetch the full run detail (with nodes) and adapt polling to status
  const { data: detailedRun } = useQuery<Run>({
    queryKey: ['run', latestRun?.id],
    queryFn: async () => {
      const data: BackendRun = await apiClient(`/runs/${latestRun!.id}`);
      return adaptRun(data);
    },
    enabled: !!latestRun?.id,
    refetchInterval: pollingInterval(latestRun?.status),
  });

  return detailedRun ?? latestRun;
}
