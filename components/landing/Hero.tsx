"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Navbar } from "./Navbar";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Content */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-32 md:py-40">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-6"
            >
              <span className="text-sm font-medium tracking-widest uppercase text-white/70">
                seit GRÜNDUNGSJAHR · DEIN_STANDORT
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-[0.95] mb-8"
            >
              Dein Weg
              <br />
              zum Führerschein
              <br />
              <span className="text-[#0284c7]">beginnt hier.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed mb-10"
            >
              Dein kompetenter Partner für Auto- und Motorradführerschein sowie
              Umschreibung ausländischer Führerscheine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="#kontakt"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0a0a0a] font-medium rounded-full hover:bg-[#0284c7] hover:text-white transition-all duration-300 hover:scale-[1.02]"
              >
                Jetzt starten
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="#leistungen"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-full hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Mehr erfahren
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e4e4e7] to-transparent"
      />
    </section>
  );
}
