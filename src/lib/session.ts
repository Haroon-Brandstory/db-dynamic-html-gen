import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lp_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(): Promise<string> {
  return new SignJWT({ role: "team" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expected = process.env.TEAM_PASSWORD ?? "";
  if (!expected) return false;
  return password === expected;
}
