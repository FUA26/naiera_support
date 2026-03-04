/**
 * NextAuth Type Extensions
 *
 * Extends NextAuth's built-in types to include RBAC fields.
 * This file must be imported somewhere for the type extensions to take effect.
 *
 * Import this in your app or in a layout file:
 * import "@/lib/auth/types";
 */

import type { Permission } from "@/lib/rbac/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      roleName?: string;
      permissions?: Permission[];
      role?: {
        id: string;
        name: string;
        permissions: Array<{
          permission: {
            name: string;
          };
        }>;
      };
    } & DefaultSession["user"];
  }

  interface User {
    roleId: string;
    roleName?: string;
    permissions?: Permission[];
    role?: {
      id: string;
      name: string;
      permissions: Array<{
        permission: {
          name: string;
        };
      }>;
    };
  }
}

// JWT module augmentation - not needed for session strategy
// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     roleId: string;
//     roleName?: string;
//     permissions?: Permission[];
//   }
// }
