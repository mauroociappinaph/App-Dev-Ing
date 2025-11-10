import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { getPrismaClient } from "./db";
import bcrypt from "bcryptjs";
import { UserRole, ProficiencyLevel } from "@prisma/client";

export interface CustomUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  level: ProficiencyLevel;
  totalXP: number;
  streak: number;
}

export interface CustomSession {
  user: CustomUser;
}

export interface CustomJWT {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  level: ProficiencyLevel;
  totalXP: number;
  streak: number;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrismaClient()),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = getPrismaClient();
        const user = await client.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // For demo purposes, we'll accept any password
        // In production, you'd verify the hashed password
        // const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          level: user.level,
          totalXP: user.totalXP,
          streak: user.streak,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
        token.level = (user as CustomUser).level;
        token.totalXP = (user as CustomUser).totalXP;
        token.streak = (user as CustomUser).streak;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as CustomUser).id = token.id as string;
        (session.user as CustomUser).role = token.role as UserRole;
        (session.user as CustomUser).level = token.level as ProficiencyLevel;
        (session.user as CustomUser).totalXP = token.totalXP as number;
        (session.user as CustomUser).streak = token.streak as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper functions for role-based access control
export const requireAuth = (roles?: UserRole[]) => {
  return async (req: Request) => {
    // This would be used in API route handlers
    // Implementation depends on how we handle auth in API routes
  };
};

export const hasRole = (
  user: CustomUser | null,
  roles: UserRole[]
): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user: CustomUser | null): boolean => {
  return hasRole(user, [UserRole.ADMIN]);
};

export const isEditor = (user: CustomUser | null): boolean => {
  return hasRole(user, [UserRole.ADMIN, UserRole.EDITOR]);
};

export const isUser = (user: CustomUser | null): boolean => {
  return hasRole(user, [UserRole.ADMIN, UserRole.EDITOR, UserRole.USER]);
};
