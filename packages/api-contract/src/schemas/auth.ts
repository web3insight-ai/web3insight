import { z } from 'zod';

export const PrivyTokenAuthInputSchema = z.object({
  id_token: z.string().min(1),
});

// Reason: AuthTokenResponseSchema + UserPublicSchema are returned to dev-card
// and dashboard which consume backend-extra fields (profile.*, binds, inviter,
// openbuild_bound, github_login, etc.). `.loose()` (zod 4 equivalent of v3
// `.passthrough()`) keeps unknown fields instead of stripping them so the
// orpc client returns the full backend shape while the typed core stays
// declared here.
export const AuthTokenResponseSchema = z
  .object({
    token: z.string(),
    user_id: z.number().int().optional(),
  })
  .loose();

export const UserPublicSchema = z
  .object({
    id: z.number().int(),
    user_nick_name: z.string().nullable(),
    user_avatar: z.string().nullable(),
    user_bio: z.string().nullable(),
    user_title: z.string().nullable(),
    user_custom_labels: z.array(z.string()).optional(),
  })
  .loose();

export const UpdateUserInputSchema = z.object({
  user_nick_name: z.string().optional(),
  user_avatar: z.string().optional(),
  user_bio: z.string().optional(),
  user_custom_x: z.string().optional(),
  user_custom_labels: z.array(z.string()).optional(),
  user_title: z.string().optional(),
  invite_code: z.string().optional(),
});

export const UpdateUserExtraInputSchema = z.object({
  user_extra: z.record(z.string(), z.unknown()),
});

export const OpenBuildBindInputSchema = z.object({
  code: z.string().min(1),
});
