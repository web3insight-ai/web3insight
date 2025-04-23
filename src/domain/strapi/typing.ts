interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export type { StrapiUser, StrapiAuthResponse };
