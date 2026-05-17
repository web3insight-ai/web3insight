import { Injectable } from '@nestjs/common';
import { TotalService } from '@/data/services/total.services';
import { CacheDataService } from '@/data/services/cache.services';
import { RankService } from '@/data/services/rank.services';
import { ReposService } from '@/data/services/repos.services';
import { UsersService } from '@/data/services/users.services';
import { EcoService } from '@/data/services/eco.services';
import { DonateService } from '@/data/services/donate.services';
import { GithubService } from '@/api/services/github.services';
import { YearsService } from '@/data/services/years.services';
import { AuthService } from '@/auth/services/auth.services';

/**
 * Centralized service registry — bridges NestJS DI with oRPC handler closures.
 *
 * The RpcController constructs handlers ONCE at module init with a populated
 * registry instance, so handler files can reference `registry.total` etc. without
 * needing per-request DI lookups (which would be slow for serverless).
 */
@Injectable()
export class ServiceRegistry {
  constructor(
    public readonly total: TotalService,
    public readonly cache: CacheDataService,
    public readonly rank: RankService,
    public readonly repos: ReposService,
    public readonly users: UsersService,
    public readonly eco: EcoService,
    public readonly donate: DonateService,
    public readonly github: GithubService,
    public readonly years: YearsService,
    public readonly auth: AuthService,
  ) {}
}

/**
 * Global registry holder — populated by RpcController.onModuleInit.
 * Handler files import `getRegistry()` to access services within their closures.
 *
 * # Reason: oRPC `.handler()` callbacks are pure functions (not NestJS providers),
 * so they can't @Inject. The registry pattern keeps a single, fully-typed reference
 * around without per-request resolution overhead.
 */
let _registry: ServiceRegistry | null = null;
export function setRegistry(registry: ServiceRegistry): void {
  _registry = registry;
}
export function getRegistry(): ServiceRegistry {
  if (!_registry) {
    throw new Error(
      'ServiceRegistry not initialized — rpc.module bootstrap missing',
    );
  }
  return _registry;
}
