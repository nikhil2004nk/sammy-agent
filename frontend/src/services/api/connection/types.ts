export interface ConnectionDto {
  id: string;
  provider: string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  provider: string;
  name: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  createdAt: Date;
  updatedAt: Date;
}
