export interface Intent {
  goal: string;
  entities: string[];
  constraints: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
}
