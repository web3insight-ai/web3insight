import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  OAuthLoginInputSchema,
  PrivyTokenAuthInputSchema,
  AuthTokenResponseSchema,
  UserPublicSchema,
  UpdateUserInputSchema,
  UpdateUserExtraInputSchema,
  BindWalletInputSchema,
  OpenBuildBindInputSchema,
} from '../schemas/auth.js';
import { SuccessResponseSchema, PositiveIdSchema } from '../schemas/shared.js';

const TagOrIdParamSchema = z.object({
  tag: z.string(),
});

const TagAndIdParamSchema = z.object({
  tag: z.string(),
  id: z.string(),
});

export const authContract = oc.tag('Auth').router({
  /** POST /v1/login/oauth */
  oauthLogin: oc
    .route({ method: 'POST', path: '/login/oauth' })
    .input(OAuthLoginInputSchema)
    .output(AuthTokenResponseSchema),

  /** GET /v1/user — current authenticated user */
  me: oc
    .route({ method: 'GET', path: '/user' })
    .output(UserPublicSchema),

  /** GET /v1/user/info/:tag/extra */
  getUserExtra: oc
    .route({ method: 'GET', path: '/user/info/{tag}/extra' })
    .input(TagOrIdParamSchema)
    .output(z.record(z.string(), z.unknown())),

  /** POST /v1/user/info/:tag/extra */
  updateUserExtra: oc
    .route({ method: 'POST', path: '/user/info/{tag}/extra' })
    .input(TagOrIdParamSchema.extend({ data: UpdateUserExtraInputSchema }))
    .output(SuccessResponseSchema),

  /** GET /v1/user/public/:id */
  publicById: oc
    .route({ method: 'GET', path: '/user/public/{id}' })
    .input(z.object({ id: PositiveIdSchema }))
    .output(UserPublicSchema),

  /** POST /v1/user/info/:tag */
  updateUserByTag: oc
    .route({ method: 'POST', path: '/user/info/{tag}' })
    .input(TagOrIdParamSchema.extend({ data: UpdateUserInputSchema }))
    .output(SuccessResponseSchema),

  /** GET /v1/user/info/:tag/:id */
  getUserByTagAndId: oc
    .route({ method: 'GET', path: '/user/info/{tag}/{id}' })
    .input(TagAndIdParamSchema)
    .output(UserPublicSchema),

  /** POST /v1/user — update current user */
  updateMe: oc
    .route({ method: 'POST', path: '/user' })
    .input(UpdateUserInputSchema)
    .output(SuccessResponseSchema),

  /** GET /v1/magic */
  getMagic: oc
    .route({ method: 'GET', path: '/magic' })
    .output(z.object({ magic: z.string() })),

  /** POST /v1/bind/wallet */
  bindWallet: oc
    .route({ method: 'POST', path: '/bind/wallet' })
    .input(BindWalletInputSchema)
    .output(SuccessResponseSchema),

  /** POST /v1/privy/token/auth */
  privyTokenAuth: oc
    .route({ method: 'POST', path: '/privy/token/auth' })
    .input(PrivyTokenAuthInputSchema)
    .output(AuthTokenResponseSchema),

  /** POST /v1/bind/openbuild */
  bindOpenBuild: oc
    .route({ method: 'POST', path: '/bind/openbuild' })
    .input(OpenBuildBindInputSchema)
    .output(SuccessResponseSchema),

  /** GET /v1/openbuild/record */
  getOpenBuildRecord: oc
    .route({ method: 'GET', path: '/openbuild/record' })
    .output(z.record(z.string(), z.unknown()).nullable()),
});

export type AuthContract = typeof authContract;
