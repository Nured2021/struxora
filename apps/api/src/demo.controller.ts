import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class DemoController {
  @Public()
  @Get('demo')
  getDemo(@Res() res: Response): void {
    const path = join(__dirname, 'public', 'demo-smart-jsa.html');
    res.sendFile(path);
  }
}
