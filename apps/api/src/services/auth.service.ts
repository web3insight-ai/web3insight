import type { DbClient } from '@/db/client';
import type { UsersService } from '@/services/users.service';

/**
 * STUB AuthService — to be ported from auth/services/auth.services.ts (1967 LOC)
 * in Phase D. The interface here matches what UsersService needs (getPrivyUserBindings)
 * so the container compiles, but the legacy NestJS AuthService still owns the real
 * GitHub OAuth + JWT signing + Privy exchange logic.
 *
 * TODO(phase-d): port full implementation; until then auth-protected oRPC handlers
 * remain stubbed (NOT_IMPLEMENTED) via rpc-hono/handlers/stubs.ts.
 */
export interface AuthServiceConfig {
  jwtSecret: string;
  privyAppId?: string;
  privyAppSecret?: string;
}

export class AuthService {
  // Lazy reference to UsersService — broken via setter to avoid constructor cycle.
  private usersService: UsersService | null = null;

  constructor(
    private readonly db: DbClient,
    private readonly config: AuthServiceConfig,
  ) {}

  /** Container wires this after both services are constructed. */
  setUsersService(usersService: UsersService): void {
    this.usersService = usersService;
  }

  /**
   * Stub — returns null until Phase D ports the real Privy binding lookup.
   * UsersService consumes this through its `deps.getAuthService()` lazy getter.
   */
  getPrivyUserBindings(_userDid: string): Promise<{
    user_id: string;
    linked_accounts: Array<{ type: string; username?: string }>;
  } | null> {
    return Promise.resolve(null);
  }
}
