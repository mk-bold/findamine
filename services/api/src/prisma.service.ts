// PrismaService wraps PrismaClient so Nest can manage its lifecycle
// (connect during module init, disconnect during shutdown).
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // why: open a single DB connection when the Nest app starts
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // why: close DB connection gracefully so Node can exit cleanly
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}