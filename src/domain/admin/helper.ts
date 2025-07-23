import type { ApiUser } from "../auth/typing";

import type { Manager } from "./typing";

function isRoleManageable(role: Manager["role"]): boolean {
  return ["services", "admin"].includes(role);
}

// Currently unused but may be needed for future ecosystem management
// function resolveEcosystems(raw: string): string[] {
//   const ecosystems: string[] = [];

//   raw.trim().split(",").forEach(partial => {
//     const eco = partial.trim();

//     if (eco) {
//       ecosystems.push(eco);
//     }
//   });

//   return ecosystems;
// }

function resolveManager(user: ApiUser): Manager {
  // For now, we'll use default role as the primary role
  const primaryRole = user.role.default_role as Manager["role"];
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: primaryRole,
    ecosystems: [], // TODO: Extract from user profile if needed
  };
}

export { isRoleManageable, resolveManager };
