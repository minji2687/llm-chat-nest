import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ChatRequestDto, ChatResponse } from './dto/chat.dto';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
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
    this.logger.log({
      action: 'chat_request',
      prompt: chatRequestDto.prompt,
    });

    try {
      const response = await this.axiosInstance.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: chatRequestDto.prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const data = response.data;

      this.logger.log({
        action: 'chat_success',
        tokens: data.usage?.total_tokens || 0,
      });

      return {
        success: true,
        message: data.choices[0].message.content || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || 'OpenAI API 호출 중 오류가 발생했습니다';
        
        this.logger.error({
          action: 'chat_error',
          error: errorMessage,
          status: error.response?.status,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }

      this.logger.error({
        action: 'chat_error',
        error: '서버 오류가 발생했습니다',
      });

      return {
        success: false,
        error: '서버 오류가 발생했습니다',
      };
    }
  }
}
