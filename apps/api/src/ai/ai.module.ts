import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeveloperAnalysisService } from './services/developer-analysis.service';

@Module({
  imports: [ConfigModule],
  providers: [DeveloperAnalysisService],
  exports: [DeveloperAnalysisService],
})
export class AIModule {}
