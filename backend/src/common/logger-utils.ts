import { ExecutionContext } from './execution-context';

export function formatLog(context: ExecutionContext, message: string): string {
  const trace = context.traceId || 'no-trace';
  const conv = context.conversationId || 'no-conv';
  const ws = context.workspaceId || 'no-ws';
  return `[Exec: ${trace}] [Conv: ${conv}] [WS: ${ws}] ${message}`;
}
