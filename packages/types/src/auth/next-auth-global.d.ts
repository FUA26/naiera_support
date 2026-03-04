import type { Permission } from "../rbac/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      permissions?: string[]; // Flat array of permission names
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    roleId: string;
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: Permission;
        };
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roleId: string;
    permissions?: string[];
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: Permission;
        };
      }>;
    };
  }
}
