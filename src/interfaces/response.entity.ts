export interface ResponseErrorEntity {
  message: string;
}

export interface ResponseEntity<T = unknown> {
  success: boolean;
  data: T | null;
  error: ResponseErrorEntity | null;
  meta: {
    requestId: string;
    timestamp: string;
  };
}
