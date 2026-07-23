import { useState, useEffect, useCallback } from 'react';

export type NodeStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ExecutionNode {
  id: string;
  type: string;
  title: string;
  status: NodeStatus;
  startedAt?: number;
  finishedAt?: number;
  payload?: any;
  agentName?: string;
}

export interface StreamEvent {
  type: string;
  data: any;
}

export function useExecutionStream(executionId: string | null, workspaceId: string) {
  const [nodes, setNodes] = useState<Record<string, ExecutionNode>>({});
  const [runStatus, setRunStatus] = useState<string>('PENDING');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!executionId) {
      setNodes({});
      setRunStatus('PENDING');
      setIsConnected(false);
      return;
    }

    const url = new URL(`http://localhost:3001/executions/${executionId}/stream`);

    let abortController = new AbortController();
    
    const connect = async () => {
      try {
        setIsConnected(true);
        const response = await fetch(url.toString(), {
          headers: {
            'x-workspace-id': workspaceId,
            'Accept': 'text/event-stream',
          },
          credentials: 'include',
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to stream: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          
          buffer = lines.pop() || ''; // Keep the last incomplete part in the buffer

          for (const chunk of lines) {
            const dataMatch = chunk.match(/data: (.*)/);
            if (dataMatch) {
              try {
                const event = JSON.parse(dataMatch[1]);
                handleEvent(event);
              } catch (e) {
                console.error('Failed to parse SSE JSON', e);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('SSE Error:', err);
        }
      } finally {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      abortController.abort();
    };
  }, [executionId, workspaceId]);

  const handleEvent = useCallback((event: any) => {
    const { type, data } = event;
    
    switch (type) {
      case 'run.started':
        setRunStatus('RUNNING');
        break;
      case 'run.updated':
        if (data.status) setRunStatus(data.status);
        break;
      case 'run.completed':
        setRunStatus('COMPLETED');
        break;
      case 'run.failed':
        setRunStatus('FAILED');
        break;
      case 'node.created':
      case 'node.updated':
        setNodes(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            ...data
          }
        }));
        break;
    }
  }, []);

  return {
    nodes: Object.values(nodes).sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0)),
    runStatus,
    isConnected,
  };
}
