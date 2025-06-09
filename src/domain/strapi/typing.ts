interface Entry {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

type RoleType = "public" | "authenticated" | "manager";

interface Role extends Entry {
  name: string;
  description: string;
  type: RoleType;
}

interface User extends Entry {
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: Role;
}

// Authentication types
interface StrapiAuthResponse {
  jwt: string;
  user: User;
}

interface StrapiQuery extends Entry {
  query: string;
  keyboard?: string; // Seems like there's a typo in the schema (keyboard vs keyword)
  answer?: string;
  pin: boolean;
  user?: User;
}

// Type for query data
interface QueryData {
  query: string;
  keyboard?: string;
  pin?: boolean;
  user?: number;
}

export type { RoleType, User, StrapiAuthResponse, StrapiQuery, QueryData };
