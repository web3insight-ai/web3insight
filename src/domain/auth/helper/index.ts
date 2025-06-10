import type { User } from "../../strapi/typing";

function isManageable(user: User | null): boolean {
  return !!user && ["manager", "admin"].includes(user.role.type);
}

function isAdmin(user: User | null): boolean {
  return !!user && user.role.type === "admin";
}

export { isManageable, isAdmin };
