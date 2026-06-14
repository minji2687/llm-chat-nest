export class ChatRequestDto {
  prompt: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class EmbeddingRequestDto {
  input: string;
}

export interface EmbeddingResponse {
  success: boolean;
  embedding?: number[];
  error?: string;
}
