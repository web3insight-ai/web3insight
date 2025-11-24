import type { ApiUser } from "../typing";

function hasRole(user: ApiUser | null, role: string): boolean {
  if (!user || !user.role) return false;
  return user.role.allowed_roles.includes(role) || user.role.default_role === role;
}

function isServices(user: ApiUser | null): boolean {
  return hasRole(user, "services");
}

function isAdmin(user: ApiUser | null): boolean {
  return hasRole(user, "admin");
}

function isEditor(user: ApiUser | null): boolean {
  return hasRole(user, "editor");
}

function isManageable(user: ApiUser | null): boolean {
  return isServices(user) || isAdmin(user);
}

function isEcosystemManager(user: ApiUser | null): boolean {
  return hasRole(user, "ecosystem");
}

function isHackathonManager(user: ApiUser | null): boolean {
  return hasRole(user, "hackathon");
}

function canManageEcosystems(user: ApiUser | null): boolean {
  return isEcosystemManager(user) || isServices(user) || isAdmin(user);
}

function canManageEvents(user: ApiUser | null): boolean {
  return isHackathonManager(user) || isServices(user) || isAdmin(user);
}

function isContentManager(user: ApiUser | null): boolean {
  return isEditor(user) || isServices(user) || isAdmin(user);
}

export {
  hasRole,
  isServices,
  isAdmin,
  isEditor,
  isEcosystemManager,
  isHackathonManager,
  canManageEcosystems,
  canManageEvents,
  isManageable,
  isContentManager,
};

export { getPrivyUserDisplayInfo } from "./privy-user";
export type { UserDisplayInfo } from "./privy-user";
