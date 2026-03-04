/**
 * NextAuth Type Extensions
 *
 * Extends NextAuth's built-in types to include RBAC fields.
 * This file must be imported somewhere for the type extensions to take effect.
 */

import type { Permission } from "../rbac/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      roleName?: string;
      permissions?: Permission[];
    };
  }

  interface User {
    roleId: string;
    roleName?: string;
    permissions?: Permission[];
  }
}
