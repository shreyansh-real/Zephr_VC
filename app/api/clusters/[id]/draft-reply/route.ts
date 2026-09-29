import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { draftReply } from "@/lib/anthropic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
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

  const cluster = clusterSnap.data() as Record<string, unknown>;
  const complaints = complaintsSnap.docs.map((d) => d.data() as Record<string, unknown>);

  // Determine language from complaints (majority or first)
  const langCounts: Record<string, number> = {};
  for (const c of complaints) {
    const lang = c.language as string;
    langCounts[lang] = (langCounts[lang] ?? 0) + 1;
  }
  const language =
    Object.entries(langCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "English";

  const residentNames = complaints.map((c) => c.resident_name as string).filter(Boolean);

  let draft: string;
  try {
    draft = await draftReply({
      clusterTitle: cluster.title as string,
      category: cluster.category as string,
      status: cluster.status as string,
      language,
      residentNames,
    });
  } catch {
    draft = `Dear residents, we have received your complaint about "${cluster.title as string}" and are looking into it. We will update you shortly. Thank you for your patience.`;
  }

  return NextResponse.json({ draft, language });
}
