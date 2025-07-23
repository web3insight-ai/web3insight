function getRoleColor(role: string) {
  switch (role.toLowerCase()) {
  case 'admin':
    return 'danger';
  case 'services':
    return 'warning';
  case 'editor':
    return 'secondary';
  case 'user':
    return 'primary';
  default:
    return 'primary';
  }
}

function getRoleName(role: string) {
  switch (role.toLowerCase()) {
  case 'admin':
    return 'Administrator';
  case 'services':
    return 'Service Access';
  case 'editor':
    return 'Editor';
  case 'user':
    return 'Standard User';
  default:
    return 'Standard User';
  }
}

// Get the highest priority role from allowed roles
function getEffectiveRole(defaultRole: string, allowedRoles: string[]): string {
  // Role priority (highest to lowest)
  const rolePriority = ['admin', 'services', 'editor', 'user'];
  
  // Find the highest priority role in allowed roles
  for (const role of rolePriority) {
    if (allowedRoles.includes(role)) {
      return role;
    }
  }
  
  // Fallback to default role
  return defaultRole;
}

export { getRoleName, getRoleColor, getEffectiveRole };
