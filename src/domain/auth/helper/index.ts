import type { StrapiUser } from "../../strapi/typing";

function isAdmin(user: StrapiUser): boolean {
  return !!user;
}

export { isAdmin };
