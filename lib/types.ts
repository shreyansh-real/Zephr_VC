/**
 * Type definitions for all Firestore collections.
 * These mirror the data model defined in Agent.md.
 *
 * NEVER trust a societyId from the client — Firestore Security Rules
 * enforce membership on every path.
 */

import { Timestamp, FieldValue } from "firebase/firestore";

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "resident" | "volunteer" | "admin";
export type MemberStatus = "pending" | "active" | "removed";
export type ComplaintStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "closed";
export type ComplaintCategory =
  | "water"
  | "electricity"
  | "lift"
  | "security"
  | "cleanliness"
  | "parking"
  | "noise"
  | "other";
export type ComplaintPriority = "low" | "medium" | "high" | "critical";
export type ComplaintVisibility = "public" | "private";
export type UnitType = "flat" | "room" | "shop" | "chawl";

// ── societies/{sid} ──────────────────────────────────────────────────────────

export interface Society {
  name: string;
  type: string;        // e.g. "apartment", "chawl", "row-house"
  address: string;
  inviteCode: string;  // short alphanumeric code
  createdBy: string;   // uid
  createdAt: Timestamp;
}

// ── societies/{sid}/members/{uid} ────────────────────────────────────────────

export interface Member {
  name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  unitId: string | null;
  status: MemberStatus;
  joinedAt: Timestamp;
}

// ── societies/{sid}/units/{unitId} ───────────────────────────────────────────

export interface Unit {
  label: string;   // e.g. "A-402", "Room 12"
  group: string;   // e.g. "Wing A", "Chawl 3"
  type: UnitType;
}

// ── societies/{sid}/complaints/{cid} ────────────────────────────────────────

export interface Complaint {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  visibility: ComplaintVisibility;
  createdBy: string;   // uid
  unitId: string | null;
  assignedTo: string | null;  // uid of volunteer/admin
  photos: string[];    // Storage download URLs (max 3)
  upvoteCount: number; // denormalized counter (never count docs)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── societies/{sid}/complaints/{cid}/updates/{uid} ───────────────────────────

export interface ComplaintUpdate {
  message: string;
  by: string;          // uid
  statusChange: ComplaintStatus | null;
  createdAt: Timestamp;
}

// ── societies/{sid}/complaints/{cid}/upvotes/{uid} ───────────────────────────

export interface Upvote {
  createdAt: Timestamp;
}

// ── inviteCodes/{code} ───────────────────────────────────────────────────────

export interface InviteCode {
  societyId: string;
}

// ── users/{uid} ──────────────────────────────────────────────────────────────

export interface UserProfile {
  societyIds: string[];
  preferredLanguage: "en" | "hi" | "mr";
}

// ── societies/{sid}/notices/{nid} ────────────────────────────────────────────

export interface Notice {
  title: string;
  body: string;          // HTML string from rich-text editor (sanitized subset)
  postedBy: string;      // uid
  postedByName: string;  // display name
  pinned: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Utility: Firestore write types (FieldValue allowed) ──────────────────────

export type WithFieldValue<T> = {
  [K in keyof T]: T[K] | FieldValue;
};
