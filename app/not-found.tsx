"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
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
        {/* 404 Error Code */}
        <div className="space-y-2">
          <div className="text-6xl sm:text-7xl font-black font-display text-[var(--accent)] tracking-tighter">
            404
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-[var(--ink)]">
            Page Not Found
          </h1>
        </div>

        {/* Description */}
        <p className="text-base text-[var(--muted)] leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border-token)] text-[var(--ink)] font-semibold rounded-lg hover:bg-[var(--surface-2)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </motion.div>

      {/* Background Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
}
