import { Module } from '@nestjs/common';
import { DBModule } from './db/db.module';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { DataModule } from './source/source.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConsoleModule,
    DBModule,
    AuthModule,
    DataModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
