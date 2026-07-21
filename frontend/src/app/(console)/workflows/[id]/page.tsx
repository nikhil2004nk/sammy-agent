'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { workflowApi } from '@/services/api/workflow.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle, Play, ArrowLeft } from 'lucide-react';

export default function EditWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowApi.get(id),
  });

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setJsonText(JSON.stringify(workflow.definition, null, 2));
    }
  }, [workflow]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => workflowApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      alert('Saved successfully');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update workflow');
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
      updateMutation.mutate({
        name,
        definition: parsedDefinition,
      });
    } catch (e: any) {
      setError(`Cannot save. Invalid JSON: ${e.message}`);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading workflow...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex-1 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 w-full"
              placeholder="Workflow Name"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-primary border-primary hover:bg-primary/10"
            onClick={() => router.push(`/workflows/${id}/run`)}
          >
            <Play className="w-4 h-4 mr-2" /> Run
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save'}
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
