import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './app/db/db.module';
import { ConsoleModule } from 'nestjs-console';

@Module({
  imports: [ConsoleModule, DBModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
