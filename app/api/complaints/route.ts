import { NextResponse } from "next/server";
import { getDb, FieldValue, Timestamp } from "@/lib/firebase-admin";
import { ComplaintInputSchema, URGENCY_RANK } from "@/lib/schemas";
import { triageComplaint } from "@/lib/anthropic";

// Simple in-memory rate limiter: 10 req/min per IP
const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ComplaintInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { flat_no, resident_name, raw_text } = parsed.data;
  const db = getDb();

  // Fetch open clusters for AI context
  const openSnap = await db
    .collection("clusters")
    .where("status", "in", ["New", "Assigned", "In Progress"])
    .get();

  const openClusters = openSnap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, title: data.title as string, category: data.category as string, urgency: data.urgency as string, count: data.complaint_count as number };
  });

  const openClusterIds = new Set(openClusters.map((c) => c.id));

  // AI triage
  const triage = await triageComplaint({ complaint: { flat_no, raw_text }, openClusters });

  // Validate cluster_id against open list
  if (triage.cluster_id && !openClusterIds.has(triage.cluster_id)) {
    triage.cluster_id = null;
    triage.new_cluster_title = triage.summary;
  }

  const needsReview = triage.confidence < 0.7;
  const urgencyRank = URGENCY_RANK[triage.urgency] ?? 2;
  const now = Timestamp.now();

  const batch = db.batch();
  let clusterId = triage.cluster_id;
  let isNewCluster = false;

  if (clusterId) {
    // Update existing cluster
    const clusterRef = db.collection("clusters").doc(clusterId);
    const clusterSnap = await clusterRef.get();
    const clusterData = clusterSnap.data();
    if (clusterData) {
      const currentRank = clusterData.urgency_rank as number ?? 1;
      const newUrgencyRank = Math.max(currentRank, urgencyRank);
      const newUrgency = Object.entries(URGENCY_RANK).find(([, v]) => v === newUrgencyRank)?.[0] ?? triage.urgency;
      const shouldEscalate =
        (clusterData.complaint_count as number) + 1 >= 5 &&
        newUrgencyRank < 4 &&
        !clusterData.escalated;
      const escalatedRank = shouldEscalate ? Math.min(newUrgencyRank + 1, 4) : newUrgencyRank;
      const escalatedUrgency = shouldEscalate
        ? Object.entries(URGENCY_RANK).find(([, v]) => v === escalatedRank)?.[0] ?? newUrgency
        : newUrgency;

      batch.update(clusterRef, {
        complaint_count: FieldValue.increment(1),
        flats: FieldValue.arrayUnion(flat_no),
        urgency: escalatedUrgency,
        urgency_rank: escalatedRank,
        needs_review: needsReview ? true : clusterData.needs_review,
        escalated: shouldEscalate || clusterData.escalated,
        escalation_reason: shouldEscalate
          ? `Auto-escalated: ${(clusterData.complaint_count as number) + 1} complaints reached threshold.`
          : clusterData.escalation_reason ?? null,
        updated_at: now,
      });
    }
  } else {
    // Create new cluster
    isNewCluster = true;
    const clusterRef = db.collection("clusters").doc();
    clusterId = clusterRef.id;
    batch.set(clusterRef, {
      title: triage.new_cluster_title ?? triage.summary,
      category: triage.category,
      urgency: triage.urgency,
      urgency_rank: urgencyRank,
      status: "New",
      assignee: null,
      complaint_count: 1,
      flats: [flat_no],
      needs_review: needsReview,
      escalated: false,
      escalation_reason: null,
      created_at: now,
      updated_at: now,
      resolved_at: null,
    });
  }

  // Create complaint
  const complaintRef = db.collection("complaints").doc();
  batch.set(complaintRef, {
    cluster_id: clusterId,
    flat_no,
    resident_name,
    raw_text,
    language: triage.language,
    category: triage.category,
    urgency: triage.urgency,
    summary: triage.summary,
    confidence: triage.confidence,
    reason: triage.reason,
    needs_review: needsReview,
    draft_reply: null,
    reply_sent_at: null,
    created_at: now,
  });

  // Bump meta/lastChange
  batch.set(db.collection("meta").doc("lastChange"), { ts: Date.now() });

  await batch.commit();

  // Get cluster count for confirmation
  let clusterCount = 1;
  if (!isNewCluster && clusterId) {
    const snap = await db.collection("clusters").doc(clusterId).get();
    clusterCount = (snap.data()?.complaint_count as number) ?? 1;
  }

  return NextResponse.json({
    category: triage.category,
    urgency: triage.urgency,
    summary: triage.summary,
    cluster_size: clusterCount,
    needs_review: needsReview,
  });
}
