import { v4 as uuidv4 } from 'uuid';
import {
  ResponseEntity,
  ResponseErrorEntity,
} from 'src/interfaces/response.entity';

export const responseMapping = <T>(
  data: T | null,
  error: ResponseErrorEntity | null,
): ResponseEntity<T> => {
  return {
    success: !!data,
    data: data ?? null,
    error: error ?? null,
    meta: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
    },
  };
};
