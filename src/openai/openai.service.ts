import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ChatRequestDto, ChatResponse } from './dto/chat.dto';
import { RedisService } from '../infra/redis/redis.service';

const MAX_MESSAGES = 10;
const CONTEXT_TTL = 60 * 60 * 24; // 24시간

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private axiosInstance: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    this.axiosInstance = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });
  }

  async chat(chatRequestDto: ChatRequestDto): Promise<ChatResponse> {
    const { prompt, sessionId } = chatRequestDto;

    this.logger.log({ action: 'chat_request', sessionId, prompt });

    try {
      const context: Message[] = await this.redisService.getContext(sessionId);

      const messages: Message[] = [
        ...context,
        { role: 'user', content: prompt },
      ];

      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage: string = response.data.choices[0].message.content || '';

      const updatedContext: Message[] = ([
        ...context,
        { role: 'user' as const, content: prompt },
        { role: 'assistant' as const, content: assistantMessage },
      ] as Message[]).slice(-MAX_MESSAGES);

      await this.redisService.saveContext(sessionId, updatedContext, CONTEXT_TTL);

      this.logger.log({
        action: 'chat_success',
        sessionId,
        contextLength: updatedContext.length,
        tokens: response.data.usage?.total_tokens || 0,
      });

      return { success: true, message: assistantMessage };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || 'OpenAI API 호출 중 오류가 발생했습니다';

        this.logger.error({ action: 'chat_error', sessionId, error: errorMessage });
        return { success: false, error: errorMessage };
      }

      this.logger.error({ action: 'chat_error', sessionId, error: '서버 오류가 발생했습니다' });
      return { success: false, error: '서버 오류가 발생했습니다' };
    }
  }
}
