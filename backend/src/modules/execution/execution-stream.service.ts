import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, filter } from 'rxjs';
import { ExecutionEvent, ExecutionEventType, ExecutionEventPayloadMap } from './execution-events.types';
import * as crypto from 'crypto';

@Injectable()
export class ExecutionStreamService {
  private readonly logger = new Logger(ExecutionStreamService.name);
  
  // A single shared subject for all execution events across the application
  private readonly eventSubject = new Subject<ExecutionEvent>();

  /**
   * Publishes a typed execution event into the stream.
   */
  publish<T extends ExecutionEventType>(
    runId: string,
    type: T,
    payload: ExecutionEventPayloadMap[T],
  ): void {
    const event: ExecutionEvent<T> = {
      version: 1,
      id: crypto.randomUUID(),
      runId,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    
    if (type !== 'message.delta') {
      this.logger.debug(`[Stream] Emitting ${type} for run ${runId}`);
    }
    this.eventSubject.next(event);
  }

  /**
   * Subscribes to events for a specific runId.
   */
  subscribeToRun(runId: string): Observable<ExecutionEvent> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.runId === runId)
    );
  }
}
