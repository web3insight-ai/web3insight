import type { User as StrapiUser } from "../strapi/typing";

import type { Manager } from "./typing";

function isRoleManageable(role: Manager["role"]): boolean {
  return ["manager", "admin"].includes(role);
}

function resolveEcosystems(raw: string): string[] {
  const ecosystems: string[] = [];

  raw.trim().split(",").forEach(partial => {
    const eco = partial.trim();

    if (eco) {
      ecosystems.push(eco);
    }
  });

  return ecosystems;
}

function resolveManager(user: StrapiUser): Manager {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role.type,
    ecosystems: resolveEcosystems(user.ecosystem || ""),
  };
}

export { isRoleManageable, resolveManager };
