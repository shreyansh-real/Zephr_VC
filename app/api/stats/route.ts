import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";

export async function GET() {
  const guard = await requirePasscode();
  if (guard) return guard;

  const db = getDb();
  const [openSnap, resolvedSnap] = await Promise.all([
    db.collection("clusters").where("status", "in", ["New", "Assigned", "In Progress"]).get(),
    db.collection("clusters").where("status", "==", "Resolved").get(),
  ]);

  const openCount = openSnap.size;
  const criticalCount = openSnap.docs.filter((d) => {
    const data = d.data();
    return data.urgency === "Critical";
  }).length;

  // Avg resolution time in hours
  let avgResolutionHours: number | null = null;
  const resolved = resolvedSnap.docs.filter((d) => {
    const data = d.data();
    return data.resolved_at && data.created_at;
  });

  if (resolved.length > 0) {
    const totalMs = resolved.reduce((sum, d) => {
      const data = d.data();
      const start = (data.created_at as { _seconds: number })?._seconds ?? 0;
      const end = (data.resolved_at as { _seconds: number })?._seconds ?? 0;
      return sum + (end - start) * 1000;
    }, 0);
    avgResolutionHours = totalMs / resolved.length / 3_600_000;
  }

  return NextResponse.json({ open_count: openCount, critical_count: criticalCount, avg_resolution_hours: avgResolutionHours });
}
