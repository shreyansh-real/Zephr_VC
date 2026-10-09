"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguageStore } from "@/lib/language-store";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  type ComplaintCategory,
  type ComplaintPriority,
  type ComplaintVisibility,
} from "@/lib/types";
import { compressImage, validateImageFile } from "@/lib/utils";
import {
  Send,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";

export function RaiseComplaintForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { user, currentSocietyId, currentMember } = useAuth();
  const { t } = useLanguageStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("water");
  const [priority, setPriority] = useState<ComplaintPriority>("medium");
  const [visibility, setVisibility] = useState<ComplaintVisibility>("public");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File selection & compression handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 3) {
      setError("Maximum 3 photos are allowed per complaint");
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const f of files) {
      const err = validateImageFile(f);
      if (err) {
        setError(err);
        return;
      }
      try {
        setStatusMessage("Compressing image client-side...");
        const compressed = await compressImage(f, 1.8, 1920);
        newFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        setError("Failed to compress image");
      }
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    setStatusMessage(null);
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentSocietyId) return;

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters long");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const complaintId = doc(
        collection(db, "societies", currentSocietyId, "complaints")
      ).id;

      // Upload photos to Firebase Storage if any
      const photoUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setStatusMessage(`Uploading photo ${i + 1} of ${selectedFiles.length}...`);
        const file = selectedFiles[i];
        const fileRef = ref(
          storage,
          `societies/${currentSocietyId}/complaints/${complaintId}/photo_${Date.now()}_${i}.jpg`
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        photoUrls.push(url);
      }

      setStatusMessage("Saving complaint...");

      // Write complaint document
      const complaintRef = doc(
        db,
        "societies",
        currentSocietyId,
        "complaints",
        complaintId
      );

      await setDoc(complaintRef, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: "open",
        visibility,
        createdBy: user.uid,
        unitId: currentMember?.unitId || null,
        assignedTo: null,
        photos: photoUrls,
        upvoteCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Clear form
      setTitle("");
      setDescription("");
      setSelectedFiles([]);
      setFilePreviews([]);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Complaint submit error:", err);
      const message = err instanceof Error ? err.message : t.common.error;
      setError(message);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-token)] rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-token)]">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-[var(--ink)]">
            {t.complaints.raiseTitle}
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Unit: <strong className="text-[var(--ink)]">{currentMember?.unitId || "General"}</strong>
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] underline min-h-[44px] flex items-center"
          >
            {t.common.cancel}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-[var(--surface-2)] border-2 border-[var(--border-strong)] flex items-start gap-2.5 text-sm text-[var(--ink)]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-1">
            {t.complaints.complaintTitle} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.complaints.titlePlaceholder}
            minLength={5}
            maxLength={200}
            required
            className="w-full h-11 px-3.5 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.complaints.category} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full h-11 px-3 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)]"
            >
              <option value="water">{t.categories.water}</option>
              <option value="electricity">{t.categories.electricity}</option>
              <option value="lift">{t.categories.lift}</option>
              <option value="security">{t.categories.security}</option>
              <option value="cleanliness">{t.categories.cleanliness}</option>
              <option value="parking">{t.categories.parking}</option>
              <option value="noise">{t.categories.noise}</option>
              <option value="other">{t.categories.other}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--ink)] mb-1">
              {t.complaints.priority} *
            </label>
            <div className="grid grid-cols-4 gap-1.5 h-11">
              {(["low", "medium", "high", "critical"] as ComplaintPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-md border text-xs font-bold capitalize transition-all flex items-center justify-center ${
                    priority === p
                      ? "border-2 border-[var(--border-strong)] bg-[var(--surface-2)] shadow-xs"
                      : "border-[var(--border-token)] hover:bg-[var(--surface-2)] opacity-70"
                  }`}
                >
                  {t.priorities[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-1">
            {t.complaints.description} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.complaints.descPlaceholder}
            rows={4}
            minLength={10}
            maxLength={2000}
            required
            className="w-full p-3 rounded-md border border-[var(--border-token)] bg-[var(--surface)] text-[var(--ink)] text-sm font-medium focus:border-[var(--border-strong)] transition-colors resize-y"
          />
        </div>

        {/* Visibility: Public vs Private — only staff can set Private */}
        {(currentMember?.role === "admin" || currentMember?.role === "volunteer") && (
        <div>
          <label className="block text-sm font-bold text-[var(--ink)] mb-2">
            {t.complaints.visibility}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`p-3.5 text-left rounded-md border-2 transition-all flex items-start gap-2.5 ${
                visibility === "public"
                  ? "border-[var(--border-strong)] bg-[var(--surface-2)]"
                  : "border-[var(--border-token)] opacity-70 hover:opacity-100"
              }`}
            >
              <Globe className="w-5 h-5 shrink-0 text-[var(--ink)] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{t.complaints.visibilityPublic}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{t.complaints.visibilityPublicHelp}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`p-3.5 text-left rounded-md border-2 transition-all flex items-start gap-2.5 ${
                visibility === "private"
                  ? "border-[var(--border-strong)] bg-[var(--surface-2)]"
                  : "border-[var(--border-token)] opacity-70 hover:opacity-100"
              }`}
            >
              <Lock className="w-5 h-5 shrink-0 text-[var(--ink)] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{t.complaints.visibilityPrivate}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{t.complaints.visibilityPrivateHelp}</p>
              </div>
            </button>
          </div>
        </div>
        )}

        {/* Photos Attachment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-[var(--ink)]">
              {t.complaints.photos}
            </label>
            <span className="text-xs text-[var(--muted)] font-medium">
              {selectedFiles.length}/3 photos
            </span>
          </div>

          {/* Previews */}
          {filePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {filePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-md overflow-hidden border border-[var(--border-token)] bg-[var(--surface-2)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-[var(--ink)] text-[var(--ink-inverse)] opacity-90 hover:opacity-100 min-h-[30px] min-w-[30px] flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length < 3 && (
            <label className="flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-[var(--border-token)] hover:border-[var(--border-strong)] cursor-pointer bg-[var(--surface-2)] transition-colors min-h-[50px]">
              <Upload className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs font-bold text-[var(--ink)]">
                Click to add photos (compressed to &le; 1.8MB automatically)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-4 px-4 rounded-md bg-[var(--ink)] text-[var(--ink-inverse)] font-bold text-base flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage || t.complaints.submitting}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.complaints.raiseTitle}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
