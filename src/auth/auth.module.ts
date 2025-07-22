import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.services';
import { JwtService } from '@nestjs/jwt';
import { DBModule } from '@/app/db/db.module';

@Module({
  imports: [DBModule],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
