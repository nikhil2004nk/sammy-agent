'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';

export default function KnowledgePage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <PageHeader 
        title="Knowledge Base" 
        description="Provide explicit documents and data sources for your agents to reference."
      />
      <BackendPlannedPlaceholder 
        title="Knowledge API"
        milestone="Milestone 11"
        expectedFeatures={[
          "Document upload and parsing",
          "Vector embeddings generation",
          "Semantic search",
          "Knowledge base assignment to Agents"
        ]}
      />
    </div>
  );
}
