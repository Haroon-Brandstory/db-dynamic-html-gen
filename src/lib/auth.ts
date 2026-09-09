import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  checkPassword,
  createSession,
  verifySessionToken,
} from "./session";

export {
  SESSION_COOKIE as sessionCookieName,
  checkPassword,
  createSession,
  verifySessionToken,
};

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
