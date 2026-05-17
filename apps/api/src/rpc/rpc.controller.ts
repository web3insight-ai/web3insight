import { All, Controller, OnModuleInit, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RPCHandler } from '@orpc/server/node';
import { router } from './router';
import type { RpcContext } from './context';
import { ServiceRegistry, setRegistry } from './service-registry';

/**
 * Mount oRPC at /rpc/* — single catch-all NestJS controller wrapping
 * `@orpc/server/node`'s RPCHandler. Each procedure handler runs through the
 * same Express req/res that NestJS already manages.
 *
 * Why this works:
 * - NestJS DI initializes ServiceRegistry once at boot (ServiceRegistry is a
 *   provider). We stash that ref in the module-level registry singleton so the
 *   pure oRPC handler closures (which can't @Inject) can reach NestJS services.
 * - RPCHandler.handle() reads body / parses input / runs handler / writes response.
 */
@Controller('rpc')
@ApiExcludeController()
export class RpcController implements OnModuleInit {
  private readonly handler = new RPCHandler(router);

  constructor(private readonly registry: ServiceRegistry) {}

  onModuleInit() {
    setRegistry(this.registry);
  }

  @All('*')
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const context: RpcContext = {
      req,
      res,
      headers: { authorization: req.header('authorization') ?? undefined },
    };
    const { matched } = await this.handler.handle(req, res, {
      prefix: '/rpc',
      context,
    });
    if (!matched) {
      res.status(404).json({ error: 'RPC procedure not found' });
    }
  }
}
