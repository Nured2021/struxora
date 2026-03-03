import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { CreateJsaDto } from './dto/create-jsa.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('jsa')
  createJsa(@Body() dto: CreateJsaDto) {
    return this.ai.createJsaSmart(dto);
  }
}
