import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ChatRequestDto, ChatResponse } from './dto/chat.dto';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat')
  async chat(@Body() chatRequestDto: ChatRequestDto): Promise<ChatResponse> {
    return this.openaiService.chat(chatRequestDto);
  }
}
