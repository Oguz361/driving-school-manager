"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";

const licenseClasses = [
  {
    id: "b",
    slug: "klasse-b",
    name: "Klasse BE",
    description: "Auto",
    detail: "ab 17½ Jahren",
    highlight: true,
  },
  {
    id: "a",
    slug: "klasse-a",
    name: "Klasse A / A1 / A2",
    description: "Motorrad",
    detail: "ab 16 Jahren (A1)",
    highlight: false,
  },
  {
    id: "mofa",
    slug: "mofa",
    name: "Mofa",
    description: "Mofa-Prüfbescheinigung",
    detail: "keine Behördenanmeldung",
    highlight: false,
  },
  {
    id: "bf17",
    slug: "bf17",
    name: "BF17",
    description: "Begleitetes Fahren",
    detail: "ab 16½ Jahren",
    highlight: false,
  },
  {
    id: "umschreibung",
    slug: "fuehrerschein-umschreibung",
    name: "Umschreibung",
    description: "Ausländischer Führerschein",
    detail: "EU & Nicht-EU",
    highlight: false,
  },
];

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="leistungen" className="py-20 md:py-28 bg-gradient-to-b from-white via-[#0284c7]/[0.03] to-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#0284c7]/5 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium tracking-widest uppercase text-[#71717a] block mb-4">
              03
            </span>
            <div className="w-12 h-px bg-[#e4e4e7] mb-8" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] tracking-tight">
              Führerscheinklassen
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-[#71717a] max-w-md"
          >
            Finde die passende Ausbildung für deine Bedürfnisse. Wir beraten dich gerne.
          </motion.p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {licenseClasses.map((license, index) => {
            // Alternating slide directions: even from left, odd from right
            const direction = index % 2 === 0 ? -30 : 30;
            return (
            <motion.div
              key={license.id}
              initial={{ opacity: 0, x: direction, scale: 0.9 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link href={`/leistungen/${license.slug}`} className="group block">
                <div
                  className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                    license.highlight
                      ? "bg-white border-[#0284c7] border-2"
                      : "bg-white border-[#e4e4e7]"
                  } group-hover:border-[#0284c7] group-hover:shadow-[0_0_20px_rgba(2,132,199,0.3)]`}
                >
                  {/* Popular Badge */}
                  {license.highlight && (
                    <div className="absolute top-6 right-6">
                      <span className="text-xs font-medium tracking-wide uppercase text-[#991b1b]">
                        Beliebt
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-[#0a0a0a]">
                      {license.name}
                    </h3>
                    <p className="text-base mb-1 text-[#71717a]">
                      {license.description}
                    </p>
                    <p className="text-sm text-[#71717a]/70">
                      {license.detail}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#e4e4e7]">
                    <span className="text-sm font-medium text-[#71717a] group-hover:text-[#0284c7] transition-colors duration-300">
                      Mehr erfahren
                    </span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-[#f4f4f5] group-hover:bg-[#0284c7]">
                      <IconArrowUpRight
                        size={18}
                        className="transition-colors duration-300 text-[#71717a] group-hover:text-[#fafafa]"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
