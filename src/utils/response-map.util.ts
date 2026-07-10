import type { ResponseEntity, ResponseErrorEntity } from '../interfaces/response.entity';

export const responseMapping = <T>(
  data: T | null,
  error: ResponseErrorEntity | null,
): ResponseEntity<T> => {
  return {
    success: !!data,
    data: data ?? null,
    error: error ?? null,
    meta: {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };
};
