"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ status: "accepted", date: new Date().toISOString() })
    );
    setIsVisible(false);
  }

  function handleReject() {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ status: "rejected", date: new Date().toISOString() })
    );
    setIsVisible(false);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0a] border-t border-[#fafafa]/10 shadow-2xl"
        >
          <div className="container mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-sm text-white/80 max-w-2xl">
                Wir verwenden ausschließlich technisch notwendige Cookies, um den
                Betrieb unserer Website sicherzustellen. Mehr Informationen
                findest du in unserer{" "}
                <Link
                  href="/datenschutz"
                  className="text-[#0284c7] underline hover:text-[#fafafa] transition-colors"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleReject}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Ablehnen
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2.5 text-sm font-medium text-[#fafafa] bg-[#991b1b] rounded-lg hover:bg-[#7f1d1d] transition-colors cursor-pointer"
                >
                  Akzeptieren
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
