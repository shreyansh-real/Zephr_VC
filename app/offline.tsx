"use client";

import { motion } from "framer-motion";
import { Wifi, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // If back online, redirect to home
  useEffect(() => {
    if (isOnline) {
      window.location.href = "/";
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
          <img src="/favicon.svg" alt="Sochi" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center space-y-6 max-w-md"
      >
        {/* Offline Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <div className="relative">
            <Wifi className="w-16 h-16 text-[var(--muted)]/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 text-[var(--critical)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black font-display text-[var(--ink)]">
            You're Offline
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed">
            It looks like you've lost your internet connection. Check your connection and try again.
          </p>
        </div>

        {/* Status Info */}
        <div className="p-4 rounded-lg border border-[var(--border-token)] bg-[var(--surface-2)]/50 space-y-2">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            Connection Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--critical)] animate-pulse" />
            <p className="text-sm text-[var(--ink)]">No internet connection</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border-token)] text-[var(--ink)] font-semibold rounded-lg hover:bg-[var(--surface-2)] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>

        {/* Helpful Text */}
        <div className="pt-4 space-y-2 text-sm text-[var(--muted)]">
          <p>While offline, you can still:</p>
          <ul className="space-y-1 text-left">
            <li>• View cached complaint data</li>
            <li>• Access your offline mode</li>
            <li>• Review saved documents</li>
          </ul>
        </div>
      </motion.div>

      {/* Background Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--critical)]/5 rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
}
