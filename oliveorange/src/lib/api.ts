/**
 * API Client Utility for OliveOrange Stock Management
 * Supports seamless switching between Local Dev, Cloud Deployment, and Capacitor Android APK
 */

export const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL) || '').replace(/\/$/, '');

/**
 * Returns full URL for API request
 * @param path Endpoint path, e.g. "/api/inventory/stock"
 */
export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Custom fetch wrapper with default headers and error handling
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Attach auth user if available in localStorage
  try {
    const savedUser = localStorage.getItem('oliveorange_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      defaultHeaders['X-User-Email'] = user.email || '';
      defaultHeaders['X-User-Role'] = user.role || '';
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  return fetch(url, mergedOptions);
}
