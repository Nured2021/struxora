import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiService } from './openai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenAiService],
  exports: [AiService],
})
export class AiModule {}
