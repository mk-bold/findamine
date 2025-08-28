import { Module } from '@nestjs/common';
import { GameMasterController } from './game-master.controller';
import { GameMasterService } from './game-master.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GameMasterController],
  providers: [GameMasterService, PrismaService],
  exports: [GameMasterService],
})
export class GameMasterModule {} 