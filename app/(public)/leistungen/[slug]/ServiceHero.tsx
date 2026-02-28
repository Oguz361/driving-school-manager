"use client";

import { motion } from "motion/react";
import type { ServiceDetail } from "@/lib/services-data";

interface ServiceHeroProps {
  service: ServiceDetail;
}

export function ServiceHero({ service }: ServiceHeroProps) {

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Category Badge */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-[#991b1b] bg-red-50 rounded-full uppercase tracking-wide"
          >
            {service.category === "license"
              ? "Führerscheinklasse"
              : service.category === "course"
              ? "Kurs"
              : "Spezielles Angebot"}
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] mb-4"
          >
            {service.heroTitle}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl text-[#71717a] mb-6"
          >
            {service.heroSubtitle}
          </motion.p>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-24 h-1 bg-[#0284c7] mx-auto mb-8 rounded-full"
          />

          {/* Overview */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg text-[#71717a] leading-relaxed max-w-3xl mx-auto"
          >
            {service.overview}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
