import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { CreateJsaDocumentDto } from './dto/create-jsa-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}

  private async assertOrgMember(userId: string, orgId: string): Promise<void> {
    const user = await this.usersService.findByIdWithMemberships(userId);
    if (!user) throw new ForbiddenException('Access denied');

    const isMember = user.memberships.some((m) => m.organizationId === orgId);
    if (!isMember) throw new ForbiddenException('Not a member of this organization');
  }

  async createJsaDocument(userId: string, dto: CreateJsaDocumentDto) {
    await this.assertOrgMember(userId, dto.orgId);

    const result = await this.aiService.createJsaSmart(dto);

    const doc = await this.prisma.jsaDocument.create({
      data: {
        organizationId: dto.orgId,
        createdById: userId,
        task: dto.task,
        location: dto.location ?? null,
        toolsJson: JSON.stringify(dto.tools ?? []),
        hazardsJson: JSON.stringify(dto.hazards ?? []),
        resultJson: JSON.stringify(result),
      },
    });

    return {
      id: doc.id,
      organizationId: doc.organizationId,
      createdById: doc.createdById,
      task: doc.task,
      location: doc.location,
      createdAt: doc.createdAt,
      result,
    };
  }

  async listJsaDocuments(userId: string, orgId?: string) {
    const user = await this.usersService.findByIdWithMemberships(userId);
    if (!user) throw new ForbiddenException('Access denied');

    const orgIds = user.memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];

    const whereOrgIds = orgId ? (orgIds.includes(orgId) ? [orgId] : []) : orgIds;
    if (whereOrgIds.length === 0) throw new ForbiddenException('Not a member of this organization');

    return this.prisma.jsaDocument.findMany({
      where: { organizationId: { in: whereOrgIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        createdById: true,
        task: true,
        location: true,
        createdAt: true,
      },
    });
  }

  async getJsaDocumentById(userId: string, id: string) {
    const doc = await this.prisma.jsaDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('JSA document not found');

    await this.assertOrgMember(userId, doc.organizationId);

    return {
      id: doc.id,
      organizationId: doc.organizationId,
      createdById: doc.createdById,
      task: doc.task,
      location: doc.location,
      toolsJson: doc.toolsJson,
      hazardsJson: doc.hazardsJson,
      createdAt: doc.createdAt,
      result: JSON.parse(doc.resultJson),
    };
  }

  async streamJsaPdf(id: string, res: Response): Promise<void> {
    let pdf: any | null = null;
    try {
      const doc = await this.prisma.jsaDocument.findUnique({ where: { id } });
      if (!doc) throw new NotFoundException('JSA document not found');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="jsa-${id}.pdf"`);

      pdf = new (PDFDocument as any)({ margin: 40 });

      // Handle PDF stream errors
      pdf.on('error', (err: Error) => {
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to generate PDF' });
        } else {
          try { res.end(); } catch {};
        }
      });

      pdf.pipe(res);

      pdf.fontSize(18).text('Job Safety Analysis (JSA)', { underline: true });
      pdf.moveDown();

      pdf.fontSize(12).text(`Document ID: ${id}`);
      pdf.text(`Task: ${doc.task ?? ''}`);
      if (doc.location) pdf.text(`Location: ${doc.location}`);
      pdf.moveDown();

      try {
        const resultObj = JSON.parse(doc.resultJson ?? '{}');
        pdf.fontSize(12).text('JSA Details:', { underline: true });
        pdf.moveDown(0.5);
        pdf.fontSize(10).text(JSON.stringify(resultObj, null, 2));
      } catch (e) {
        pdf.fontSize(10).text(String(doc.resultJson ?? ''));
      }

      pdf.end();
    } catch (err: any) {
      // If headers not sent yet, send an error response
      if (!res.headersSent) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        res.status(500).json({ message });
      } else {
        // If response already streaming, ensure PDF stream is closed
        try {
          if (pdf && typeof pdf.destroy === 'function') pdf.destroy();
        } catch {}
      }
    }
  }
}
