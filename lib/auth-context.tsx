"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  linkWithCredential,
  type AuthCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { type Member, type Society, type UserProfile, type UserRole } from "./types";
import { useLanguageStore } from "./language-store";
import { generateInviteCode } from "./utils";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  currentSocietyId: string | null;
  currentSociety: Society | null;
  currentMember: Member | null;
  userSocieties: Array<{ societyId: string; society: Society; member: Member }>;
  pendingSociety: { societyId: string; society: Society; member: Member } | null;
  signInWithGoogle: () => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  linkPhoneNumber: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  switchSociety: (societyId: string) => void;
  createSociety: (params: {
    name: string;
    type: string;
    address: string;
    unitGroups: string[];
    creatorName: string;
  }) => Promise<string>;
  joinSocietyByCode: (params: {
    inviteCode: string;
    unitLabel: string;
    unitGroup: string;
    memberName: string;
  }) => Promise<{ societyId: string; status: "pending" | "active" }>;
  signOut: () => Promise<void>;
  leaveResidence: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSocietyId, setCurrentSocietyId] = useState<string | null>(null);
  const [currentSociety, setCurrentSociety] = useState<Society | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [userSocieties, setUserSocieties] = useState<
    Array<{ societyId: string; society: Society; member: Member }>
  >([]);
  const [pendingSociety, setPendingSociety] = useState<{
    societyId: string;
    society: Society;
    member: Member;
  } | null>(null);

  const { language, setLanguage } = useLanguageStore();

  // Load user profile and societies
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      let userProf: UserProfile;
      if (!userSnap.exists()) {
        userProf = {
          societyIds: [],
          preferredLanguage: language,
        };
        await setDoc(userRef, userProf);
      } else {
        userProf = userSnap.data() as UserProfile;
        if (userProf.preferredLanguage && userProf.preferredLanguage !== language) {
          setLanguage(userProf.preferredLanguage);
        }
      }
      setProfile(userProf);

      // Load all societies user belongs to
      const societiesData: Array<{ societyId: string; society: Society; member: Member }> = [];
      let foundPending: { societyId: string; society: Society; member: Member } | null = null;

      for (const sid of userProf.societyIds || []) {
        try {
          const socSnap = await getDoc(doc(db, "societies", sid));
          const memSnap = await getDoc(doc(db, "societies", sid, "members", uid));

          if (socSnap.exists() && memSnap.exists()) {
            const soc = socSnap.data() as Society;
            const mem = memSnap.data() as Member;

            if (mem.status === "active") {
              societiesData.push({ societyId: sid, society: soc, member: mem });
            } else if (mem.status === "pending") {
              foundPending = { societyId: sid, society: soc, member: mem };
            }
          }
        } catch {
          // If permission fails or society doesn't exist, continue
        }
      }

      setUserSocieties(societiesData);
      setPendingSociety(foundPending);

      // Select active society if not already selected
      const savedSocietyId = typeof window !== "undefined" ? localStorage.getItem("societydesk_sid") : null;
      const targetId =
        savedSocietyId && societiesData.some((s) => s.societyId === savedSocietyId)
          ? savedSocietyId
          : societiesData[0]?.societyId || null;

      if (targetId) {
        setCurrentSocietyId(targetId);
        const match = societiesData.find((s) => s.societyId === targetId);
        if (match) {
          setCurrentSociety(match.society);
          setCurrentMember(match.member);
        }
      } else {
        setCurrentSocietyId(null);
        setCurrentSociety(null);
        setCurrentMember(null);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  }, [language, setLanguage]);

  // Auth State Listener + handle Google redirect result on page load
  useEffect(() => {
    // We resolve this promise BEFORE allowing onAuthStateChanged to set loading=false.
    // This prevents a flash of the login page when returning from Google redirect.
    let resolveRedirect: () => void;
    const redirectPromise = new Promise<void>((res) => { resolveRedirect = res; });

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await loadUserData(result.user.uid);
        }
      })
      .catch((err) => {
        console.error("Redirect result error:", err);
      })
      .finally(() => resolveRedirect());

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Wait for redirect processing to finish before rendering anything
      await redirectPromise;

      setUser(fbUser);
      if (fbUser) {
        await loadUserData(fbUser.uid);
      } else {
        setProfile(null);
        setCurrentSocietyId(null);
        setCurrentSociety(null);
        setCurrentMember(null);
        setUserSocieties([]);
        setPendingSociety(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // Real-time listener for current member & pending member status
  useEffect(() => {
    if (!user) return;

    // Listen to pending society if any
    let unsubPending: (() => void) | undefined;
    if (pendingSociety) {
      const memRef = doc(db, "societies", pendingSociety.societyId, "members", user.uid);
      unsubPending = onSnapshot(memRef, (snap) => {
        if (snap.exists()) {
          const mem = snap.data() as Member;
          if (mem.status === "active") {
            // Member was approved! Reload data
            loadUserData(user.uid);
          }
        }
      });
    }

    // Listen to current member if selected
    let unsubCurrent: (() => void) | undefined;
    if (currentSocietyId) {
      const memRef = doc(db, "societies", currentSocietyId, "members", user.uid);
      unsubCurrent = onSnapshot(memRef, (snap) => {
        if (snap.exists()) {
          setCurrentMember(snap.data() as Member);
        }
      });
    }

    return () => {
      unsubPending?.();
      unsubCurrent?.();
    };
  }, [user, pendingSociety, currentSocietyId, loadUserData]);

  // Switch active society
  const switchSociety = useCallback(
    (societyId: string) => {
      const match = userSocieties.find((s) => s.societyId === societyId);
      if (match) {
        setCurrentSocietyId(societyId);
        setCurrentSociety(match.society);
        setCurrentMember(match.member);
        if (typeof window !== "undefined") {
          localStorage.setItem("societydesk_sid", societyId);
        }
      }
    },
    [userSocieties]
  );

  // Google Sign-In
  // Uses popup on localhost (redirect fails silently on non-hosted origins),
  // uses redirect on production (Firebase Hosting / Vercel).
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (isLocalhost) {
      // Popup works reliably on localhost
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await loadUserData(result.user.uid);
      }
    } else {
      // Redirect works reliably on production (Firebase Hosting)
      await signInWithRedirect(auth, provider);
    }
  };

  // Setup reCAPTCHA for Phone Auth
  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    return new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
    });
  };

  // Send Phone OTP
  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  // Verify Phone OTP
  const verifyOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    const result = await confirmationResult.confirm(code);
    if (result.user) {
      await loadUserData(result.user.uid);
    }
  };

  // Link Google Account to existing Phone account
  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error("No user signed in");
    const provider = new GoogleAuthProvider();
    await linkWithCredential(auth.currentUser, provider as unknown as AuthCredential);
    await loadUserData(auth.currentUser.uid);
  };

  // Link Phone Number to existing Google account
  const linkPhoneNumber = async (confirmationResult: ConfirmationResult, code: string) => {
    if (!auth.currentUser) throw new Error("No user signed in");
    await confirmationResult.confirm(code);
    await loadUserData(auth.currentUser.uid);
  };

  // Create New Society
  const createSociety = async (params: {
    name: string;
    type: string;
    address: string;
    unitGroups: string[];
    creatorName: string;
  }): Promise<string> => {
    if (!user) throw new Error("Authentication required");

    const code = generateInviteCode(8);
    const sid = doc(db, "societies", "_").id; // generate unique id

    await runTransaction(db, async (tx) => {
      const socRef = doc(db, "societies", sid);
      const inviteRef = doc(db, "inviteCodes", code);
      const memberRef = doc(db, "societies", sid, "members", user.uid);
      const userRef = doc(db, "users", user.uid);

      const userSnap = await tx.get(userRef);
      const currentIds: string[] = userSnap.exists()
        ? (userSnap.data() as UserProfile).societyIds || []
        : [];

      // Write society doc
      tx.set(socRef, {
        name: params.name.trim(),
        type: params.type.trim(),
        address: params.address.trim(),
        inviteCode: code,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Write invite code doc
      tx.set(inviteRef, {
        societyId: sid,
      });

      // Write admin member doc
      tx.set(memberRef, {
        name: params.creatorName.trim() || user.displayName || "Admin",
        phone: user.phoneNumber || null,
        email: user.email || null,
        role: "admin" as UserRole,
        unitId: null,
        status: "active",
        joinedAt: serverTimestamp(),
      });

      // Write user profile with society added
      tx.set(
        userRef,
        {
          societyIds: Array.from(new Set([...currentIds, sid])),
          preferredLanguage: language,
        },
        { merge: true }
      );
    });

    // Create initial units if groups were provided
    if (params.unitGroups.length > 0) {
      const batch = writeBatch(db);
      for (const group of params.unitGroups) {
        const trimmed = group.trim();
        if (!trimmed) continue;
        const uRef = doc(db, "societies", sid, "units", doc(db, "societies", sid, "units", "_").id);
        batch.set(uRef, {
          label: trimmed,
          group: trimmed,
          type: "flat",
        });
      }
      await batch.commit();
    }

    await loadUserData(user.uid);
    switchSociety(sid);
    return sid;
  };

  // Join Existing Society via Invite Code
  const joinSocietyByCode = async (params: {
    inviteCode: string;
    unitLabel: string;
    unitGroup: string;
    memberName: string;
  }): Promise<{ societyId: string; status: "pending" | "active" }> => {
    if (!user) throw new Error("Authentication required");

    const code = params.inviteCode.trim().toUpperCase();
    const inviteSnap = await getDoc(doc(db, "inviteCodes", code));

    if (!inviteSnap.exists()) {
      throw new Error("Invalid or expired invite code");
    }

    const { societyId } = inviteSnap.data() as { societyId: string };
    const memberRef = doc(db, "societies", societyId, "members", user.uid);
    const existingMemberSnap = await getDoc(memberRef);

    if (existingMemberSnap.exists()) {
      const existing = existingMemberSnap.data() as Member;
      return { societyId, status: existing.status as "pending" | "active" };
    }

    // Run transaction to join
    await runTransaction(db, async (tx) => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await tx.get(userRef);
      const currentIds: string[] = userSnap.exists()
        ? (userSnap.data() as UserProfile).societyIds || []
        : [];

      // Create member with pending status
      tx.set(memberRef, {
        name: params.memberName.trim() || user.displayName || "Resident",
        phone: user.phoneNumber || null,
        email: user.email || null,
        role: "resident" as UserRole,
        unitId: `${params.unitGroup} - ${params.unitLabel}`.trim(),
        status: "pending",
        joinedAt: serverTimestamp(),
      });

      // Add societyId to user's profile
      tx.set(
        userRef,
        {
          societyIds: Array.from(new Set([...currentIds, societyId])),
          preferredLanguage: language,
        },
        { merge: true }
      );
    });

    await loadUserData(user.uid);
    return { societyId, status: "pending" };
  };

  // Sign Out
  const signOut = async () => {
    await fbSignOut(auth);
    if (typeof window !== "undefined") {
      localStorage.removeItem("societydesk_sid");
      // Clear preloader flag so the next sign-in shows the preloader again
      sessionStorage.removeItem("sochi_welcomed");
    }
  };

  // Leave Residence — sets member status to "removed" in current society,
  // removes the societyId from the user's profile, then reloads.
  const leaveResidence = async () => {
    if (!user || !currentSocietyId) return;
    const memberRef = doc(db, "societies", currentSocietyId, "members", user.uid);
    const userRef = doc(db, "users", user.uid);
    await runTransaction(db, async (tx) => {
      const memSnap = await tx.get(memberRef);
      if (memSnap.exists()) {
        tx.update(memberRef, { status: "removed" });
      }
      const userSnap = await tx.get(userRef);
      if (userSnap.exists()) {
        const ids: string[] = (userSnap.data() as UserProfile).societyIds || [];
        tx.update(userRef, {
          societyIds: ids.filter((id) => id !== currentSocietyId),
        });
      }
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("societydesk_sid");
    }
    await loadUserData(user.uid);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        currentSocietyId,
        currentSociety,
        currentMember,
        userSocieties,
        pendingSociety,
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        verifyOtp,
        linkGoogleAccount,
        linkPhoneNumber,
        switchSociety,
        createSociety,
        joinSocietyByCode,
        signOut,
        leaveResidence,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
