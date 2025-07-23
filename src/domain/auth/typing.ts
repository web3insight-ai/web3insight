interface UserProfile {
  user_id: string;
  user_nick_name: string;
  user_avatar: string;
  created_at: string;
  updated_at: string;
}

interface UserBind {
  bind_key: string;
  bind_type: "github" | "email";
}

interface UserRole {
  allowed_roles: string[];
  default_role: string;
  user_id: string;
}

interface ApiUser {
  profile: UserProfile;
  binds: UserBind[];
  role: UserRole;
  id: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  avatar_url: string;
}

interface ApiAuthResponse {
  token: string;
  user?: ApiUser;
}

interface GitHubOAuthRequest {
  type: "github";
  code: string;
}

type RoleType = "user" | "ecosystem" | "hackathon" | "services" | "admin";

export type { ApiUser, ApiAuthResponse, GitHubOAuthRequest, UserProfile, UserBind, UserRole, RoleType };
