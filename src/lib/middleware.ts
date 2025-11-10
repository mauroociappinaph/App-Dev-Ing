import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@prisma/client";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = 10; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    level: string;
    totalXP: number;
    streak: number;
  };
}

export async function withAuth(
  request: NextRequest,
  requiredRoles?: UserRole[]
): Promise<
  | { user: any; response?: NextResponse }
  | { user?: never; response: NextResponse }
> {
  try {
    // Check rate limiting
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return {
        response: NextResponse.json(
          { success: false, error: "Rate limit exceeded" },
          { status: 429 }
        ),
      };
    }

    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        response: NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Check role-based access if required
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = (session.user as any).role;
      if (!requiredRoles.includes(userRole)) {
        return {
          response: NextResponse.json(
            { success: false, error: "Insufficient permissions" },
            { status: 403 }
          ),
        };
      }
    }

    return { user: session.user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      response: NextResponse.json(
        { success: false, error: "Authentication error" },
        { status: 500 }
      ),
    };
  }
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const windowKey = `${clientIP}:${Math.floor(now / RATE_LIMIT_WINDOW)}`;

  const current = rateLimitStore.get(windowKey) || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW,
  };

  if (now > current.resetTime) {
    // Reset window
    rateLimitStore.set(windowKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  current.count++;
  rateLimitStore.set(windowKey, current);
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Helper functions for different auth levels
export const requireUser = (request: NextRequest) =>
  withAuth(request, [UserRole.USER, UserRole.EDITOR, UserRole.ADMIN]);

export const requireEditor = (request: NextRequest) =>
  withAuth(request, [UserRole.EDITOR, UserRole.ADMIN]);

export const requireAdmin = (request: NextRequest) =>
  withAuth(request, [UserRole.ADMIN]);
