import { NextResponse } from "next/server";
import { checkPassword, createSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    if (!checkPassword(body.password ?? "")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = await createSession();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 500 },
    );
  }
}
