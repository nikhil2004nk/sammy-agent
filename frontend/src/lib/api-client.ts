import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const apiClient = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = true, ...customOptions } = options;
  const store = useAuthStore.getState();

  const headers = new Headers(customOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (requireAuth) {
    if (store.accessToken) {
      headers.set('Authorization', `Bearer ${store.accessToken}`);
    }
    if (store.activeWorkspaceId) {
      headers.set('x-workspace-id', store.activeWorkspaceId);
    }
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
    credentials: 'include', // Important for sending/receiving the refresh_token cookie
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle token refresh automatically
    if (response.status === 401 && requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              return data.accessToken;
            }
            return null;
          })
          .catch(() => null)
          .finally(() => {
            isRefreshing = false;
          });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        // Update store with new token
        if (store.user) {
          useAuthStore.getState().setAuth(store.user, newAccessToken);
        }
        
        // Retry original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
      } else {
        // Refresh failed, logout
        useAuthStore.getState().logout();
      }
    }

    // Attempt to parse JSON
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return { data: await response.json(), error: null, response };
      }
      return { data: null, error: null, response };
    } else {
      const errorData = await response.json().catch(() => null);
      return { data: null, error: errorData || { message: 'An error occurred' }, response };
    }
  } catch (error: any) {
    return { data: null, error: { message: error.message }, response: null };
  }
};
