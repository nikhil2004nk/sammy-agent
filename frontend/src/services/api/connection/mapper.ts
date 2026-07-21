import { Connection, ConnectionDto } from './types';

export function mapConnectionToDomain(dto: ConnectionDto): Connection {
  return {
    id: dto.id,
    provider: dto.provider,
    name: dto.name,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
