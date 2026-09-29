import { NextResponse } from "next/server";
import { getDb, Timestamp } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { PatchClusterSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const guard = await requirePasscode();
  if (guard) return guard;

  const { id } = await params;
  const db = getDb();

  const [clusterSnap, complaintsSnap] = await Promise.all([
    db.collection("clusters").doc(id).get(),
    db.collection("complaints").where("cluster_id", "==", id).get(),
  ]);

  if (!clusterSnap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  type ComplaintDoc = { id: string; created_at?: { _seconds: number } | null; [key: string]: unknown };
  const complaints = (complaintsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as ComplaintDoc[])
    .sort((a, b) => {
      const at = a.created_at?._seconds ?? 0;
      const bt = b.created_at?._seconds ?? 0;
      return at - bt;
    });

  return NextResponse.json({
    cluster: { id: clusterSnap.id, ...(clusterSnap.data() as Record<string, unknown>) },
    complaints,
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requirePasscode();
  if (guard) return guard;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchClusterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const db = getDb();
  const ref = db.collection("clusters").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = snap.data() as Record<string, unknown>;
  const currentStatus = current.status as string;
  const update: Record<string, unknown> = { updated_at: Timestamp.now() };

  // Status transition validation
  const ALLOWED: Record<string, string[]> = {
    New: ["Assigned", "In Progress", "Resolved"],
    Assigned: ["In Progress", "Resolved"],
    "In Progress": ["Resolved"],
    Resolved: ["In Progress"],
  };

  if (parsed.data.status) {
    const nextStatus = parsed.data.status;
    if (!ALLOWED[currentStatus]?.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      );
    }
    update.status = nextStatus;
    if (nextStatus === "Resolved") {
      update.resolved_at = Timestamp.now();
    } else if (nextStatus === "In Progress" && currentStatus === "Resolved") {
      update.resolved_at = null;
    }
  }

  if (parsed.data.assignee !== undefined) {
    update.assignee = parsed.data.assignee;
    // Auto-assign: New -> Assigned when assignee set
    if (parsed.data.assignee && (currentStatus === "New" || update.status === "New")) {
      update.status = "Assigned";
    }
  }

  await ref.update(update);

  // Bump meta/lastChange
  await db.collection("meta").doc("lastChange").set({ ts: Date.now() });

  const updated = await ref.get();
  return NextResponse.json({ cluster: { id: updated.id, ...(updated.data() as Record<string, unknown>) } });
}
