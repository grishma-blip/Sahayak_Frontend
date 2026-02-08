const resolveDefaultBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const hostname = window.location.hostname || 'localhost';
  return `${protocol}//${hostname}:3000`;
};

const envBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined)?.trim();

export const BACKEND_BASE_URL = envBaseUrl && envBaseUrl.length > 0
  ? envBaseUrl
  : resolveDefaultBaseUrl();

export const healthCheck = async (): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/health`, { method: 'GET' });
    const text = await response.text();
    console.log(`[health] ${response.status}: ${text}`);
  } catch (error) {
    console.log('[health] unreachable');
  }
};
