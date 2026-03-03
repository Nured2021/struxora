import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

export type UserWithMemberships = User & {
  memberships: Array<{
    id: string;
    organizationId: string;
    role: Role;
    organization: { id: string; name: string; slug: string };
  }>;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByIdWithMemberships(id: string): Promise<UserWithMemberships | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }) as Promise<UserWithMemberships | null>;
  }

  async create(data: { email: string; passwordHash: string; name?: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name?.trim() || null,
      },
    });
  }
}
