import { useRef, useEffect } from 'react'

interface EventSourceOptions {
  onError?: () => void;
  onClose?: () => void;
  retryOnError?: boolean;
  maxRetries?: number;
}

export function useEventSource<T = any>(
  url: string | null,
  onMessage: (data: T) => void,
  options: EventSourceOptions = {}
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const {
    onError,
    onClose,
    retryOnError = false,
    maxRetries = 3
  } = options;

  useEffect(() => {
    if (!url) return;

    const setupEventSource = () => {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
          // Reset retries on successful message
          retriesRef.current = 0;
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        
        if (retryOnError && retriesRef.current < maxRetries) {
          retriesRef.current++;
          const retryDelay = Math.min(1000 * Math.pow(2, retriesRef.current), 10000);
          setTimeout(setupEventSource, retryDelay);
        } else {
          onError?.();
        }
      };

      eventSource.addEventListener('close', () => {
        eventSource.close();
        eventSourceRef.current = null;
        onClose?.();
      });
    };

    setupEventSource();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [url, onMessage, onError, onClose, retryOnError, maxRetries]);

  return eventSourceRef;
}
