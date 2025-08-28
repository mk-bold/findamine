import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, PrismaService],
  exports: [PlayerService],
})
export class PlayerModule {} 