import { cookies } from "next/headers";
import { db } from "@/lib/db";
import crypto from "crypto";

const SESSION_COOKIE = "videla_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

/** Create a session token, store it in DB-less cookie (signed payload) */
function encodeSession(user: SessionUser): string {
  const payload = JSON.stringify(user);
  const secret = process.env.SESSION_SECRET || "videla-default-secret-change-me";
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hmac })).toString("base64");
}

function decodeSession(token: string): SessionUser | null {
  try {
    const secret = process.env.SESSION_SECRET || "videla-default-secret-change-me";
    const { payload, hmac } = JSON.parse(Buffer.from(token, "base64").toString());
    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (hmac !== expectedHmac) return null;
    return JSON.parse(payload) as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const token = encodeSession(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Verify current session user exists in DB and return their role */
export async function getVerifiedSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  
  try {
    const user = await db.user.findUnique({ 
      where: { id: session.id }, 
      select: { id: true, role: true } 
    });
    if (!user) return null;
    return session;
  } catch {
    return null;
  }
}

/** Guard helper: throws if not authenticated or wrong role */
export async function requireAuth(allowedRoles?: string[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("NO_AUTH");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
