"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Register service worker for PWA offline support
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={true}
      storageKey="societydesk-theme"
      enableColorScheme={true}
      forcedTheme={undefined}
    >
      <AuthProvider>{children}</AuthProvider>
    </NextThemesProvider>
  );
}
