import { Body, Controller, Get, Param, Post, Query, UseGuards , Res} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateJsaDocumentDto } from './dto/create-jsa-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('jsa')
  createJsa(@CurrentUser() user: JwtPayload, @Body() dto: CreateJsaDocumentDto) {
    return this.documentsService.createJsaDocument(user.sub, dto);
  }

  @Get('jsa')
  listJsa(@CurrentUser() user: JwtPayload, @Query('orgId') orgId?: string) {
    return this.documentsService.listJsaDocuments(user.sub, orgId);
  }

  @Get('jsa/:id')
  getJsa(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.getJsaDocumentById(user.sub, id);
  }
  @Get('jsa/:id/pdf')
  async getJsaPdf(@Param('id') id: string, @Res() res: Response) {
    return this.documentsService.streamJsaPdf(id, res);
  }

}

