import { Run } from './types';

const now = Date.now();

export const mockRun: Run = {
  id: 'run-42',
  conversationId: 'conv-123',
  status: 'Completed',
  startedAt: new Date(now - 2000).toISOString(),
  finishedAt: new Date(now).toISOString(),
  durationMs: 2000,
  totalTools: 1,
  nodes: [
    {
      id: 'node-1',
      runId: 'run-42',
      type: 'event',
      name: 'Run Started',
      status: 'Completed',
      startedAt: new Date(now - 2000).toISOString(),
      finishedAt: new Date(now - 2000).toISOString(),
    },
    {
      id: 'node-2',
      runId: 'run-42',
      type: 'reasoning',
      content: 'I need to find recent invoices in the user\'s Gmail. I will use the gmail.search tool.',
      status: 'Completed',
      agentName: 'Jarvis',
      startedAt: new Date(now - 1900).toISOString(),
      finishedAt: new Date(now - 1600).toISOString(),
      durationMs: 300,
    },
    {
      id: 'node-3',
      runId: 'run-42',
      type: 'tool',
      name: 'gmail.search',
      status: 'Completed',
      agentName: 'Jarvis',
      arguments: {
        query: 'subject:invoice has:attachment',
        maxResults: 5
      },
      result: {
        count: 14,
        messages: [
          { id: 'msg1', snippet: 'Invoice for web hosting attached.' },
          { id: 'msg2', snippet: 'Your monthly receipt.' }
        ]
      },
      startedAt: new Date(now - 1500).toISOString(),
      finishedAt: new Date(now - 1100).toISOString(),
      durationMs: 400,
    },
    {
      id: 'node-4',
      runId: 'run-42',
      type: 'event',
      name: 'Tool Completed',
      status: 'Completed',
      startedAt: new Date(now - 1100).toISOString(),
      finishedAt: new Date(now - 1100).toISOString(),
    },
    {
      id: 'node-5',
      runId: 'run-42',
      type: 'reasoning',
      content: 'I found 14 invoices. I will summarize the results for the user.',
      status: 'Completed',
      agentName: 'Jarvis',
      startedAt: new Date(now - 1000).toISOString(),
      finishedAt: new Date(now - 500).toISOString(),
      durationMs: 500,
    },
    {
      id: 'node-6',
      runId: 'run-42',
      type: 'event',
      name: 'Run Completed',
      status: 'Completed',
      startedAt: new Date(now).toISOString(),
      finishedAt: new Date(now).toISOString(),
    }
  ]
};
