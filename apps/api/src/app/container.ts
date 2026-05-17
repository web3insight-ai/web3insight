import { createDbClient, type DbClient } from '@/db/client';
import { CacheService } from '@/services/cache.service';
import { TokenPoolService } from '@/services/token-pool.service';
import { EcoService } from '@/services/eco.service';
import { GithubService } from '@/services/github.service';
import { DonateService } from '@/services/donate.service';
import { TotalService } from '@/services/total.service';
import { YearsService } from '@/services/years.service';
import { ReposService } from '@/services/repos.service';
import { RankService } from '@/services/rank.service';
import { UsersService } from '@/services/users.service';
import { AuthService } from '@/services/auth.service';

/**
 * Minimal subset of `env` the container needs to bootstrap. Passed in so this
 * module doesn't pull the full env validation chain (matters for tests + cron
 * handlers that only need a subset).
 */
export interface ContainerEnv {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GITHUB_TOKENS?: string;
  PRIVY_APP_ID?: string;
  PRIVY_APP_SECRET?: string;
}

export interface Container {
  db: DbClient;
  services: {
    cache: CacheService;
    tokenPool: TokenPoolService;
    eco: EcoService;
    github: GithubService;
    donate: DonateService;
    total: TotalService;
    years: YearsService;
    repos: ReposService;
    rank: RankService;
    users: UsersService;
    auth: AuthService;
  };
}

let cached: Container | null = null;

/**
 * Lazy singleton container. Vercel cold starts call this once on first request;
 * subsequent warm invocations reuse the same Postgres pool + service instances.
 *
 * # Reason: pure-function oRPC handlers can't @Inject NestJS providers, so we
 * carry the container through Hono context (c.set('container', ...)) and oRPC
 * context ({ container, user }).
 *
 * Construction order honors the dependency graph:
 *   db → cache, tokenPool, eco, auth
 *   tokenPool → github
 *   github → donate, repos
 *   cache + eco → total, years, rank
 *   db + tokenPool + github → users
 *   auth ↔ users (cycle broken via setUsersService + getAuthService getter)
 */
export function getContainer(env: ContainerEnv): Container {
  if (cached) return cached;

  const db = createDbClient({
    databaseUrl: env.DATABASE_URL,
    maxConnections: 1,
  });

  const cache = new CacheService(db);
  const tokenPool = new TokenPoolService(
    env.GITHUB_TOKENS ? env.GITHUB_TOKENS.split(',') : [],
  );
  const eco = new EcoService(db);
  const github = new GithubService(tokenPool);
  const donate = new DonateService(db, tokenPool, github);
  const total = new TotalService(db, cache, eco);
  const years = new YearsService(db, cache);
  const repos = new ReposService(db, tokenPool, github);
  const rank = new RankService(db, cache, repos, eco);

  const auth = new AuthService(db, {
    jwtSecret: env.JWT_SECRET,
    privyAppId: env.PRIVY_APP_ID,
    privyAppSecret: env.PRIVY_APP_SECRET,
  });

  const users = new UsersService(db, tokenPool, github, {
    getAuthService: () => auth,
    developerAnalysisService: null,
  });

  // Resolve the auth ↔ users cycle now that both exist.
  auth.setUsersService(users);

  cached = {
    db,
    services: {
      cache,
      tokenPool,
      eco,
      github,
      donate,
      total,
      years,
      repos,
      rank,
      users,
      auth,
    },
  };
  return cached;
}

/** Test-only: drop the cached container so each test gets a fresh DB pool. */
export function resetContainer(): void {
  cached = null;
}
