import { Module } from '@nestjs/common';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';
import { RpcController } from './rpc.controller';
import { ServiceRegistry } from './service-registry';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [RpcController],
  providers: [ServiceRegistry],
})
export class RpcModule {}
