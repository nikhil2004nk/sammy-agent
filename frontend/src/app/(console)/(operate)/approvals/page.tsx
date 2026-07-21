'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi, Approval } from '@/services/api/approval.service';
import { Button } from '@/components/ui/button';
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  // Poll for approvals every 5 seconds
  const { data: approvals, isLoading, error } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => approvalApi.list(),
    refetchInterval: 5000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvalApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => approvalApi.reject(id, { reason: 'Rejected via UI' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleReject = (id: string) => rejectMutation.mutate(id);

  const pendingApprovals = approvals?.filter(a => a.status === 'Pending') || [];
  const pastApprovals = approvals?.filter(a => a.status !== 'Pending') || [];

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Approvals</h1>
        <p className="text-muted-foreground">Manage pending actions that require your authorization.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" /> Loading approvals...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> Failed to load approvals.
        </div>
      )}

      {!isLoading && !error && pendingApprovals.length === 0 && (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center">
          <Check className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg">No pending approvals</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      )}

      {!isLoading && pendingApprovals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Pending</h2>
          {pendingApprovals.map(approval => (
            <div key={approval.id} className="border rounded-xl p-6 bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                    {approval.tool}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Run ID: {approval.runId}
                  </span>
                </div>
                
                <div className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(approval.arguments, null, 2)}
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <Button 
                  onClick={() => handleApprove(approval.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white w-full flex justify-start"
                >
                  <Check className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button 
                  onClick={() => handleReject(approval.id)}
                  variant="destructive"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="w-full flex justify-start"
                >
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button variant="outline" className="w-full flex justify-start">
                  <Eye className="w-4 h-4 mr-2" /> Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastApprovals.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-muted-foreground">History</h2>
          <div className="border rounded-xl divide-y">
            {pastApprovals.slice(0, 10).map(approval => (
              <div key={approval.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{approval.tool}</p>
                  <p className="text-xs text-muted-foreground">Run ID: {approval.runId}</p>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${approval.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {approval.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
