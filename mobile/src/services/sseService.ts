import EventSource from 'react-native-sse';
import { AgentEvent, parseAgentEvent, AgentEventType } from '../models/agentEvent';
import { createLogger } from './logger';

const log = createLogger('SSE');

const SSE_EVENT_TYPES = Object.values(AgentEventType) as string[];

export class SSEException extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'SSEException';
  }
}

interface SSEConnectOptions {
  url: string;
  headers: Record<string, string>;
  body: Record<string, any>;
  onEvent: (event: AgentEvent) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

class SSEService {
  private static instance: SSEService;
  private eventSource: EventSource | null = null;

  private constructor() {}

  static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  async connect(options: SSEConnectOptions): Promise<void> {
    const { url, headers, body, onEvent, onError, onComplete } = options;

    this.abort();

    log.debug('Connecting to:', url);
    log.debug('Body:', body);

    return new Promise((resolve) => {
      try {
        this.eventSource = new EventSource(url, {
          method: 'POST',
          headers: {
            ...headers,
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(body),
          pollingInterval: 0,
        });

        this.eventSource.addEventListener('open', () => {
          log.debug('Connection opened');
        });

        this.eventSource.addEventListener('message', (event: any) => {
          log.debug('Received message event:', event.type);
        });

        for (const eventType of SSE_EVENT_TYPES) {
          this.eventSource.addEventListener(eventType as any, (event: any) => {
            if (!event.data) {
              log.debug('No data in event:', eventType);
              return;
            }

            try {
              const jsonData = JSON.parse(event.data);
              const agentEvent = parseAgentEvent(eventType, jsonData);

              if (agentEvent) {
                onEvent(agentEvent);

                if (agentEvent.type === AgentEventType.Complete || agentEvent.type === AgentEventType.Error) {
                  log.debug('Complete/Error event, closing connection');
                  this.abort();
                  onComplete();
                  resolve();
                }
              }
            } catch (e) {
              log.error('Error parsing event data:', e);
            }
          });
        }

        this.eventSource.addEventListener('error', (event: any) => {
          log.error('Error event:', event.message || 'Unknown error');

          if (event.message) {
            onError(new SSEException(0, event.message));
          }

          this.abort();
          resolve();
        });

        this.eventSource.addEventListener('close', () => {
          log.debug('Connection closed');
          resolve();
        });
      } catch (error: any) {
        log.error('Error creating EventSource:', error.message);
        onError(error);
        resolve();
      }
    });
  }

  abort(): void {
    if (this.eventSource) {
      log.debug('Aborting connection');
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const sseService = SSEService.getInstance();
