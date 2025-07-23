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

function isManageable(user: ApiUser | null): boolean {
  return isServices(user) || isAdmin(user);
}

export { hasRole, isServices, isAdmin, isManageable };
