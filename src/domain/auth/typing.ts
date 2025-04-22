import type { StrapiUser } from "@/types";

// Authentication types
interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export type { StrapiAuthResponse };
