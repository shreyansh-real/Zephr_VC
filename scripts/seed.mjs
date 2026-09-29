// @ts-check
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function init() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
    process.exit(1);
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

init();
const db = getFirestore();
const now = Timestamp.now();

const URGENCY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

/** @type {Array<{title:string,category:string,urgency:string,status:string,assignee:string|null,complaints:Array<{flat_no:string,resident_name:string,raw_text:string,language:string,category:string,urgency:string,summary:string,confidence:number,reason:string}>}>} */
const seed = [
  {
    title: "No water in Block B",
    category: "Water",
    urgency: "High",
    status: "In Progress",
    assignee: "Rakesh Verma",
    complaints: [
      { flat_no: "B-204", resident_name: "Ramesh Kumar", raw_text: "B-204 mein subah se paani nahi aa raha", language: "Hinglish", category: "Water", urgency: "High", summary: "No water since morning in B-204", confidence: 0.92, reason: "Water supply disrupted for many flats since morning." },
      { flat_no: "B-207", resident_name: "Sunita Rao", raw_text: "No water since morning in B wing", language: "English", category: "Water", urgency: "High", summary: "No water in B wing since morning", confidence: 0.95, reason: "Multiple flats reporting no water." },
      { flat_no: "B-310", resident_name: "Anil Mehta", raw_text: "B-310 tanki mein pressure zero, kya ho raha hai", language: "Hinglish", category: "Water", urgency: "High", summary: "Zero water pressure in B-310", confidence: 0.88, reason: "Wing-wide water pressure issue." },
      { flat_no: "B-101", resident_name: "Kavya Iyer", raw_text: "Paani bilkul nahi hai, please check karo", language: "Hinglish", category: "Water", urgency: "High", summary: "No water supply in B-101", confidence: 0.90, reason: "Block-wide water outage reported." },
      { flat_no: "B-405", resident_name: "Deepak Shah", raw_text: "B wing water supply band hai since 6am", language: "Hinglish", category: "Water", urgency: "High", summary: "Water supply off since 6am in B wing", confidence: 0.93, reason: "Extended water outage affecting wing." },
      { flat_no: "B-302", resident_name: "Meena Sinha", raw_text: "No water in flat, taps are dry", language: "English", category: "Water", urgency: "High", summary: "Dry taps in B-302", confidence: 0.91, reason: "Water supply completely disrupted." },
    ],
  },
  {
    title: "Lift A not working",
    category: "Lift",
    urgency: "High",
    status: "Assigned",
    assignee: "Meera Sharma",
    complaints: [
      { flat_no: "A-501", resident_name: "Rahul Singh", raw_text: "Lift A not working since last night", language: "English", category: "Lift", urgency: "High", summary: "Lift A broken since last night", confidence: 0.96, reason: "Lift out of service overnight, residents stranded." },
      { flat_no: "A-302", resident_name: "Geeta Pillai", raw_text: "Lift A band hai, elderly log pareshaan", language: "Hinglish", category: "Lift", urgency: "High", summary: "Lift A broken, elderly residents affected", confidence: 0.92, reason: "Elderly residents cannot use stairs safely." },
      { flat_no: "A-201", resident_name: "Ravi Nair", raw_text: "A wing lift still not repaired?", language: "English", category: "Lift", urgency: "High", summary: "Lift A still not repaired", confidence: 0.89, reason: "Ongoing lift failure in A wing." },
    ],
  },
  {
    title: "Parking encroachment",
    category: "Parking",
    urgency: "Medium",
    status: "New",
    assignee: null,
    complaints: [
      { flat_no: "C-101", resident_name: "Priya Verma", raw_text: "Someone parked in my slot again, third time this week", language: "English", category: "Parking", urgency: "Medium", summary: "Recurring parking slot encroachment in C-101", confidence: 0.87, reason: "Recurring nuisance affecting resident convenience." },
      { flat_no: "C-205", resident_name: "Arjun Sharma", raw_text: "Meri parking pe koi aur gaadi khadi hai", language: "Hinglish", category: "Parking", urgency: "Medium", summary: "Unknown car parked in C-205 slot", confidence: 0.85, reason: "Parking obstruction is a medium comfort issue." },
      { flat_no: "C-308", resident_name: "Sneha Desai", raw_text: "Visitor parked blocking my spot again", language: "English", category: "Parking", urgency: "Medium", summary: "Visitor car blocking C-308 parking", confidence: 0.83, reason: "Parking area management issue." },
      { flat_no: "C-112", resident_name: "Vikas Tiwari", raw_text: "Car DL-7C-1234 blocking my parking daily", language: "English", category: "Parking", urgency: "Medium", summary: "Specific vehicle repeatedly blocking C-112", confidence: 0.90, reason: "Repeated parking violation needs attention." },
    ],
  },
  {
    title: "Garbage not collected",
    category: "Cleaning",
    urgency: "Medium",
    status: "New",
    assignee: null,
    complaints: [
      { flat_no: "A-103", resident_name: "Mohan Gupta", raw_text: "Kachra 2 din se nahi utha, bahut smell aa rahi hai", language: "Hinglish", category: "Cleaning", urgency: "Medium", summary: "Garbage not collected for 2 days, bad smell", confidence: 0.91, reason: "Repeated garbage collection failure causing nuisance." },
      { flat_no: "B-201", resident_name: "Anjali Singh", raw_text: "Garbage pile near gate 2, attracting stray dogs", language: "English", category: "Cleaning", urgency: "Medium", summary: "Garbage pile at gate 2 attracting strays", confidence: 0.88, reason: "Uncollected garbage becoming safety concern." },
      { flat_no: "C-401", resident_name: "Suresh Patil", raw_text: "Dustbin area overflowing, please send cleaner", language: "English", category: "Cleaning", urgency: "Medium", summary: "Dustbin area overflowing in C-401 region", confidence: 0.85, reason: "Overflow indicates missed collection." },
    ],
  },
  {
    title: "Suspicious person at main gate",
    category: "Security",
    urgency: "Critical",
    status: "Assigned",
    assignee: "Priya Nair",
    complaints: [
      { flat_no: "D-101", resident_name: "Anita Kapoor", raw_text: "Gate pe koi anjaan aadmi ghoom raha hai, security nahi hai", language: "Hinglish", category: "Security", urgency: "Critical", summary: "Unknown person loitering at gate with no security", confidence: 0.95, reason: "Unknown person at gate is a safety risk." },
    ],
  },
  {
    title: "Late-night noise from flat",
    category: "Noise",
    urgency: "Medium",
    status: "New",
    assignee: null,
    complaints: [
      { flat_no: "C-402", resident_name: "Rohit Jain", raw_text: "Flat C-402 mein raat 1 baje tak music, neend nahi aati", language: "Hinglish", category: "Noise", urgency: "Medium", summary: "Loud music from C-402 until 1am nightly", confidence: 0.88, reason: "Repeated late-night disturbance affecting residents." },
      { flat_no: "C-401", resident_name: "Lata Sharma", raw_text: "Noise from upstairs flat every night after midnight", language: "English", category: "Noise", urgency: "Medium", summary: "Nightly noise from upstairs after midnight", confidence: 0.85, reason: "Repeated disturbance during sleep hours." },
    ],
  },
];

