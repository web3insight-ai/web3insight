import type { User } from "../../strapi/typing";

function isAdmin(user: User | null): boolean {
  return !!user && user.role.type === "manager";
}

export { isAdmin };
