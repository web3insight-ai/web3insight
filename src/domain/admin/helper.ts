import type { User as StrapiUser } from "../strapi/typing";

import type { Manager } from "./typing";

function isRoleManageable(role: Manager["role"]): boolean {
  return ["manager", "admin"].includes(role);
}

function resolveManager(user: StrapiUser): Manager {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role.type,
    ecosystems: [],
  };
}

export { isRoleManageable, resolveManager };
