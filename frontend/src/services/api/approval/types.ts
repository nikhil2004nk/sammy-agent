export interface ApprovalDto {
  id: string;
  runId: string;
  tool: string;
  arguments: any;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  createdAt: string;
}

export interface Approval {
  id: string;
  runId: string;
  tool: string;
  arguments: any;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  createdAt: Date;
}
