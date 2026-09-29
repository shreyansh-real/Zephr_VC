import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { URGENCY_RANK } from "@/lib/schemas";

interface ClusterDoc {
  id: string;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  const guard = await requirePasscode();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const showResolved = searchParams.get("resolved") === "true";
  const filterCategory = searchParams.get("category");
  const filterUrgency = searchParams.get("urgency");
  const filterStatus = searchParams.get("status");

  const db = getDb();

  const snap = showResolved
    ? await db.collection("clusters").get()
    : await db.collection("clusters").where("status", "in", ["New", "Assigned", "In Progress"]).get();

  let clusters: ClusterDoc[] = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // In-memory filter
  if (filterCategory) clusters = clusters.filter((c) => c.category === filterCategory);
  if (filterUrgency) clusters = clusters.filter((c) => c.urgency === filterUrgency);
  if (filterStatus) clusters = clusters.filter((c) => c.status === filterStatus);

  // Sort: urgency_rank desc, complaint_count desc, created_at asc
  clusters.sort((a, b) => {
    const ar = (a.urgency_rank as number) ?? URGENCY_RANK[a.urgency as string] ?? 1;
    const br = (b.urgency_rank as number) ?? URGENCY_RANK[b.urgency as string] ?? 1;
    if (br !== ar) return br - ar;
    const ac = (a.complaint_count as number) ?? 0;
    const bc = (b.complaint_count as number) ?? 0;
    if (bc !== ac) return bc - ac;
    const at = (a.created_at as { _seconds: number } | null)?._seconds ?? 0;
    const bt = (b.created_at as { _seconds: number } | null)?._seconds ?? 0;
    return at - bt;
  });

  return NextResponse.json({ clusters });
}
