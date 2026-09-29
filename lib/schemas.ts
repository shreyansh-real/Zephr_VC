import { z } from "zod";

export const CATEGORIES = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"] as const;
export const URGENCIES = ["Critical", "High", "Medium", "Low"] as const;
export const STATUSES = ["New", "Assigned", "In Progress", "Resolved"] as const;
export const LANGUAGES = ["English", "Hindi", "Hinglish"] as const;

export const URGENCY_RANK: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const ComplaintInputSchema = z.object({
  flat_no: z
    .string()
    .min(1, "Flat number is required")
    .regex(/^[A-Za-z0-9][-A-Za-z0-9]{0,9}$/, "Invalid flat number (e.g. B-204 or 101)"),
  resident_name: z.string().min(1, "Name is required").max(100),
  raw_text: z
    .string()
    .min(10, "Complaint must be at least 10 characters")
    .max(1000, "Complaint must be at most 1000 characters"),
});

export type ComplaintInput = z.infer<typeof ComplaintInputSchema>;

export const TriageOutputSchema = z.object({
  category: z.enum(CATEGORIES),
  urgency: z.enum(URGENCIES),
  summary: z.string().max(120),
  language: z.enum(LANGUAGES),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  cluster_id: z.string().nullable(),
  new_cluster_title: z.string().nullable(),
});

export type TriageOutput = z.infer<typeof TriageOutputSchema>;

export const PatchClusterSchema = z.object({
  status: z.enum(STATUSES).optional(),
  assignee: z.string().nullable().optional(),
});

export type PatchCluster = z.infer<typeof PatchClusterSchema>;

export const SendReplySchema = z.object({
  reply_text: z.string().min(1, "Reply cannot be empty"),
});

export type SendReply = z.infer<typeof SendReplySchema>;

export const SendLiveSchema = z.object({
  complaintId: z.string().min(1, "complaintId is required"),
  message: z.string().min(1, "message cannot be empty"),
});

export type SendLive = z.infer<typeof SendLiveSchema>;
