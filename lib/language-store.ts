"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Language, translations, type Translations } from "./i18n";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      t: translations.en,
      setLanguage: async (lang: Language) => {
        set({ language: lang, t: translations[lang] });
        if (typeof document !== "undefined") {
          document.documentElement.lang = lang;
        }

        // If user is logged in, sync to Firestore user profile
        const user = auth.currentUser;
        if (user) {
          try {
            await updateDoc(doc(db, "users", user.uid), {
              preferredLanguage: lang,
            });
          } catch {
            // Non-critical if offline or doc not created yet
          }
        }
      },
    }),
    {
      name: "societydesk-lang",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language] || translations.en;
          if (typeof document !== "undefined") {
            document.documentElement.lang = state.language;
          }
        }
      },
    }
  )
);
