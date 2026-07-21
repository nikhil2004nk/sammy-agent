// DTOs (Data Transfer Objects) mapping exactly to the backend JSON
export interface WorkflowDto {
  id: string;
  name: string;
  description?: string;
  definition: any;
  status: 'Draft' | 'Active' | 'Archived';
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Domain Models (What the UI consumes)
export interface Workflow {
  id: string;
  name: string;
  description: string;
  definition: any;
  status: 'Draft' | 'Active' | 'Archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
