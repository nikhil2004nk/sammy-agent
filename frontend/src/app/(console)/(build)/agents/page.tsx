'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';

export default function AgentsPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Agents" 
        description="Build and manage autonomous AI agents."
      />
      <BackendPlannedPlaceholder 
        title="Agent Management"
        milestone="Milestone 11"
        expectedFeatures={[
          "Agent CRUD (Create, Read, Update, Delete)",
          "Agent Profiles & Prompts",
          "Capabilities & Tools Assignment",
          "Agent Telemetry & Metrics"
        ]}
      />
    </div>
  );
}
