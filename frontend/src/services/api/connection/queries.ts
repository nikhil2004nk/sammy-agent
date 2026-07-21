import { useQuery } from '@tanstack/react-query';
import { connectionService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useConnections() {
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  return useQuery({
    queryKey: queryKeys.connections(workspaceId),
    queryFn: () => connectionService.list(),
    enabled: !!workspaceId,
  });
}

export function useConnection(id: string) {
  return useQuery({
    queryKey: queryKeys.connection(id),
    queryFn: () => connectionService.get(id),
    enabled: !!id,
  });
}
