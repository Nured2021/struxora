import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization, Role } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class OrgsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async createOrganization(data: {
    name: string;
    slug: string;
    createdByUserId: string;
  }): Promise<Organization> {
    const org = await this.prisma.organization.create({
      data: {
        name: data.name.trim(),
        slug: this.slugify(data.slug.trim()),
        createdByUserId: data.createdByUserId,
      },
    });
    await this.prisma.membership.create({
      data: {
        organizationId: org.id,
        userId: data.createdByUserId,
        role: Role.ORG_OWNER,
      },
    });
    await this.auditLog.logOrgCreate(org.id, data.createdByUserId, org.name, org.slug);
    return org;
  }

  private slugify(s: string): string {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async countOrganizations(): Promise<number> {
    return this.prisma.organization.count();
  }
}
