import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';

@Injectable()
export class DocumentsService {

  async createJsaDocument(userId: string, dto: any) {
    return {
      id: 'temp-id',
      createdBy: userId,
      orgId: dto?.orgId ?? null,
      title: dto?.title ?? 'JSA',
      data: dto ?? {},
      createdAt: new Date().toISOString(),
    };
  }

  async listJsaDocuments(userId: string, orgId?: string) {
    return [
      {
        id: 'temp-id',
        createdBy: userId,
        orgId: orgId ?? null,
        title: 'JSA',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async getJsaDocumentById(userId: string, id: string) {
    if (!id) {
      throw new NotFoundException('Document not found');
    }

    return {
      id,
      createdBy: userId,
      title: 'JSA',
      data: {},
      createdAt: new Date().toISOString(),
    };
  }

  async streamJsaPdf(id: string, res: Response): Promise<void> {
    const doc = await this.getJsaDocumentById('system', id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="jsa-${id}.pdf"`);

    const pdf = new PDFDocument({ size: 'A4', margin: 50 });
    pdf.pipe(res);

    pdf.fontSize(18).text('Job Safety Analysis (JSA)', { align: 'center' });
    pdf.moveDown();

    pdf.fontSize(12).text(`Document ID: ${id}`);
    pdf.text(`Title: ${doc.title}`);
    pdf.moveDown();

    pdf.fontSize(12).text('Details:', { underline: true });
    pdf.moveDown(0.5);

    pdf.font('Courier').fontSize(9).text(JSON.stringify(doc.data ?? {}, null, 2));

    pdf.end();
  }
}
