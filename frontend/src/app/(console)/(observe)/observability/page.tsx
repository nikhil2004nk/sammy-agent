'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';

export default function ObservabilityPage() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-background text-foreground">
      <div className="p-6 border-b border-border bg-background shrink-0">
        <PageHeader 
          title="Observability" 
          description="Monitor platform health, execution metrics, and system logs."
        />
      </div>

      <div className="flex-1 overflow-auto bg-surface p-6">
        <div className="max-w-6xl mx-auto">
          <BackendPlannedPlaceholder 
            title="Telemetry System"
            milestone="Milestone 11"
            expectedFeatures={[
              "Distributed tracing via OpenTelemetry",
              "Execution cost & token metrics",
              "Aggregated logging across all workers",
              "Alerts and event streams"
            ]}
          />
        </div>
      </div>
    </div>
  );
}
