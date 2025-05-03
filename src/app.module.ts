import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './app/db/db.module';
import { ConsoleModule } from 'nestjs-console';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { DataModule } from './data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConsoleModule,
    DBModule,
    AuthModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
