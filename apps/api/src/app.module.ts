import { Module } from '@nestjs/common';
import { DBModule } from './app/db/db.module';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { DataModule } from './data/data.module';
import { ApiModule } from './api/api.module';
import { AppAuthGuard } from './auth/app.auth.guard';
import { AppConfigModule } from './app/config/config.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConsoleModule,
    DBModule,
    AuthModule,
    DataModule,
    ApiModule,
    AppConfigModule,
    AuthModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [],
  providers: [AppAuthGuard, JwtService],
})
export class AppModule {}
