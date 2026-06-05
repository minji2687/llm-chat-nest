export class ChatRequestDto {
  prompt: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}
