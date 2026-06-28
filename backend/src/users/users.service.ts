import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const demoUsers = [
  {
    email: 'clark@example.com',
    name: 'Clark Kent',
    initials: 'CK',
  },
  {
    email: 'priya@example.com',
    name: 'Priya Shah',
    initials: 'PS',
  },
  {
    email: 'alex@example.com',
    name: 'Alex Morgan',
    initials: 'AM',
  },
];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await Promise.all(
      demoUsers.map((user) =>
        this.prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            initials: user.initials,
          },
          create: user,
        }),
      ),
    );
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOrCreate(email: string, name?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return existing;
    }

    const finalName = name?.trim() || email.split('@')[0];
    const initials = finalName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

    return this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: finalName,
        initials,
      },
    });
  }
}
