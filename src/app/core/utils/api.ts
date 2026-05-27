const AUTH_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

export function normalizeApiBaseUrl(apiUrl: string): string {
  return apiUrl.trim().replace(/\/+$/, '');
}

export function buildApiUrl(apiUrl: string, path: string): string {
  const baseUrl = `${normalizeApiBaseUrl(apiUrl)}/`;
  const normalizedPath = path.replace(/^\/+/, '');

  return new URL(normalizedPath, baseUrl).toString();
}

export function isApiRequest(requestUrl: string, apiUrl: string): boolean {
  try {
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(requestUrl) && !requestUrl.startsWith('//')) {
      return false;
    }

    const baseUrl = normalizeApiBaseUrl(apiUrl);
    const requestOrigin = new URL(requestUrl).origin;
    return requestOrigin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

export function isAuthEndpoint(requestUrl: string, apiUrl: string): boolean {
  try {
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(requestUrl) && !requestUrl.startsWith('//')) {
      return false;
    }

    const baseUrl = normalizeApiBaseUrl(apiUrl);
    const requestPath = new URL(requestUrl).pathname;
    return AUTH_PATHS.has(requestPath);
  } catch {
    return false;
  }
}
