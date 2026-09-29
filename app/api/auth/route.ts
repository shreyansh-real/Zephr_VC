import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { passcode?: string };
    const passcode = process.env.COMMITTEE_PASSCODE;
    if (!passcode) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }
    if (body.passcode !== passcode) {
      return NextResponse.json({ error: "That passcode is incorrect. Check with the committee head." }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set("sochi_session", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("sochi_session");
  return NextResponse.json({ ok: true });
}
