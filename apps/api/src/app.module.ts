import { Module } from '@nestjs/common';
import { DBModule } from './db/db.module';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SourceModule } from './source/source.module';
import { ApiModule } from './api/api.module';
import { AppAuthGuard } from './auth/app.auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConsoleModule,
    DBModule,
    AuthModule,
    SourceModule,
    ApiModule,
  ],
  controllers: [],
  providers: [AppAuthGuard, JwtService],
})
export class AppModule {}
