import { BACKEND_BASE_URL } from './api';

type EventMetadata = Record<string, unknown>;

export const sendEvent = (type: string, metadata: EventMetadata = {}): void => {
  try {
    void fetch(`${BACKEND_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        source: 'frontend',
        metadata,
      }),
    }).catch(() => {
      // Fail silently
    });
  } catch (error) {
    // Fail silently
  }
};
