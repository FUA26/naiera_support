/**
 * NextAuth Configuration
 *
 * @pattern Authentication/Authorization
 * @pattern RBAC (Role-Based Access Control)
 *
 * Configures NextAuth.js for authentication with credentials provider.
 * Integrates with the RBAC system by loading user roles and permissions
 * into the session token for client-side access.
 *
 * Dependencies:
 * - next-auth: Authentication framework
 * - bcryptjs: Password hashing for verification
 * - @/lib/db/prisma: Database client for user lookups
 *
 * Features:
 * - JWT-based sessions for scalability
 * - Credentials provider for email/password login
 * - Role and permission loading into session
 * - Custom sign-in and error pages
 *
 * @see @/lib/auth/permissions.ts for permission checking helpers
 * @see @/lib/rbac/ for RBAC implementation
 */

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * NextAuth configuration object
 * Defines session strategy, pages, providers, and callbacks
 */
const config: NextAuthConfig = {
  // Use JWT strategy for stateless, scalable sessions
  session: { strategy: "jwt" },

  // Custom pages for authentication flow
  pages: {
    signIn: "/login", // Redirect here when user needs to sign in
    error: "/login", // Show errors on login page
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Verify user credentials and return user object if valid
       *
       * @param credentials - User-provided email and password
       * @returns User object with role and permissions if authenticated, null otherwise
       *
       * Authentication flow:
       * 1. Validate credentials are present
       * 2. Find user by email in database
       * 3. Compare password hash
       * 4. Load user's role and associated permissions
       * 5. Return user object for session creation
       */
      async authorize(credentials) {
        // Ensure credentials were provided
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch user with role and permissions in a single query
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // User must exist and have a password (not OAuth-only user)
        if (!user || !user.password) return null;

        // Verify password against hash
        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) return null;

        // Return user object with role data for JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          role: user.role
            ? {
                id: user.role.id,
                name: user.role.name,
                permissions: user.role.permissions.map((rp) => ({
                  permission: {
                    name: rp.permission.name,
                  },
                })),
              }
            : undefined,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     * Adds user-specific data to the token for client-side access
     *
     * @param token - The existing JWT token
     * @param user - User object from authorize() (only on sign in)
     * @returns Enhanced token with user data
     */
    async jwt({ token, user }) {
      // Only add user data on initial sign in
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.role = user.role;
        // Extract permissions as flat array for easier access
        if (user.role) {
          token.permissions = user.role.permissions.map((rp) => rp.permission.name);
        }
      }
      return token;
    },

    /**
     * Session callback - called whenever session is checked
     * Exposes token data to the client via the session object
     *
     * @param session - The session object exposed to client
     * @param token - The JWT token containing user data
     * @returns Enhanced session with user data
     */
    async session({ session, token }) {
      // Add user ID and role ID to session
      if (token.id) {
        session.user.id = token.id as string;
        session.user.roleId = token.roleId as string;
      }
      // Add full role object to session
      if (token.role) {
        session.user.role = token.role as {
          id: string;
          name: string;
          permissions: Array<{
            permission: {
              name: string;
            };
          }>;
        };
      }
      // Add flattened permissions array for easy checking
      if (token.permissions) {
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
};

/**
 * Export NextAuth handlers and utilities
 * - handlers: For API route (app/api/auth/[...nextauth]/route.ts)
 * - auth: Helper to get session server-side
 * - signIn/signOut: Functions for programmatic auth flow
 */
export const { handlers, auth, signIn, signOut } = NextAuth(config);
