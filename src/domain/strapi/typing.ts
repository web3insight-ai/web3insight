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

interface StrapiQuery {
  id: number;
  documentId: string;
  query: string;
  keyboard?: string; // Seems like there's a typo in the schema (keyboard vs keyword)
  answer?: string;
  pin: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  user?: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }
}

// Type for query data
interface QueryData {
  query: string;
  keyboard?: string;
  pin?: boolean;
  user?: number;
}

export type { StrapiUser, StrapiAuthResponse, StrapiQuery, QueryData };
