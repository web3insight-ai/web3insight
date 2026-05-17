import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  PrivyTokenAuthInputSchema,
  AuthTokenResponseSchema,
  UserPublicSchema,
  UpdateUserInputSchema,
  UpdateUserExtraInputSchema,
  OpenBuildBindInputSchema,
} from '../schemas/auth.js';
import { SuccessResponseSchema, PositiveIdSchema } from '../schemas/shared.js';

/**
 * Auth contract — Privy-only login + user profile + dev-card OpenBuild
 * binding. Legacy /v1/auth/login/oauth (GitHub direct), /v1/auth/magic, and
 * /v1/auth/bind/wallet have been dropped: Privy handles GitHub/wallet on the
 * client and exchanges identity tokens for backend JWTs via privyTokenAuth.
 */

const TagOrIdParamSchema = z.object({
  tag: z.string(),
});

const TagAndIdParamSchema = z.object({
  tag: z.string(),
  id: z.string(),
});

// Reason: legacy NestJS AuthController was @Controller('auth'), so all auth
// routes ship under /v1/auth/*. The earlier contract authoring dropped the
// /auth/ prefix and broke the dashboard's existing fetches (dashboard still
// posts to /v1/auth/privy/token/auth + GETs /v1/auth/user). Restore the
// prefix here so the REST surface (OpenAPIHandler) matches what frontends
// already send.
export const authContract = oc.tag('Auth').router({
  /** GET /v1/auth/user — current authenticated user */
  me: oc.route({ method: 'GET', path: '/auth/user' }).output(UserPublicSchema),

  /** GET /v1/auth/user/info/:tag/extra */
  getUserExtra: oc
    .route({ method: 'GET', path: '/auth/user/info/{tag}/extra' })
    .input(TagOrIdParamSchema)
    .output(z.record(z.string(), z.unknown())),

  /** POST /v1/auth/user/info/:tag/extra */
  updateUserExtra: oc
    .route({ method: 'POST', path: '/auth/user/info/{tag}/extra' })
    .input(TagOrIdParamSchema.extend({ data: UpdateUserExtraInputSchema }))
    .output(SuccessResponseSchema),

  /** GET /v1/auth/user/public/:id */
  publicById: oc
    .route({ method: 'GET', path: '/auth/user/public/{id}' })
    .input(z.object({ id: PositiveIdSchema }))
    .output(UserPublicSchema),

  /** POST /v1/auth/user/info/:tag */
  updateUserByTag: oc
    .route({ method: 'POST', path: '/auth/user/info/{tag}' })
    .input(TagOrIdParamSchema.extend({ data: UpdateUserInputSchema }))
    .output(SuccessResponseSchema),

  /** GET /v1/auth/user/info/:tag/:id */
  getUserByTagAndId: oc
    .route({ method: 'GET', path: '/auth/user/info/{tag}/{id}' })
    .input(TagAndIdParamSchema)
    .output(UserPublicSchema),

  /** POST /v1/auth/user — update current user */
  updateMe: oc
    .route({ method: 'POST', path: '/auth/user' })
    .input(UpdateUserInputSchema)
    .output(SuccessResponseSchema),

  /** POST /v1/auth/privy/token/auth — exchange Privy identity token for backend JWT */
  privyTokenAuth: oc
    .route({ method: 'POST', path: '/auth/privy/token/auth' })
    .input(PrivyTokenAuthInputSchema)
    .output(AuthTokenResponseSchema),

  /** POST /v1/auth/bind/openbuild — dev-card OpenBuild OAuth bind */
  bindOpenBuild: oc
    .route({ method: 'POST', path: '/auth/bind/openbuild' })
    .input(OpenBuildBindInputSchema)
    .output(SuccessResponseSchema),

  /** GET /v1/auth/openbuild/record */
  getOpenBuildRecord: oc
    .route({ method: 'GET', path: '/auth/openbuild/record' })
    .output(z.record(z.string(), z.unknown()).nullable()),
});

export type AuthContract = typeof authContract;
