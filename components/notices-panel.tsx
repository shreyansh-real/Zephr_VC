"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Notice } from "@/lib/types";
import { Megaphone, Pin, Loader2 } from "lucide-react";

/** Left-side vertical panel showing admin-posted notices on the Public Noticeboard. */
export function NoticesPanel() {
  const { currentSocietyId } = useAuth();
  const [notices, setNotices] = useState<Array<{ id: string; notice: Notice }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!currentSocietyId) { setLoading(false); return; }

    (async () => {
      try {
        const q = query(
          collection(db, "societies", currentSocietyId, "notices"),
          orderBy("pinned", "desc"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (!active) return;
        const list: Array<{ id: string; notice: Notice }> = [];
        snap.forEach((d) => list.push({ id: d.id, notice: d.data() as Notice }));
        setNotices(list);
      } catch (err) {
        console.error("Notices fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [currentSocietyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="py-6 text-center">
        <Megaphone className="w-7 h-7 text-[var(--muted)] mx-auto mb-2 opacity-40" />
        <p className="text-xs text-[var(--muted)] font-medium">No notices posted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notices.map(({ id, notice }) => (
        <div
          key={id}
          className={`p-3.5 rounded-lg border text-sm ${
            notice.pinned
              ? "bg-[var(--accent-tint)] border-[var(--accent)]"
              : "bg-[var(--surface)] border-[var(--border-token)]"
          }`}
        >
          <div className="flex items-start gap-1.5 mb-1.5">
            {notice.pinned && (
              <Pin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
            )}
            <p className="font-bold text-[var(--ink)] text-sm leading-snug">{notice.title}</p>
          </div>
          {/* Render rich text body as HTML — content is posted only by trusted staff */}
          <div
            className="text-xs text-[var(--muted)] leading-relaxed prose-reset notice-body"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: notice.body }}
          />
          <p className="text-[10px] text-[var(--muted)] mt-2 font-medium opacity-70">
            — {notice.postedByName}
          </p>
        </div>
      ))}
    </div>
  );
}
