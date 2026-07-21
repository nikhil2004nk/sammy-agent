'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';

export default function ContextPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader 
        title="Context" 
        description="Implicit knowledge and preferences extracted over time."
      />
      <BackendPlannedPlaceholder 
        title="Context API"
        milestone="Milestone 11"
        expectedFeatures={[
          "Auto-extraction of user preferences",
          "Context injection rules for Agents",
          "Context CRUD (view/edit implicitly learned memory)"
        ]}
      />
    </div>
  );
}
