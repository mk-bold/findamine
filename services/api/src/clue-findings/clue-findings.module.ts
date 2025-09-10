import { Module } from '@nestjs/common';
import { ClueFindingsController } from './clue-findings.controller';
import { ClueFindingsService } from './clue-findings.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ClueFindingsController],
  providers: [ClueFindingsService, PrismaService],
  exports: [ClueFindingsService]
})
export class ClueFindingsModule {}