async function seedData() {
  console.log("Seeding data...");
  const batch = db.batch();

  // Seed volunteers
  const volNames = ["Meera Sharma", "Rakesh Verma", "Priya Nair", "Suresh Pillai"];
  for (const name of volNames) {
    const ref = db.collection("volunteers").doc();
    batch.set(ref, { name });
  }

  for (const cluster of seed) {
    const clusterRef = db.collection("clusters").doc();
    const urgencyRank = URGENCY_RANK[cluster.urgency] ?? 1;
    const shouldEscalate = cluster.complaints.length >= 5 && urgencyRank < 4;
    const escalatedRank = shouldEscalate ? Math.min(urgencyRank + 1, 4) : urgencyRank;
    const escalatedUrgency = shouldEscalate
      ? Object.entries(URGENCY_RANK).find(([, v]) => v === escalatedRank)?.[0] ?? cluster.urgency
      : cluster.urgency;
    const flats = [...new Set(cluster.complaints.map((c) => c.flat_no))];

    const daysAgo = Math.random() * 3;
    const createdAt = Timestamp.fromDate(new Date(Date.now() - daysAgo * 86400 * 1000));

    batch.set(clusterRef, {
      title: cluster.title,
      category: cluster.category,
      urgency: escalatedUrgency,
      urgency_rank: escalatedRank,
      status: cluster.status,
      assignee: cluster.assignee,
      complaint_count: cluster.complaints.length,
      flats,
      needs_review: cluster.complaints.some((c) => c.confidence < 0.7),
      escalated: shouldEscalate,
      escalation_reason: shouldEscalate ? `Auto-escalated: ${cluster.complaints.length} complaints reached threshold.` : null,
      created_at: createdAt,
      updated_at: now,
      resolved_at: cluster.status === "Resolved" ? now : null,
    });

    for (const complaint of cluster.complaints) {
      const complaintRef = db.collection("complaints").doc();
      const compCreated = Timestamp.fromDate(
        new Date(Date.now() - (daysAgo + Math.random() * 0.5) * 86400 * 1000)
      );
      batch.set(complaintRef, {
        cluster_id: clusterRef.id,
        flat_no: complaint.flat_no,
        resident_name: complaint.resident_name,
        raw_text: complaint.raw_text,
        language: complaint.language,
        category: complaint.category,
        urgency: complaint.urgency,
        summary: complaint.summary,
        confidence: complaint.confidence,
        reason: complaint.reason,
        needs_review: complaint.confidence < 0.7,
        draft_reply: null,
        reply_sent_at: null,
        ai_provider: "seed",
        created_at: compCreated,
      });
    }
  }

  batch.set(db.collection("meta").doc("lastChange"), { ts: Date.now() });
  await batch.commit();
  console.log(`Seeded ${seed.length} clusters with ${seed.reduce((s, c) => s + c.complaints.length, 0)} complaints.`);
}

seedData().catch(console.error).finally(() => process.exit(0));
