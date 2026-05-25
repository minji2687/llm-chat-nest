export class ChatRequestDto {
  prompt: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}
