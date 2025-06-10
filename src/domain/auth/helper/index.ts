import type { User } from "../../strapi/typing";
import { isRoleManageable } from "../../admin/helper";

function isManageable(user: User | null): boolean {
  return !!user && isRoleManageable(user.role.type);
}

function isAdmin(user: User | null): boolean {
  return !!user && user.role.type === "admin";
}

export { isManageable, isAdmin };
