'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useWorkflow, useRunWorkflow } from '@/services/api/workflow';
import { Play, ArrowLeft, AlertCircle } from 'lucide-react';

export default function RunWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: workflow, isLoading } = useWorkflow(id);

  const runMutation = useRunWorkflow();
  
  // Custom wrapper since the hook structure is slightly different now
  const triggerRun = () => {
    runMutation.mutate(
      { id, payload: { goal, context, instructions } },
      {
        onSuccess: (data) => router.push(`/executions/${data.runId}`),
        onError: (err: any) => setError(err.message || 'Failed to start workflow run'),
      }
    );
  };

  const handleRun = () => {
    if (!goal.trim()) {
      setError('Goal is required.');
      return;
    }
    setError(null);
    triggerRun();
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
      <div className="flex items-center gap-4 border-b pb-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/workflows/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Run Workflow</h1>
          <p className="text-muted-foreground">{workflow?.name}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg shrink-0">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="flex flex-col gap-6 flex-1">
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal <span className="text-destructive">*</span></label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Research OpenAI pricing"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conversation Context <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Any previous conversation history or context..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Instructions <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 border rounded-lg bg-background resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Any specific constraints or guidelines..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Agent</label>
          <div className="w-full p-3 border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed">
            System Default Agent
          </div>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <Button 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12"
          onClick={handleRun}
          disabled={runMutation.isPending}
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          {runMutation.isPending ? 'Starting...' : 'Run'}
        </Button>
      </div>
    </div>
  );
}
