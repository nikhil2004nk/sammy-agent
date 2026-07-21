import { apiClient as authApiClient } from '../../lib/api-client';

/**
 * A native fetch wrapper for API calls that integrates with auth and workspace context,
 * and throws errors for React Query compatibility.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const result = await authApiClient(endpoint, options);
  
  if (result.error) {
    throw new Error(result.error.message || `API Error for ${endpoint}`);
  }
  
  return result.data as T;
}
