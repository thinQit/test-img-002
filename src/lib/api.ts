type ApiOptions = RequestInit & { params?: Record<string, string | number | boolean | undefined> };

function buildUrl(path: string, params?: ApiOptions['params']) {
  if (!params) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = options;
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  if (response.status === 204) return null as T;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}

export const api = {
  get<T>(path: string, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'POST', body });
  },
  put<T>(path: string, body?: unknown, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },
  delete<T>(path: string, options?: ApiOptions) {
    return request<T>(path, { ...options, method: 'DELETE' });
  }
};
