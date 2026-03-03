import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface CreateAuditLogInput {
  organizationId?: string;
  projectId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        projectId: input.projectId,
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async logAuthRegister(userId: string, email: string): Promise<void> {
    await this.create({
      userId,
      action: 'auth.register',
      resourceType: 'user',
      resourceId: userId,
      payload: { email },
    });
  }

  async logAuthLoginSuccess(userId: string, email: string): Promise<void> {
    await this.create({
      userId,
      action: 'auth.login.success',
      resourceType: 'user',
      resourceId: userId,
      payload: { email },
    });
  }

  async logAuthLoginFailure(email: string, reason: string): Promise<void> {
    await this.create({
      action: 'auth.login.failure',
      resourceType: 'user',
      payload: { email, reason },
    });
  }

  async logAuthRefresh(userId: string): Promise<void> {
    await this.create({
      userId,
      action: 'auth.refresh',
      resourceType: 'user',
      resourceId: userId,
    });
  }

  async logAuthLogout(userId: string): Promise<void> {
    await this.create({
      userId,
      action: 'auth.logout',
      resourceType: 'user',
      resourceId: userId,
    });
  }

  async logOrgCreate(organizationId: string, userId: string, name: string, slug: string): Promise<void> {
    await this.create({
      organizationId,
      userId,
      action: 'organization.create',
      resourceType: 'organization',
      resourceId: organizationId,
      payload: { name, slug },
    });
  }
}
