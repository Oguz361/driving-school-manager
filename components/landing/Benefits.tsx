"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  IconCertificate,
  IconCalendarEvent,
  IconCar,
  IconMapPin,
} from "@tabler/icons-react";

const benefits = [
  {
    icon: IconCertificate,
    title: "Erfahrene Fahrlehrer",
    description: "Zertifizierte Ausbilder mit jahrelanger Erfahrung.",
  },
  {
    icon: IconCalendarEvent,
    title: "Flexible Zeiten",
    description: "Termine nach deinem Zeitplan.",
  },
  {
    icon: IconCar,
    title: "Moderne Fahrzeuge",
    description: "Aktuelle Fahrzeuge mit Sicherheitsausstattung.",
  },
  {
    icon: IconMapPin,
    title: "Zentrale Lage",
    description: "Zentral gelegen – optimal erreichbar.",
  },
];

export function Benefits() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 bg-white">
      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-sm font-medium tracking-widest uppercase text-[#71717a] block mb-4">
            04
          </span>
          <div className="w-12 h-px bg-[#e4e4e7] mb-8" />
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] tracking-tight">
            Deine Vorteile
          </h2>
        </motion.div>

        {/* Benefits Grid - Horizontal Layout with Dividers */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-0">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative ${
                index > 0 ? "md:pl-8 md:border-l md:border-[#e4e4e7]" : ""
              }`}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full border border-[#e4e4e7] flex items-center justify-center mb-6 group-hover:border-[#0a0a0a] transition-colors duration-300">
                <benefit.icon size={24} className="text-[#0a0a0a]" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">
                {benefit.title}
              </h3>
              <p className="text-[#71717a] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
