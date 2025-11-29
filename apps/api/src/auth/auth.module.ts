import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.services';
import { JwtService } from '@nestjs/jwt';
import { DBModule } from '@/app/db/db.module';
import { DataModule } from '@/data/data.module';

@Module({
  imports: [DBModule, forwardRef(() => DataModule)],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
