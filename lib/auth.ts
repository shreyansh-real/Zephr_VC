import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requirePasscode(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("sochi_session")?.value;
  if (session !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
