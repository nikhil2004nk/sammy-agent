import React from 'react';
import { AppCard } from './AppCard';
import { Hammer } from 'lucide-react';

interface BackendPlannedPlaceholderProps {
  title: string;
  milestone: string;
  expectedFeatures: string[];
}

export function BackendPlannedPlaceholder({ title, milestone, expectedFeatures }: BackendPlannedPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Hammer className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The UI for this feature is complete, but it is waiting for backend support.
      </p>

      <AppCard className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Backend Planned</p>
            <p className="text-lg font-semibold">{milestone}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
            <span className="inline-block px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded">UI Only (Mock)</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Expected Features</h4>
          <ul className="space-y-2">
            {expectedFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </AppCard>
    </div>
  );
}
