import type { AppRole } from "./auth";

const permissions: Record<AppRole, string[]> = {
  admin: ["read", "write", "score", "approve_outreach", "settings"],
  growth: ["read", "write", "score", "draft_outreach"],
  viewer: ["read"],
  owner: ["read", "view_own_clinic"]
};

export function can(role: AppRole | undefined, action: string) {
  if (!role) return false;
  return permissions[role]?.includes(action) ?? false;
}

export function roleLabel(role: AppRole | undefined) {
  if (!role) return "Viewer";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
