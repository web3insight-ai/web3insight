import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [JwtModule],
  exports: [],
})
export class AuthModule {}
