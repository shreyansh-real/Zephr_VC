import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("sochi_session")?.value;
  if (session !== "authenticated") {
    redirect("/committee");
  }

  return <DashboardClient />;
}
