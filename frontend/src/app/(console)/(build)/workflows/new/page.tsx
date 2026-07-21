'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { workflowApi } from '@/services/api/workflow.service';
import { useMutation } from '@tanstack/react-query';
import { Check, X, AlertCircle } from 'lucide-react';

const INITIAL_TEMPLATE = {
  nodes: [
    {
      id: "start",
      type: "tool",
      tool: "gmail.send"
    }
  ],
  edges: []
};

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('New Workflow');
  const [jsonText, setJsonText] = useState(JSON.stringify(INITIAL_TEMPLATE, null, 2));
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => workflowApi.create(data),
    onSuccess: () => {
      router.push('/workflows');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create workflow');
    }
  });

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError('Invalid JSON. Cannot format.');
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(jsonText);
      setError(null);
      alert('JSON is valid!');
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleSave = () => {
    try {
      const parsedDefinition = JSON.parse(jsonText);
      setError(null);
      createMutation.mutate({
        name,
        definition: parsedDefinition,
        status: 'Draft',
        version: 1,
      });
    } catch (e: any) {
      setError(`Cannot save. Invalid JSON: ${e.message}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex-1">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-3xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 -ml-2 w-full"
            placeholder="Workflow Name"
          />
          <p className="text-muted-foreground mt-1 px-2">Create a new workflow from a JSON template.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/workflows')}>Cancel</Button>
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg shrink-0">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-card">
        <div className="flex items-center justify-between p-2 border-b bg-muted/50">
          <span className="text-sm font-medium px-2">Workflow JSON</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleFormat}>Format</Button>
            <Button variant="ghost" size="sm" onClick={handleValidate}>Validate</Button>
          </div>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="flex-1 w-full p-4 font-mono text-sm bg-transparent border-none outline-none resize-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
