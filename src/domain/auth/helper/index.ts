import type { StrapiUser } from "../../strapi/typing";

function isAdmin(user: StrapiUser | null): boolean {
  return !!user;
}

export { isAdmin };
