// AppModule wires controllers & providers together.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { GameMasterModule } from './game-master/game-master.module';
import { PlayerModule } from './player/player.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AdminModule,
    GameMasterModule,
    PlayerModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}