import { z } from 'zod';

export const PrivyTokenAuthInputSchema = z.object({
  id_token: z.string().min(1),
});

export const AuthTokenResponseSchema = z.object({
  token: z.string(),
  user_id: z.number().int().optional(),
});

export const UserPublicSchema = z.object({
  id: z.number().int(),
  user_nick_name: z.string().nullable(),
  user_avatar: z.string().nullable(),
  user_bio: z.string().nullable(),
  user_title: z.string().nullable(),
  user_custom_labels: z.array(z.string()).optional(),
});

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
