import { Body, Controller, Post, Logger } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ChatRequestDto, ChatResponse } from './dto/chat.dto';

@Controller('openai')
export class OpenaiController {
  private readonly logger = new Logger(OpenaiController.name);

  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat')
  async chat(@Body() chatRequestDto: ChatRequestDto): Promise<ChatResponse> {
    this.logger.log({
      method: 'POST',
      path: '/openai/chat',
      body: chatRequestDto,
    });

    const result = await this.openaiService.chat(chatRequestDto);

    this.logger.log({
      method: 'POST',
      path: '/openai/chat',
      success: result.success,
    });

    return result;
  }
}
